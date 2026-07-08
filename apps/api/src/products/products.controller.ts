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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(
    @Body() createProductDto: CreateProductDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.productsService.create(
      req.user.companyId,
      req.user.id,
      createProductDto,
    );
  }

  @Get()
  @Permissions('read:catalog', 'manage:catalog')
  @ApiOperation({ summary: 'List products with rich filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  findAll(
    @Query() query: ProductFilterDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.productsService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:catalog', 'manage:catalog')
  @ApiOperation({ summary: 'Get a specific product' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.productsService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.productsService.update(
      req.user.companyId,
      id,
      req.user.id,
      updateProductDto,
    );
  }

  @Delete(':id')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Soft delete a product' })
  @ApiResponse({
    status: 200,
    description: 'Product soft-deleted successfully',
  })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.productsService.remove(req.user.companyId, id, req.user.id);
  }

  @Post(':id/restore')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Restore a deleted product' })
  @ApiResponse({ status: 200, description: 'Product restored successfully' })
  restore(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.productsService.restore(req.user.companyId, id, req.user.id);
  }
}
