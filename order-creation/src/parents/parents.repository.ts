import { Injectable } from '@nestjs/common';
import { Parent } from './parent.entity';

@Injectable()
export class ParentsRepository {
  private readonly store = new Map<string, Parent>([
    ['parent1', { id: 'parent1', name: 'Sara John', walletBalance: 50 }],
  ]);

  async findAll(): Promise<Parent[]> {
    return Promise.resolve(Array.from(this.store.values()));
  }

  async findById(id: string): Promise<Parent | undefined> {
    return Promise.resolve(this.store.get(id));
  }

  async save(parent: Parent): Promise<Parent> {
    this.store.set(parent.id, { ...parent });
    return Promise.resolve(this.store.get(parent.id)!);
  }
}
