import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Permissions('read:users', 'manage:users')
  @ApiOperation({ summary: 'List all company users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll(@Request() req: { user: { companyId: string } }) {
    return this.usersService.findAll(req.user.companyId);
  }

  @Get(':id')
  @Permissions('read:users', 'manage:users')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.usersService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:users')
  @ApiOperation({ summary: 'Update user profile or status' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  update(
    @Param('id') id: string,
    @Body() body: { firstName?: string; lastName?: string; isActive?: boolean },
    @Request() req: { user: { companyId: string } },
  ) {
    return this.usersService.update(req.user.companyId, id, body);
  }

  @Delete(':id')
  @Permissions('manage:users')
  @ApiOperation({ summary: 'Soft delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { companyId: string } },
  ) {
    return this.usersService.remove(req.user.companyId, id);
  }
}
