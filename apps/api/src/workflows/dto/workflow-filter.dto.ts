import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { WorkflowStatus } from '@nrt-ai-workforce/database';

export class WorkflowFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by Module' })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: 'Filter by Status',
    enum: WorkflowStatus,
  })
  @IsOptional()
  @IsEnum(WorkflowStatus)
  status?: WorkflowStatus;
}
