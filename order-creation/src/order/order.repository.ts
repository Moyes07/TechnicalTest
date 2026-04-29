import { Injectable } from '@nestjs/common';
import { Order } from './order.entity';

@Injectable()
export class OrdersRepository {
  private readonly store = new Map<string, Order>();
  private counter = 1;

  generateId(): string {
    return `order-${this.counter++}`;
  }

  save(order: Order): Order {
    this.store.set(order.id, { ...order });
    return this.store.get(order.id)!;
  }

  findById(id: string): Order | undefined {
    return this.store.get(id);
  }

  findAll(): Order[] {
    return Array.from(this.store.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  findByStudentId(studentId: string): Order[] {
    return this.findAll().filter((o) => o.studentId === studentId);
  }
}