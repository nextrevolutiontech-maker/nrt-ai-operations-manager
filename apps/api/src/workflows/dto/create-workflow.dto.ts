import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApprovalType, WorkflowStatus } from '@nrt-ai-workforce/database';

export class CreateApprovalLevelDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  levelNumber: number;

  @ApiProperty()
  @IsUUID()
  roleId: string;

  @ApiProperty({ enum: ApprovalType, default: ApprovalType.SINGLE })
  @IsEnum(ApprovalType)
  @IsOptional()
  approvalType?: ApprovalType;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  minApprovers?: number;

  @ApiPropertyOptional({ default: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  sequence?: number;
}

export class CreateWorkflowDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({ enum: WorkflowStatus, default: WorkflowStatus.ACTIVE })
  @IsEnum(WorkflowStatus)
  @IsOptional()
  status?: WorkflowStatus;

  @ApiProperty({ type: [CreateApprovalLevelDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateApprovalLevelDto)
  levels: CreateApprovalLevelDto[];
}
