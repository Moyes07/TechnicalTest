import { Injectable } from '@nestjs/common';
import { MenuItem } from './menu-item.entity';

@Injectable()
export class MenuRepository {
  private readonly store = new Map<string, MenuItem>([
    [
      'item1',
      {
        id: 'item1',
        name: 'Peanut Butter Cookie',
        price: 1.5,
        allergens: ['nuts', 'gluten'],
        available: true,
      },
    ],
    [
      'item2',
      {
        id: 'item2',
        name: 'Fresh Apple Juice',
        price: 2.0,
        allergens: [],
        available: true,
      },
    ],
    [
      'item3',
      {
        id: 'item3',
        name: 'Cheese Sandwich',
        price: 3.5,
        allergens: ['gluten', 'dairy'],
        available: true,
      },
    ],
    [
      'item4',
      {
        id: 'item4',
        name: 'Seasonal Soup',
        price: 4.0,
        allergens: [],
        available: false,
      },
    ],
  ]);

  async findAll(): Promise<MenuItem[]> {
    return Promise.resolve(Array.from(this.store.values()));
  }

  async findById(id: string): Promise<MenuItem | undefined> {
    return Promise.resolve(this.store.get(id));
  }

  async save(item: MenuItem): Promise<MenuItem> {
    this.store.set(item.id, { ...item });
    return Promise.resolve(this.store.get(item.id)!);
  }
}
