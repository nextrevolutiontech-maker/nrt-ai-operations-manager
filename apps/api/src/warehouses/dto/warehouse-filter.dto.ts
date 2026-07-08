import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { WarehouseStatus } from '@nrt-ai-workforce/database';

export class WarehouseFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by Status',
    enum: WarehouseStatus,
  })
  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus;
}
