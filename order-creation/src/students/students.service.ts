import { Injectable, HttpStatus } from '@nestjs/common';
import { StudentsRepository } from './students.repository';
import { Student } from './student.entity';
import {
  BusinessException,
  ErrorCodes,
} from '../common/filters/http-exception.filter';

@Injectable()
export class StudentsService {
  constructor(private readonly repo: StudentsRepository) {}

  async findAll(): Promise<Student[]> {
    return this.repo.findAll();
  }

  async findById(id: string): Promise<Student> {
    const student = await this.repo.findById(id);
    if (!student) {
      throw new BusinessException(
        ErrorCodes.STUDENT_NOT_FOUND,
        `Student with id "${id}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return student;
  }
}
