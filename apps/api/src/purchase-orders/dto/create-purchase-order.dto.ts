import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePurchaseItemDto } from './create-purchase-item.dto';

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'The ID of the Supplier' })
  @IsUUID()
  supplierId: string;

  @ApiProperty({ description: 'The ID of the Warehouse for receiving' })
  @IsUUID()
  warehouseId: string;

  @ApiProperty({ description: 'Order date' })
  @IsDateString()
  orderDate: string;

  @ApiPropertyOptional({ description: 'Expected delivery date' })
  @IsOptional()
  @IsDateString()
  expectedDeliveryDate?: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    type: [CreatePurchaseItemDto],
    description: 'List of items to purchase',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];
}
