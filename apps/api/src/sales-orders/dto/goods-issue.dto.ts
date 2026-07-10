import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GoodsIssueItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  salesOrderItemId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  quantityToDeliver: number;
}

export class GoodsIssueDto {
  @ApiProperty({ type: [GoodsIssueItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GoodsIssueItemDto)
  items: GoodsIssueItemDto[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
