import { Controller, Get, Param } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuDto } from './dto/menu.dto';

@Controller('menu')
export class MenuController {
  constructor(private readonly service: MenuService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param() params: MenuDto) {
    return this.service.findById(params.id);
  }
}
