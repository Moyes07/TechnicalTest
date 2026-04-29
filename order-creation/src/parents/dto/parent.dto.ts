import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class ParentDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^parent\d+$/, { message: 'id must match format: parent<number>' })
  id: string;
}
