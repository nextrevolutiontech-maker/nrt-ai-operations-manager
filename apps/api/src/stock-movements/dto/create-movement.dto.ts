import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  IsEnum,
} from 'class-validator';
import { MovementType } from '@nrt-ai-workforce/database';

export class CreateMovementDto {
  @ApiProperty({ description: 'ID of the warehouse' })
  @IsNotEmpty()
  @IsUUID()
  warehouseId: string;

  @ApiProperty({ description: 'ID of the product' })
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @ApiProperty({ description: 'Type of movement', enum: MovementType })
  @IsNotEmpty()
  @IsEnum(MovementType)
  type: MovementType;

  @ApiProperty({
    description:
      'Quantity to move (always positive, type determines direction)',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Optional reference like PO Number or Ticket ID',
  })
  @IsOptional()
  @IsString()
  reference?: string;

  @ApiPropertyOptional({ description: 'Optional notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Target warehouse ID (REQUIRED ONLY for TRANSFER_OUT)',
  })
  @IsOptional()
  @IsUUID()
  targetWarehouseId?: string;
}
