import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class StudentDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^student\d+$/, {
    message: 'id must match format: student<number>',
  })
  id: string;
}
