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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Brands')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({ status: 201, description: 'Brand created successfully' })
  create(
    @Body() createBrandDto: CreateBrandDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.brandsService.create(
      req.user.companyId,
      req.user.id,
      createBrandDto,
    );
  }

  @Get()
  @Permissions('read:catalog', 'manage:catalog')
  @ApiOperation({ summary: 'List brands' })
  @ApiResponse({ status: 200, description: 'Brands retrieved successfully' })
  findAll(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.brandsService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:catalog', 'manage:catalog')
  @ApiOperation({ summary: 'Get a specific brand' })
  @ApiResponse({ status: 200, description: 'Brand retrieved successfully' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.brandsService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Update a brand' })
  @ApiResponse({ status: 200, description: 'Brand updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateBrandDto: UpdateBrandDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.brandsService.update(
      req.user.companyId,
      id,
      req.user.id,
      updateBrandDto,
    );
  }

  @Delete(':id')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Soft delete a brand' })
  @ApiResponse({ status: 200, description: 'Brand soft-deleted successfully' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.brandsService.remove(req.user.companyId, id, req.user.id);
  }

  @Post(':id/restore')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Restore a deleted brand' })
  @ApiResponse({ status: 200, description: 'Brand restored successfully' })
  restore(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.brandsService.restore(req.user.companyId, id, req.user.id);
  }
}
