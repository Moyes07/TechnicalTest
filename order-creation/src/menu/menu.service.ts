import { Injectable, HttpStatus } from '@nestjs/common';
import { MenuRepository } from './menu.repository';
import { MenuItem } from './menu-item.entity';
import { BusinessException, ErrorCodes } from '../common/filters/http-exception.filter';

@Injectable()
export class MenuService {
  constructor(private readonly repo: MenuRepository) {}

  findAll(): MenuItem[] {
    return this.repo.findAll();
  }

  findById(id: string): MenuItem {
    const item = this.repo.findById(id);
    if (!item) {
      throw new BusinessException(
        ErrorCodes.MENU_ITEM_NOT_FOUND,
        `Menu item with id "${id}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return item;
  }

  /**
   * Resolve multiple menu items by ID in one call.
   * Fails fast with NOT_FOUND if any item is missing.
   */
  findManyById(ids: string[]): MenuItem[] {
    return ids.map((id) => this.findById(id));
  }
}