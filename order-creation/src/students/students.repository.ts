import { Injectable } from '@nestjs/common';
import { Student } from './student.entity';

@Injectable()
export class StudentsRepository {
  private readonly store = new Map<string, Student>([
    [
      'student-1',
      {
        id: 'student-1',
        name: 'Sam John',
        allergens: ['nuts'],
        parentId: 'parent-1',
      },
    ],
  ]);

  findAll(): Student[] {
    return Array.from(this.store.values());
  }

  findById(id: string): Student | undefined {
    return this.store.get(id);
  }

  save(student: Student): Student {
    this.store.set(student.id, { ...student });
    return this.store.get(student.id)!;
  }
}