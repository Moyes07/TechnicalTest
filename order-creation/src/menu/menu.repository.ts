import { Injectable } from '@nestjs/common';
import { MenuItem } from './menu-item.entity';

@Injectable()
export class MenuRepository {
  private readonly store = new Map<string, MenuItem>([
    [
      'item-1',
      {
        id: 'item-1',
        name: 'Peanut Butter Cookie',
        price: 1.5,
        allergens: ['nuts', 'gluten'],
        available: true,
      },
    ],
    [
      'item-2',
      {
        id: 'item-2',
        name: 'Fresh Apple Juice',
        price: 2.0,
        allergens: [],
        available: true,
      },
    ],
    [
      'item-3',
      {
        id: 'item-3',
        name: 'Cheese Sandwich',
        price: 3.5,
        allergens: ['gluten', 'dairy'],
        available: true,
      },
    ],
    [
      'item-4',
      {
        id: 'item-4',
        name: 'Seasonal Soup',
        price: 4.0,
        allergens: [],
        available: false,   // Seeded as unavailable to demonstrate that check
      },
    ],
  ]);

  findAll(): MenuItem[] {
    return Array.from(this.store.values());
  }

  findById(id: string): MenuItem | undefined {
    return this.store.get(id);
  }

  save(item: MenuItem): MenuItem {
    this.store.set(item.id, { ...item });
    return this.store.get(item.id)!;
  }
}