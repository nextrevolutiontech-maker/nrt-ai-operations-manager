import {
  Controller,
  Get,
  Post,
  Body,
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
import { ApprovalsService } from './approvals.service';
import { ApprovalFilterDto } from './dto/approval-filter.dto';
import { ProcessActionDto } from './dto/process-action.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Approvals')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get('requests')
  @Permissions('read:approvals', 'manage:approvals')
  @ApiOperation({ summary: 'List approval requests' })
  findAll(
    @Query() query: ApprovalFilterDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.approvalsService.findAll(req.user.companyId, query);
  }

  @Get('requests/:id')
  @Permissions('read:approvals', 'manage:approvals')
  @ApiOperation({ summary: 'Get an approval request by ID' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.approvalsService.findOne(req.user.companyId, id);
  }

  @Post('requests/:id/action')
  @Permissions('manage:approvals')
  @ApiOperation({
    summary: 'Process an approval action (Approve/Reject/Return/Cancel)',
  })
  processAction(
    @Param('id') id: string,
    @Body() processActionDto: ProcessActionDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.approvalsService.processAction(
      req.user.companyId,
      id,
      req.user.id,
      processActionDto,
    );
  }
}
