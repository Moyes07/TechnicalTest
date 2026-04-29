import { Injectable, HttpStatus } from '@nestjs/common';
import { OrdersRepository } from './order.repository';
import { StudentsService } from '../students/students.service';
import { ParentsService } from '../parents/parents.service';
import { MenuService } from '../menu/menu.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order, OrderItem } from './order.entity';
import { MenuItem } from '../menu/menu-item.entity';
import {
  BusinessException,
  ErrorCodes,
} from '../common/filters/http-exception.filter';

@Injectable()
export class OrdersService {
  constructor(
    private readonly repo: OrdersRepository,
    private readonly studentsService: StudentsService,
    private readonly parentsService: ParentsService,
    private readonly menuService: MenuService,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<Order> {
    const order = await this.repo.findById(id);
    if (!order) {
      throw new BusinessException(
        ErrorCodes.ORDER_NOT_FOUND,
        `Order with id "${id}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return order;
  }

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const student = await this.studentsService.findById(dto.studentId);
    const parent = await this.parentsService.findById(student.parentId);

    const menuItemMap = await this.getMenuItemMap(dto);

    this.validateItemAvailability(dto, menuItemMap);
    this.validateAllergenConflicts(
      dto,
      menuItemMap,
      student.allergens,
      student.name,
    );

    const orderItems = this.buildOrderItems(dto, menuItemMap);
    const total = this.calculateOrderTotal(orderItems);

    await this.parentsService.deductWalletBalance(parent.id, total);

    const order = this.buildOrder(student.id, parent.id, orderItems, total);
    return this.repo.save(order);
  }

  private async getMenuItemMap(
    dto: CreateOrderDto,
  ): Promise<Map<string, MenuItem>> {
    const uniqueItemIds = [
      ...new Set(dto.items.map((item) => item.menuItemId)),
    ];
    const menuItems = await this.menuService.findManyById(uniqueItemIds);
    return new Map<string, MenuItem>(menuItems.map((item) => [item.id, item]));
  }

  private validateItemAvailability(
    dto: CreateOrderDto,
    menuItemMap: Map<string, MenuItem>,
  ): void {
    const unavailableItems = dto.items
      .map((items) => menuItemMap.get(items.menuItemId))
      .filter((item): item is MenuItem => !!item && !item.available);

    if (unavailableItems.length > 0) {
      const names = unavailableItems.map((item) => item.name).join(', ');
      throw new BusinessException(
        ErrorCodes.ITEM_UNAVAILABLE,
        `The following item(s) are currently unavailable: ${names}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  private validateAllergenConflicts(
    dto: CreateOrderDto,
    menuItemMap: Map<string, MenuItem>,
    studentAllergenList: string[],
    studentName: string,
  ): void {
    const studentAllergens = new Set(
      studentAllergenList.map((allergen) => allergen.toLowerCase()),
    );

    for (const dtoItem of dto.items) {
      const menuItem = menuItemMap.get(dtoItem.menuItemId);
      if (!menuItem) continue;

      const conflicts = menuItem.allergens.filter((allergen) =>
        studentAllergens.has(allergen.toLowerCase()),
      );

      if (conflicts.length > 0) {
        throw new BusinessException(
          ErrorCodes.ALLERGEN_CONFLICT,
          `"${menuItem.name}" contains allergen(s) [${conflicts.join(', ')}] that conflict with ${studentName}'s dietary requirements`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
    }
  }

  private buildOrderItems(
    dto: CreateOrderDto,
    menuItemMap: Map<string, MenuItem>,
  ): OrderItem[] {
    return dto.items
      .map((item) => {
        const menuItem = menuItemMap.get(item.menuItemId);
        if (!menuItem) return null;

        const lineTotal = this.roundToTwo(menuItem.price * item.quantity);
        return {
          menuItemId: menuItem.id,
          menuItemName: menuItem.name,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          lineTotal,
        } satisfies OrderItem;
      })
      .filter((item): item is OrderItem => !!item);
  }

  private calculateOrderTotal(orderItems: OrderItem[]): number {
    return this.roundToTwo(
      orderItems.reduce((sum, item) => sum + item.lineTotal, 0),
    );
  }

  private buildOrder(
    studentId: string,
    parentId: string,
    items: OrderItem[],
    total: number,
  ): Order {
    return {
      id: this.repo.generateId(),
      studentId,
      parentId,
      items,
      total,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };
  }

  private roundToTwo(value: number): number {
    return Number(value.toFixed(2));
  }
}
