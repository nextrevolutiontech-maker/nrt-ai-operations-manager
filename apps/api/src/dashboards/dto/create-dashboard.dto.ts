import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { DashboardStatus } from '@nrt-ai-workforce/database';

export class CreateDashboardDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: DashboardStatus,
    default: DashboardStatus.ACTIVE,
  })
  @IsEnum(DashboardStatus)
  @IsOptional()
  status?: DashboardStatus;
}
