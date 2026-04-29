import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class MenuDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^item\d+$/, { message: 'id must match format: item<number>' })
  id: string;
}
