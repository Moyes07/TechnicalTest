import { Module } from '@nestjs/common';
import { OrdersController } from './order.controller';
import { OrdersService } from './order.service';
import { OrdersRepository } from './order.repository';
import { StudentsModule } from '../students/students.module';
import { ParentsModule } from '../parents/parents.module';
import { MenuModule } from '../menu/menu.module';

@Module({
  imports: [StudentsModule, ParentsModule, MenuModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersRepository],
})
export class OrdersModule {}