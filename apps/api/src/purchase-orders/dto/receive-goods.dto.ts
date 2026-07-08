import {
  IsUUID,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiveItemDto {
  @ApiProperty({ description: 'The ID of the PurchaseItem being received' })
  @IsUUID()
  purchaseItemId: string;

  @ApiProperty({ description: 'Quantity being received in this transaction' })
  @IsNumber()
  @Min(0.01)
  quantityToReceive: number;
}

export class ReceiveGoodsDto {
  @ApiProperty({
    type: [ReceiveItemDto],
    description: 'List of items to receive',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReceiveItemDto)
  items: ReceiveItemDto[];
}
