import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { JournalStatus } from '@nrt-ai-workforce/database';

export class JournalFilterDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: JournalStatus })
  @IsEnum(JournalStatus)
  @IsOptional()
  status?: JournalStatus;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  referenceType?: string;
}
