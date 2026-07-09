import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApprovalActionType } from '@nrt-ai-workforce/database';

export class ProcessActionDto {
  @ApiProperty({ enum: ApprovalActionType })
  @IsEnum(ApprovalActionType)
  action: ApprovalActionType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  comment?: string;
}
