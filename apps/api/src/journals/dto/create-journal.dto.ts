import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateJournalEntryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  debit: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  credit: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

export class CreateJournalDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referenceType?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referenceId?: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  postingDate: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [CreateJournalEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateJournalEntryDto)
  entries: CreateJournalEntryDto[];
}
