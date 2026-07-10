import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SalesOrdersService } from './sales-orders.service';
import { CreateSalesOrderDto } from './dto/create-sales-order.dto';
import { UpdateSalesOrderDto } from './dto/update-sales-order.dto';
import { SalesOrderFilterDto } from './dto/sales-order-filter.dto';
import { GoodsIssueDto } from './dto/goods-issue.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Sales Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sales-orders')
export class SalesOrdersController {
  constructor(private readonly salesOrdersService: SalesOrdersService) {}

  @Post()
  @Permissions('manage:sales')
  @ApiOperation({ summary: 'Create a new draft sales order' })
  create(@Req() req: any, @Body() dto: CreateSalesOrderDto) {
    return this.salesOrdersService.create(req.user.companyId, req.user.id, dto);
  }

  @Get()
  @Permissions('read:sales')
  @ApiOperation({ summary: 'List and filter sales orders' })
  findAll(@Req() req: any, @Query() query: SalesOrderFilterDto) {
    return this.salesOrdersService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:sales')
  @ApiOperation({ summary: 'Get sales order details' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.salesOrdersService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:sales')
  @ApiOperation({ summary: 'Update sales order or change status' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateSalesOrderDto,
  ) {
    return this.salesOrdersService.update(
      req.user.companyId,
      id,
      req.user.id,
      dto,
    );
  }

  @Post(':id/issue')
  @Permissions('manage:sales')
  @ApiOperation({ summary: 'Issue goods and deduct inventory' })
  issueGoods(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: GoodsIssueDto,
  ) {
    return this.salesOrdersService.issueGoods(
      req.user.companyId,
      id,
      req.user.id,
      dto,
    );
  }
}
