import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAccountDto } from './create-account.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { AccountStatus } from '@nrt-ai-workforce/database';

export class UpdateAccountDto extends PartialType(CreateAccountDto) {
  @ApiPropertyOptional({ enum: AccountStatus })
  @IsEnum(AccountStatus)
  @IsOptional()
  status?: AccountStatus;
}
