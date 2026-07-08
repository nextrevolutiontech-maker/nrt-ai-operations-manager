import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PurchaseOrdersService } from './purchase-orders.service';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { ReceiveGoodsDto } from './dto/receive-goods.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions as RequirePermissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { POStatus } from '@nrt-ai-workforce/database';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Post()
  @RequirePermissions('purchase-order:write')
  @ApiOperation({ summary: 'Create a Draft Purchase Order' })
  create(
    @CurrentUser() user: any,
    @Body() createPurchaseOrderDto: CreatePurchaseOrderDto,
  ) {
    return this.purchaseOrdersService.create(
      user.companyId,
      user.id,
      createPurchaseOrderDto,
    );
  }

  @Get()
  @RequirePermissions('purchase-order:read')
  @ApiOperation({ summary: 'List all Purchase Orders' })
  findAll(
    @CurrentUser() user: any,
    @Query()
    query: PaginationQueryDto & {
      status?: POStatus;
      supplierId?: string;
      warehouseId?: string;
      search?: string;
    },
  ) {
    return this.purchaseOrdersService.findAll(user.companyId, query);
  }

  @Get(':id')
  @RequirePermissions('purchase-order:read')
  @ApiOperation({ summary: 'Get Purchase Order details' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.purchaseOrdersService.findOne(user.companyId, id);
  }

  @Post(':id/status')
  @RequirePermissions('purchase-order:write')
  @ApiOperation({ summary: 'Transition Purchase Order status' })
  updateStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body('status') status: POStatus,
  ) {
    return this.purchaseOrdersService.updateStatus(
      user.companyId,
      id,
      user.id,
      status,
    );
  }

  @Post(':id/receive')
  @RequirePermissions('purchase-order:receive')
  @ApiOperation({ summary: 'Receive goods for a Purchase Order' })
  receiveGoods(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() receiveGoodsDto: ReceiveGoodsDto,
  ) {
    return this.purchaseOrdersService.receiveGoods(
      user.companyId,
      id,
      user.id,
      receiveGoodsDto,
    );
  }
}
