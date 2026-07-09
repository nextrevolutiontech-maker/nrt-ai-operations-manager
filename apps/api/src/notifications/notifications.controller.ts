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
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationFilterDto } from './dto/notification-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @Permissions('manage:notifications') // Typically admin or system only
  @ApiOperation({ summary: 'Create a new manual notification' })
  create(
    @Body() createNotificationDto: CreateNotificationDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.notificationsService.create(
      req.user.companyId,
      req.user.id,
      createNotificationDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'List user notifications' })
  findAll(
    @Query() query: NotificationFilterDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.notificationsService.findAll(
      req.user.companyId,
      req.user.id,
      query,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification details' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.notificationsService.findOne(
      req.user.companyId,
      req.user.id,
      id,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markAsRead(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.notificationsService.markAsRead(
      req.user.companyId,
      req.user.id,
      id,
    );
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead(@Request() req: { user: { id: string; companyId: string } }) {
    return this.notificationsService.markAllAsRead(
      req.user.companyId,
      req.user.id,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a notification' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.notificationsService.remove(
      req.user.companyId,
      req.user.id,
      id,
    );
  }
}
