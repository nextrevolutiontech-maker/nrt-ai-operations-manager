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
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { UpdateUnitDto } from './dto/update-unit.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Units')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Create a new unit' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  create(
    @Body() createUnitDto: CreateUnitDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.unitsService.create(
      req.user.companyId,
      req.user.id,
      createUnitDto,
    );
  }

  @Get()
  @Permissions('read:catalog', 'manage:catalog')
  @ApiOperation({ summary: 'List units (includes global units)' })
  @ApiResponse({ status: 200, description: 'Units retrieved successfully' })
  findAll(
    @Query() query: PaginationQueryDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.unitsService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:catalog', 'manage:catalog')
  @ApiOperation({ summary: 'Get a specific unit' })
  @ApiResponse({ status: 200, description: 'Unit retrieved successfully' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.unitsService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Update a unit (company specific only)' })
  @ApiResponse({ status: 200, description: 'Unit updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateUnitDto: UpdateUnitDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.unitsService.update(
      req.user.companyId,
      id,
      req.user.id,
      updateUnitDto,
    );
  }

  @Delete(':id')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Soft delete a unit (company specific only)' })
  @ApiResponse({ status: 200, description: 'Unit soft-deleted successfully' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.unitsService.remove(req.user.companyId, id, req.user.id);
  }

  @Post(':id/restore')
  @Permissions('manage:catalog')
  @ApiOperation({ summary: 'Restore a deleted unit' })
  @ApiResponse({ status: 200, description: 'Unit restored successfully' })
  restore(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.unitsService.restore(req.user.companyId, id, req.user.id);
  }
}
