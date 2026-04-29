import { Controller, Get, Param } from '@nestjs/common';
import { StudentsService } from './students.service';
import { StudentDto } from './dto/student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param() params: StudentDto) {
    return this.service.findById(params.id);
  }
}
