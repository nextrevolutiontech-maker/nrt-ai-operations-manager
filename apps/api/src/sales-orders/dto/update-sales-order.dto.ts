import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSalesOrderDto } from './create-sales-order.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { SalesOrderStatus } from '@nrt-ai-workforce/database';

export class UpdateSalesOrderDto extends PartialType(CreateSalesOrderDto) {
  @ApiPropertyOptional({ enum: SalesOrderStatus })
  @IsEnum(SalesOrderStatus)
  @IsOptional()
  status?: SalesOrderStatus;
}
