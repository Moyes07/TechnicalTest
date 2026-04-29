import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class OrderDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^order-\d+$/, {
    message: 'id must match format: order-<number>',
  })
  id: string;
}
