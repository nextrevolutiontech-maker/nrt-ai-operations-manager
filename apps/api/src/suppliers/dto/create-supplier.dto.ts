import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupplierStatus } from '@nrt-ai-workforce/database';

export class CreateSupplierDto {
  @ApiProperty({
    example: 'Acme Corp',
    description: 'The name of the supplier company',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 'John Doe', description: 'Contact person' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contactPerson?: string;

  @ApiPropertyOptional({
    example: 'john@acme.com',
    description: 'Supplier email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+1234567890',
    description: 'Supplier phone number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiPropertyOptional({
    example: '+1987654321',
    description: 'Supplier mobile number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  mobile?: string;

  @ApiPropertyOptional({
    example: 'TAX-12345',
    description: 'Supplier tax number',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  taxNumber?: string;

  @ApiPropertyOptional({
    example: '123 Acme St',
    description: 'Supplier address',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'New York', description: 'Supplier city' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ example: 'USA', description: 'Supplier country' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    example: 'Prefer morning deliveries',
    description: 'Internal notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ enum: SupplierStatus, default: SupplierStatus.ACTIVE })
  @IsOptional()
  @IsEnum(SupplierStatus)
  status?: SupplierStatus;
}
