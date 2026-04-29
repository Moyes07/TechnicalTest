import { Injectable, HttpStatus } from '@nestjs/common';
import { MenuRepository } from './menu.repository';
import { MenuItem } from './menu-item.entity';
import {
  BusinessException,
  ErrorCodes,
} from '../common/filters/http-exception.filter';

@Injectable()
export class MenuService {
  constructor(private readonly repo: MenuRepository) {}

  async findAll(): Promise<MenuItem[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<MenuItem> {
    const item = await this.repo.findById(id);
    if (!item) {
      throw new BusinessException(
        ErrorCodes.MENU_ITEM_NOT_FOUND,
        `Menu item with id "${id}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return item;
  }

  async findManyById(ids: string[]): Promise<MenuItem[]> {
    return Promise.all(ids.map((id) => this.findById(id)));
  }
}
