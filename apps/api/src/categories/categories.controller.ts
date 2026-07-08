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
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Categories')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.categoriesService.create(
      req.user.companyId,
      req.user.id,
      createCategoryDto,
    );
  }

  @Get()
  @Permissions('read:catalog', 'manage:catalog')
  @ApiOperation({ summary: 'List categories with pagination and search' })
  @ApiResponse({
    status: 200,
    description: 'Categories retrieved successfully',
  })
  findAll(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.categoriesService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:catalog', 'manage:catalog')
  @ApiOperation({ summary: 'Get a specific category by ID' })
  @ApiResponse({ status: 200, description: 'Category retrieved successfully' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.categoriesService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Update a category' })
  @ApiResponse({ status: 200, description: 'Category updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.categoriesService.update(
      req.user.companyId,
      id,
      req.user.id,
      updateCategoryDto,
    );
  }

  @Delete(':id')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Soft delete a category' })
  @ApiResponse({
    status: 200,
    description: 'Category soft-deleted successfully',
  })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.categoriesService.remove(req.user.companyId, id, req.user.id);
  }

  @Post(':id/restore')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Restore a softly deleted category' })
  @ApiResponse({ status: 200, description: 'Category restored successfully' })
  restore(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.categoriesService.restore(req.user.companyId, id, req.user.id);
  }
}
