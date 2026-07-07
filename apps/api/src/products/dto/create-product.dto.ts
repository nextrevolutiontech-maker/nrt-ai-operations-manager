import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsUUID, MaxLength, Min, IsArray } from 'class-validator';
import { ProductStatus } from '@nrt-ai-workforce/database';

export class CreateProductDto {
  @ApiPropertyOptional({ description: 'SKU. Auto-generated if not provided' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  sku?: string;

  @ApiPropertyOptional({ description: 'Barcode' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  barcode?: string;

  @ApiProperty({ description: 'Product Name' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ description: 'Product Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({ description: 'Brand ID' })
  @IsOptional()
  @IsUUID()
  brandId?: string;

  @ApiProperty({ description: 'Unit ID' })
  @IsNotEmpty()
  @IsUUID()
  unitId: string;

  @ApiProperty({ description: 'Selling Price' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Cost Price' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiPropertyOptional({ description: 'Minimum Stock Level', default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockLevel?: number = 0;

  @ApiPropertyOptional({ description: 'Maximum Stock Level' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  maxStockLevel?: number;

  @ApiPropertyOptional({ description: 'Reorder Level', default: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderLevel?: number = 0;

  @ApiPropertyOptional({ description: 'Product Image URL (Placeholder)' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Array of tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Product Status', enum: ProductStatus, default: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus = ProductStatus.ACTIVE;
}
