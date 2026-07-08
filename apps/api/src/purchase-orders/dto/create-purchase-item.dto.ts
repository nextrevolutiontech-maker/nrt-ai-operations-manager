import { IsNumber, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseItemDto {
  @ApiProperty({ description: 'The ID of the Product' })
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Quantity ordered' })
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiProperty({ description: 'Unit Cost' })
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiPropertyOptional({
    description: 'Discount percentage (0-100)',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax percentage (0-100)', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;
}
