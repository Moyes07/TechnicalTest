import { Injectable } from '@nestjs/common';
import { Student } from './student.entity';

@Injectable()
export class StudentsRepository {
  private readonly store = new Map<string, Student>([
    [
      'student1',
      {
        id: 'student1',
        name: 'Sam John',
        allergens: ['nuts'],
        parentId: 'parent1',
      },
    ],
  ]);

  async findAll(): Promise<Student[]> {
    return Promise.resolve(Array.from(this.store.values()));
  }

  async findById(id: string): Promise<Student | undefined> {
    return Promise.resolve(this.store.get(id));
  }

  async save(student: Student): Promise<Student> {
    this.store.set(student.id, { ...student });
    return Promise.resolve(this.store.get(student.id)!);
  }
}
