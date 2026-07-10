import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { CustomerStatus } from '@nrt-ai-workforce/database';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiPropertyOptional({ enum: CustomerStatus })
  @IsEnum(CustomerStatus)
  @IsOptional()
  status?: CustomerStatus;
}
