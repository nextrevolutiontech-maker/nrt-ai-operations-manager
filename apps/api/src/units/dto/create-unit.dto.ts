import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({ description: 'The name of the unit (e.g., Kilogram)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'The symbol of the unit (e.g., kg)' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  symbol: string;
}
