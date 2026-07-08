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
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseFilterDto } from './dto/warehouse-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Warehouses')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Post()
  @Permissions('manage:inventory')
  @ApiOperation({ summary: 'Create a new warehouse' })
  @ApiResponse({ status: 201, description: 'Warehouse created successfully' })
  create(
    @Body() createWarehouseDto: CreateWarehouseDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.warehousesService.create(
      req.user.companyId,
      req.user.id,
      createWarehouseDto,
    );
  }

  @Get()
  @Permissions('read:inventory', 'manage:inventory')
  @ApiOperation({ summary: 'List warehouses with search and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Warehouses retrieved successfully',
  })
  findAll(
    @Query() query: WarehouseFilterDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.warehousesService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:inventory', 'manage:inventory')
  @ApiOperation({ summary: 'Get specific warehouse details' })
  @ApiResponse({ status: 200, description: 'Warehouse retrieved successfully' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.warehousesService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:inventory')
  @ApiOperation({ summary: 'Update a warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateWarehouseDto: UpdateWarehouseDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.warehousesService.update(
      req.user.companyId,
      id,
      req.user.id,
      updateWarehouseDto,
    );
  }

  @Delete(':id')
  @Permissions('manage:inventory')
  @ApiOperation({ summary: 'Soft delete a warehouse' })
  @ApiResponse({
    status: 200,
    description: 'Warehouse soft-deleted successfully',
  })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.warehousesService.remove(req.user.companyId, id, req.user.id);
  }

  @Post(':id/restore')
  @Permissions('manage:inventory')
  @ApiOperation({ summary: 'Restore a softly deleted warehouse' })
  @ApiResponse({ status: 200, description: 'Warehouse restored successfully' })
  restore(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.warehousesService.restore(req.user.companyId, id, req.user.id);
  }
}
