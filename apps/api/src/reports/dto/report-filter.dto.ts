import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

export class ReportFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  module?: string;
}

export class GenerateReportDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  sortColumn?: string;
}
