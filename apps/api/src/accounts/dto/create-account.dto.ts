import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AccountType } from '@nrt-ai-workforce/database';

export class CreateAccountDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountName: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  @IsNotEmpty()
  accountType: AccountType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}
