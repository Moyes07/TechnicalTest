import { Controller, Get, Param } from '@nestjs/common';
import { ParentsService } from './parents.service';
import { ParentDto } from './dto/parent.dto';

@Controller('parents')
export class ParentsController {
  constructor(private readonly service: ParentsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param() params: ParentDto) {
    return this.service.findById(params.id);
  }
}
