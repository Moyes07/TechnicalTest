import { Injectable, HttpStatus } from '@nestjs/common';
import { OrdersRepository } from './order.repository';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
import { MenuService } from '../menu/menu.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderItem } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';
import { BusinessException, ErrorCodes } from '../common/filters/http-exception.filter';

@Injectable()
export class OrdersService {
  constructor(
    private readonly repo: OrdersRepository,
    private readonly studentsService: StudentsService,
    private readonly parentsService: ParentsService,
    private readonly menuService: MenuService,
  ) {}

  findAll(): Order[] {
    return this.repo.findAll();
  }

  findById(id: string): Order {
    const order = this.repo.findById(id);
    if (!order) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        `Order with id "${id}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return order;
  }

  /**
   * Creates an order after applying all business-rule guards:
   *
   *   1. Resolve entities — student, parent, menu items (throws 404 on missing)
   *   2. Availability check  — any unavailable item → ITEM_UNAVAILABLE
   *   3. Allergen check      — any allergen overlap  → ALLERGEN_CONFLICT
   *   4. Balance check       — parent balance < total → INSUFFICIENT_BALANCE
   *   5. Wallet deduction    — update parent balance
   *   6. Persist order
   *
   * Transaction semantics (in-memory):
   *   Node.js is single-threaded; steps 5 and 6 execute synchronously with no
   *   await between them, so there is no observable intermediate state within
   *   a single process. In a real Postgres-backed system you would wrap steps
   *   5 and 6 in a BEGIN / COMMIT block (or a TypeORM QueryRunner) so that a
   *   crash between the two steps can never leave the wallet debited without
   *   an order record — or an order record without a corresponding debit.
   */
  createOrder(dto: CreateOrderDto): Order {
    // ── 1. Resolve entities ───────────────────────────────────────────────
    const student = this.studentsService.findById(dto.studentId);
    const parent = this.parentsService.findById(student.parentId);
    const uniqueItemIds = [...new Set(dto.items.map((i) => i.menuItemId))];
    const menuItemMap = new Map<string, MenuItem>(
      uniqueItemIds.map((id) => [id, this.menuService.findById(id)]),
    );

    // ── 2. Availability check ─────────────────────────────────────────────
    const unavailableItems = dto.items.filter(
      (i) => !menuItemMap.get(i.menuItemId)!.available,
    );
    if (unavailableItems.length > 0) {
      const names = unavailableItems
        .map((i) => menuItemMap.get(i.menuItemId)!.name)
        .join(', ');
      throw new BusinessException(
        ErrorCodes.ITEM_UNAVAILABLE,
        `The following item(s) are currently unavailable: ${names}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // ── 3. Allergen check ─────────────────────────────────────────────────
    const studentAllergens = new Set(
      student.allergens.map((a) => a.toLowerCase()),
    );

    for (const orderItem of dto.items) {
      const menuItem = menuItemMap.get(orderItem.menuItemId)!;
      const conflicts = menuItem.allergens.filter((a) =>
        studentAllergens.has(a.toLowerCase()),
      );
      if (conflicts.length > 0) {
        throw new BusinessException(
          ErrorCodes.ALLERGEN_CONFLICT,
          `"${menuItem.name}" contains allergen(s) [${conflicts.join(', ')}] that conflict with ${student.name}'s dietary requirements`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }

    // ── 4. Calculate total ────────────────────────────────────────────────
    const orderItems: OrderItem[] = dto.items.map((i) => {
      const menuItem = menuItemMap.get(i.menuItemId)!;
      const lineTotal = parseFloat((menuItem.price * i.quantity).toFixed(2));
      return {
        menuItemId: menuItem.id,
        menuItemName: menuItem.name,
        quantity: i.quantity,
        unitPrice: menuItem.price,
        lineTotal,
      };
    });

    const total = parseFloat(
      orderItems.reduce((sum, i) => sum + i.lineTotal, 0).toFixed(2),
    );

    // ── 5. Balance check is inside deductWalletBalance (throws if fails) ──
    // ── 5 + 6. Deduct wallet then persist (atomic in single-threaded JS) ──
    this.parentsService.deductWalletBalance(parent.id, total);

    const order: Order = {
      id: this.repo.generateId(),
      studentId: student.id,
      parentId: parent.id,
      items: orderItems,
      total,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    return this.repo.save(order);
  }
}