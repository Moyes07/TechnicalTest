import { Injectable, HttpStatus } from '@nestjs/common';
import { ParentsRepository } from './parents.repository';
import { Parent } from './parent.entity';
import {
  BusinessException,
  ErrorCodes,
} from '../common/filters/http-exception.filter';

@Injectable()
export class ParentsService {
  constructor(private readonly repo: ParentsRepository) {}

  async findAll(): Promise<Parent[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<Parent> {
    const parent = await this.repo.findById(id);
    if (!parent) {
      throw new BusinessException(
        ErrorCodes.PARENT_NOT_FOUND,
        `Parent with id "${id}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return parent;
  }

  async deductWalletBalance(parentId: string, amount: number): Promise<Parent> {
    const parent = await this.findById(parentId);

    if (parent.walletBalance < amount) {
      throw new BusinessException(
        ErrorCodes.INSUFFICIENT_BALANCE,
        `Insufficient wallet balance. Required: Rs.${amount.toFixed(2)}, Available: Rs.${parent.walletBalance.toFixed(2)}`,
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    const updated: Parent = {
      ...parent,
      walletBalance: parseFloat((parent.walletBalance - amount).toFixed(2)),
    };

    return this.repo.save(updated);
  }
}
