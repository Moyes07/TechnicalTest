import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ParentsModule } from './parents/parents.module';
import { StudentsModule } from './students/students.module';
import { MenuModule } from './menu/menu.module';
import { OrdersModule } from './order/order.module';

@Module({
  imports: [ParentsModule, StudentsModule, MenuModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
