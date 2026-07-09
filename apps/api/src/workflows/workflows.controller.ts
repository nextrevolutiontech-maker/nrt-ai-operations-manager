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
import { WorkflowsService } from './workflows.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowFilterDto } from './dto/workflow-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('Workflows')
@ApiBearerAuth()
@ApiResponse({ status: 400, description: 'Bad Request / Validation Error' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
@ApiResponse({ status: 403, description: 'Forbidden (RBAC)' })
@ApiResponse({ status: 404, description: 'Not Found' })
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('workflows')
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  @Post()
  @Permissions('manage:workflows')
  @ApiOperation({ summary: 'Create a new workflow' })
  @ApiResponse({ status: 201, description: 'Workflow created successfully' })
  create(
    @Body() createWorkflowDto: CreateWorkflowDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workflowsService.create(
      req.user.companyId,
      req.user.id,
      createWorkflowDto,
    );
  }

  @Get()
  @Permissions('read:workflows', 'manage:workflows')
  @ApiOperation({ summary: 'List workflows' })
  findAll(
    @Query() query: WorkflowFilterDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workflowsService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:workflows', 'manage:workflows')
  @ApiOperation({ summary: 'Get a workflow by ID' })
  findOne(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workflowsService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:workflows')
  @ApiOperation({ summary: 'Update a workflow' })
  update(
    @Param('id') id: string,
    @Body() updateWorkflowDto: UpdateWorkflowDto,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workflowsService.update(
      req.user.companyId,
      id,
      req.user.id,
      updateWorkflowDto,
    );
  }

  @Delete(':id')
  @Permissions('manage:workflows')
  @ApiOperation({ summary: 'Soft delete a workflow' })
  remove(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workflowsService.remove(req.user.companyId, id, req.user.id);
  }

  @Post(':id/restore')
  @Permissions('manage:workflows')
  @ApiOperation({ summary: 'Restore a deleted workflow' })
  restore(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workflowsService.restore(req.user.companyId, id, req.user.id);
  }

  @Post(':id/activate')
  @Permissions('manage:workflows')
  @ApiOperation({ summary: 'Activate a workflow' })
  activate(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workflowsService.activate(req.user.companyId, id, req.user.id);
  }

  @Post(':id/deactivate')
  @Permissions('manage:workflows')
  @ApiOperation({ summary: 'Deactivate a workflow' })
  deactivate(
    @Param('id') id: string,
    @Request() req: { user: { id: string; companyId: string } },
  ) {
    return this.workflowsService.deactivate(
      req.user.companyId,
      id,
      req.user.id,
    );
  }
}
