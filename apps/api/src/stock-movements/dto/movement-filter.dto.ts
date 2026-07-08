import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { MovementType } from '@nrt-ai-workforce/database';

export class MovementFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by Warehouse ID' })
  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @ApiPropertyOptional({ description: 'Filter by Product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({
    description: 'Filter by Movement Type',
    enum: MovementType,
  })
  @IsOptional()
  @IsEnum(MovementType)
  type?: MovementType;
}
