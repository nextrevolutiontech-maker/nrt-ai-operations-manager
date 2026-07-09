import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsObject } from 'class-validator';
import { WidgetType } from '@nrt-ai-workforce/database';

export class CreateWidgetDto {
  @ApiProperty({ enum: WidgetType })
  @IsEnum(WidgetType)
  @IsNotEmpty()
  type: WidgetType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  layout: Record<string, any>;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  config: Record<string, any>;
}
