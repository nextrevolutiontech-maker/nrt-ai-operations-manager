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
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions as RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { SupplierStatus } from '@nrt-ai-workforce/database';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Suppliers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Post()
  @RequirePermissions('supplier:write')
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully.' })
  @ApiResponse({ status: 409, description: 'Supplier name already exists.' })
  create(
    @CurrentUser() user: any,
    @Body() createSupplierDto: CreateSupplierDto,
  ) {
    return this.suppliersService.create(
      user.companyId,
      user.id,
      createSupplierDto,
    );
  }

  @Get()
  @RequirePermissions('supplier:read')
  @ApiOperation({ summary: 'List all suppliers' })
  findAll(
    @CurrentUser() user: any,
    @Query()
    query: PaginationQueryDto & { status?: SupplierStatus; search?: string },
  ) {
    return this.suppliersService.findAll(user.companyId, query);
  }

  @Get(':id')
  @RequirePermissions('supplier:read')
  @ApiOperation({ summary: 'Get supplier by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.suppliersService.findOne(user.companyId, id);
  }

  @Patch(':id')
  @RequirePermissions('supplier:write')
  @ApiOperation({ summary: 'Update a supplier' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(
      user.companyId,
      id,
      user.id,
      updateSupplierDto,
    );
  }

  @Delete(':id')
  @RequirePermissions('supplier:delete')
  @ApiOperation({ summary: 'Soft delete a supplier' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.suppliersService.remove(user.companyId, id, user.id);
  }

  @Post(':id/restore')
  @RequirePermissions('supplier:write')
  @ApiOperation({ summary: 'Restore a soft-deleted supplier' })
  restore(@CurrentUser() user: any, @Param('id') id: string) {
    return this.suppliersService.restore(user.companyId, id, user.id);
  }
}
