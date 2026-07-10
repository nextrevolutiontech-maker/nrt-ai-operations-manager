import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiOrchestratorService } from './orchestrator/ai-orchestrator.service';
import { AiSessionsService } from './sessions/ai-sessions.service';
import { AiInsightsService } from './insights/ai-insights.service';
import { ToolRegistryService } from './tools/tool-registry.service';
import { AiApprovalsService } from './approvals/ai-approvals.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions as RequirePermissions } from '../auth/decorators/permissions.decorator';

@ApiTags('AI Command Center')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ai')
export class AiController {
  constructor(
    private readonly orchestrator: AiOrchestratorService,
    private readonly sessions: AiSessionsService,
    private readonly insights: AiInsightsService,
    private readonly registry: ToolRegistryService,
    private readonly approvals: AiApprovalsService,
  ) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a prompt to the AI Orchestrator' })
  @RequirePermissions('create:ai-sessions')
  async chat(
    @Req() req: any,
    @Body() body: { sessionId: string; prompt: string },
  ) {
    const { companyId, id: userId } = req.user;
    let sessionId = body.sessionId;

    if (!sessionId) {
      const session = await this.sessions.createSession(
        companyId,
        userId,
        body.prompt.slice(0, 50),
      );
      sessionId = session.id;
    }

    const response = await this.orchestrator.handlePrompt(
      companyId,
      userId,
      sessionId,
      body.prompt,
    );
    return { sessionId, response };
  }

  @Get('sessions/:sessionId/history')
  @ApiOperation({ summary: 'Get conversation history for an AI Session' })
  @RequirePermissions('read:ai-sessions')
  async getHistory(
    @Param('sessionId') sessionId: string,
    @Query('page') page: number = 1,
  ) {
    return this.sessions.getSessionHistory(sessionId, Number(page));
  }

  @Get('tools')
  @ApiOperation({ summary: 'Get all registered AI tools' })
  @RequirePermissions('read:ai-sessions')
  getTools() {
    return this.registry.getAllToolsDefinitions();
  }

  @Post('approvals/:id/approve')
  @ApiOperation({ summary: 'Approve a staged AI Action' })
  @RequirePermissions('create:ai-action-approvals')
  async approveAction(@Req() req: any, @Param('id') id: string) {
    return this.approvals.approveAction(id, req.user.id);
  }

  @Get('insights/executive')
  @ApiOperation({ summary: 'Get an executive summary from AI insights' })
  @RequirePermissions('read:ai-sessions')
  async getExecutiveSummary(@Req() req: any) {
    return this.insights.getExecutiveSummary(req.user.companyId);
  }
}
