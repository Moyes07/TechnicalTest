import { Injectable } from '@nestjs/common';
import { Order } from './order.entity';

@Injectable()
export class OrdersRepository {
  private readonly store = new Map<string, Order>();
  private counter = 1;

  generateId(): string {
    return `order-${this.counter++}`;
  }

  async save(order: Order): Promise<Order> {
    this.store.set(order.id, { ...order });
    return Promise.resolve(this.store.get(order.id)!);
  }

  async findById(id: string): Promise<Order | undefined> {
    return Promise.resolve(this.store.get(id));
  }

  async findAll(): Promise<Order[]> {
    return Promise.resolve(
      Array.from(this.store.values()).sort(
        (item1, item2) =>
          new Date(item2.createdAt).getTime() -
          new Date(item1.createdAt).getTime(),
      ),
    );
  }

  async findByStudentId(studentId: string): Promise<Order[]> {
    const orders = await this.findAll();
    return orders.filter((order) => order.studentId === studentId);
  }
}
