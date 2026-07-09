import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { NotificationType, PriorityLevel } from '@nrt-ai-workforce/database';

export class NotificationFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: NotificationType })
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @ApiPropertyOptional({ enum: PriorityLevel })
  @IsEnum(PriorityLevel)
  @IsOptional()
  priority?: PriorityLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({ description: 'Filter by read status (true/false)' })
  @IsOptional()
  @IsBooleanString()
  isRead?: string;
}
