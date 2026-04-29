import { IsString, IsInt, Min } from 'class-validator';

export class OrderItemDto {
  @IsString()
  menuItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;
}
