import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { ActivityFilterDto } from './dto/activity-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

@ApiTags('Activities')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'List user activity feed' })
  findAll(
    @Query() query: ActivityFilterDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.activitiesService.findAll(
      req.user.companyId,
      req.user.id,
      query,
    );
  }
}
