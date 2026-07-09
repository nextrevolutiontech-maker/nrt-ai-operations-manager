import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { DashboardStatus } from '@nrt-ai-workforce/database';

export class DashboardFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  module?: string;

  @ApiPropertyOptional({ enum: DashboardStatus })
  @IsEnum(DashboardStatus)
  @IsOptional()
  status?: DashboardStatus;
}
