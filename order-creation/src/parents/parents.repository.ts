import { Injectable } from '@nestjs/common';
import { Parent } from './parent.entity';

/**
 * In-memory store for parents.
 *
 * Seeded with one parent holding £50 in their wallet.
 * In a real system this would be a TypeORM repository backed by Postgres.
 *
 * Concurrency note: Node.js is single-threaded so there is no risk of a
 * classic race condition here. In a real multi-instance deployment we would
 * use a database-level SELECT FOR UPDATE (or an optimistic-lock version column)
 * to guard the wallet-deduction against concurrent requests.
 */
@Injectable()
export class ParentsRepository {
  private readonly store = new Map<string, Parent>([
    [
      'parent-1',
      { id: 'parent-1', name: 'Sara John', walletBalance: 50 },
    ],
  ]);

  findAll(): Parent[] {
    return Array.from(this.store.values());
  }

  findById(id: string): Parent | undefined {
    return this.store.get(id);
  }

  save(parent: Parent): Parent {
    this.store.set(parent.id, { ...parent });
    return this.store.get(parent.id)!;
  }
}