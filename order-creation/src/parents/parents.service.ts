import { Injectable, HttpStatus } from '@nestjs/common';
import { ParentsRepository } from './parents.repository';
import { Parent } from './parent.entity';
import { BusinessException, ErrorCodes } from '../common/filters/http-exception.filter';

@Injectable()
export class ParentsService {
  constructor(private readonly repo: ParentsRepository) {}

  findAll(): Parent[] {
    return this.repo.findAll();
  }

  findById(id: string): Parent {
    const parent = this.repo.findById(id);
    if (!parent) {
      throw new BusinessException(
        ErrorCodes.PARENT_NOT_FOUND,
        `Parent with id "${id}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return parent;
  }

  /**
   * Deducts amount from parent wallet.
   * Called by OrdersService inside what would be a DB transaction.
   * Returns the updated parent for the caller's confirmation.
   */
  deductWalletBalance(parentId: string, amount: number): Parent {
    const parent = this.findById(parentId);

    if (parent.walletBalance < amount) {
      throw new BusinessException(
        ErrorCodes.INSUFFICIENT_BALANCE,
        `Insufficient wallet balance. Required: £${amount.toFixed(2)}, Available: £${parent.walletBalance.toFixed(2)}`,
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