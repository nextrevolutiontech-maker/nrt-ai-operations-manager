import {
  Controller,
  Get,
  Param,
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
import { InventoriesService } from './inventories.service';
import { InventoryFilterDto } from './dto/inventory-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Inventories')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('inventories')
export class InventoriesController {
  constructor(private readonly inventoriesService: InventoriesService) {}

  @Get()
  @Permissions('read:inventory', 'manage:inventory')
  @ApiOperation({
    summary: 'List inventory records with dynamic valuation and status',
  })
  @ApiResponse({ status: 200, description: 'Inventory retrieved successfully' })
  findAll(
    @Query() query: InventoryFilterDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.inventoriesService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:inventory', 'manage:inventory')
  @ApiOperation({ summary: 'Get specific inventory details' })
  @ApiResponse({ status: 200, description: 'Inventory retrieved successfully' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.inventoriesService.findOne(req.user.companyId, id);
  }
}
