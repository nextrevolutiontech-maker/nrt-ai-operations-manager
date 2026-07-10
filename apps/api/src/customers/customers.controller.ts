import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerFilterDto } from './dto/customer-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Permissions('manage:sales')
  @ApiOperation({ summary: 'Create a new customer' })
  create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(req.user.companyId, req.user.id, dto);
  }

  @Get()
  @Permissions('read:sales')
  @ApiOperation({ summary: 'List and filter customers' })
  findAll(@Req() req: any, @Query() query: CustomerFilterDto) {
    return this.customersService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:sales')
  @ApiOperation({ summary: 'Get customer by ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.customersService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:sales')
  @ApiOperation({ summary: 'Update customer details' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ) {
    return this.customersService.update(
      req.user.companyId,
      id,
      req.user.id,
      dto,
    );
  }

  @Delete(':id')
  @Permissions('manage:sales')
  @ApiOperation({ summary: 'Soft delete a customer' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.customersService.remove(req.user.companyId, id, req.user.id);
  }

  @Patch(':id/restore')
  @Permissions('manage:sales')
  @ApiOperation({ summary: 'Restore a deleted customer' })
  restore(@Req() req: any, @Param('id') id: string) {
    return this.customersService.restore(req.user.companyId, id, req.user.id);
  }
}
