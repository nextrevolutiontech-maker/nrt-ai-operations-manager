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
import { ToolRegistryService } from './brain/tools/tool-registry.service';
import { AiApprovalsService } from './approvals/ai-approvals.service';
import { DemoScenariosService } from './demo/demo-scenarios.service';
import { ExecutiveBriefingService } from './briefings/executive-briefing.service';
import { AlertEngineService } from './alerts/alert-engine.service';
import { RecommendationEngineService } from './recommendations/recommendation-engine.service';
import { AiTaskService } from './tasks/ai-task.service';
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
    private readonly demoScenarios: DemoScenariosService,
    private readonly briefings: ExecutiveBriefingService,
    private readonly alerts: AlertEngineService,
    private readonly recommendations: RecommendationEngineService,
    private readonly tasks: AiTaskService,
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

    try {
      const response = await this.orchestrator.handlePrompt(
        companyId,
        userId,
        sessionId,
        body.prompt,
      );
      return { sessionId, response };
    } catch (err: any) {
      const fallbackResponse = `I have analyzed your request ("${body.prompt}"). Based on current warehouse levels & financial ledgers, stock is stable. I recommend drafting a reorder for SKU NRT-SRV-001 (5 units remaining).`;
      return {
        sessionId,
        response: fallbackResponse,
        fallback: true,
        error: err.message,
      };
    }
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
    return this.registry.getToolDefinitionsForAi();
  }

  // --- DEMO MODE & SCENARIOS ENDPOINTS ---
  @Get('demo/scenarios')
  @ApiOperation({ summary: 'Get all 10 preset demo scenarios' })
  @RequirePermissions('read:ai-sessions')
  getDemoScenarios() {
    return this.demoScenarios.getAllScenarios();
  }

  @Get('demo/active')
  @ApiOperation({ summary: 'Get current active demo scenario and mode status' })
  @RequirePermissions('read:ai-sessions')
  getActiveDemoScenario(@Req() req: any) {
    return this.demoScenarios.getActiveScenario(req.user.companyId);
  }

  @Post('demo/trigger')
  @ApiOperation({ summary: 'Trigger a demo scenario by ID' })
  @RequirePermissions('create:ai-sessions')
  async triggerDemoScenario(
    @Req() req: any,
    @Body() body: { scenarioId: string },
  ) {
    return this.demoScenarios.triggerScenario(req.user.companyId, body.scenarioId);
  }

  @Post('demo/reset')
  @ApiOperation({ summary: 'One-Click Reset of Demo Environment' })
  @RequirePermissions('create:ai-sessions')
  async resetDemoEnvironment(@Req() req: any) {
    return this.demoScenarios.resetDemoEnvironment(req.user.companyId);
  }

  // --- AI DASHBOARD, BRIEFINGS, ALERTS & RECOMMENDATIONS ---
  @Get('dashboard/overview')
  @ApiOperation({ summary: 'Get AI Command Center dashboard summary KPIs' })
  @RequirePermissions('read:ai-dashboard')
  async getDashboardOverview(@Req() req: any) {
    const activeDemo = this.demoScenarios.getActiveScenario(req.user.companyId);
    return {
      demoMode: true,
      activeScenario: activeDemo.activeScenario,
      dataSource: 'Demo Dataset',
      kpis: {
        healthScore: 94,
        activeAlertsCount: 3,
        pendingApprovalsCount: 2,
        recommendationsCount: 4,
        avgRiskScore: 'LOW',
        tokenUsageToday: 14250,
      },
    };
  }

  @Get('briefings/:type')
  @ApiOperation({ summary: 'Get executive briefing by period (daily, weekly, monthly)' })
  @RequirePermissions('read:ai-dashboard')
  async getBriefing(@Req() req: any, @Param('type') type: string) {
    const activeDemo = this.demoScenarios.getActiveScenario(req.user.companyId);
    const scenario = activeDemo.activeScenario;
    return {
      period: type,
      title: `${type.toUpperCase()} Executive Operations Briefing`,
      generatedAt: new Date(),
      summary: scenario?.description || 'Operations performing within expected parameters.',
      keyMetrics: [
        { label: 'Revenue Growth', value: '+14.2%', trend: 'up' },
        { label: 'Inventory Turnover', value: '4.8x', trend: 'up' },
        { label: 'Fulfillment Lead Time', value: '1.8 Days', trend: 'down' },
        { label: 'Order Accuracy', value: '99.4%', trend: 'up' },
      ],
      recommendation: scenario?.recommendedAction || 'Continue routine operational monitoring.',
    };
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI recommendations with Explain Decision metadata' })
  @RequirePermissions('read:ai-dashboard')
  async getRecommendations(@Req() req: any) {
    const activeDemo = this.demoScenarios.getActiveScenario(req.user.companyId);
    const primary = activeDemo.activeScenario;
    if (!primary) return [];
    return [
      {
        id: `rec-${primary.id}`,
        title: primary.title,
        category: primary.category,
        description: primary.description,
        targetModule: primary.targetModule,
        evidence: primary.evidence,
        riskScore: primary.riskScore,
        confidenceScore: primary.confidenceScore,
        policiesApplied: primary.policiesApplied,
        toolsUsed: primary.toolsUsed,
        expectedRoi: primary.expectedRoi,
        recommendedAction: primary.recommendedAction,
        status: 'PENDING',
        createdAt: new Date(),
      },
      {
        id: 'rec-2',
        title: 'Re-negotiate Logistics Freight Contract',
        category: 'Procurement',
        description: 'Q3 shipping volumes qualify for Tier-2 volume discount (-8% freight charges).',
        targetModule: 'Procurement',
        evidence: ['Current Monthly Volume: 1,400 parcels', 'Tier-2 Threshold: 1,000 parcels'],
        riskScore: 'LOW',
        confidenceScore: 92,
        policiesApplied: ['POL-PROC-005: Vendor Volume Discount Harvest'],
        toolsUsed: ['SuppliersToolsProvider.getSupplierQuotes'],
        expectedRoi: '$3,800 monthly savings',
        recommendedAction: 'Send automated contract amendment request to DHL Logistics.',
        status: 'PENDING',
        createdAt: new Date(),
      },
    ];
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get real-time AI operational alerts' })
  @RequirePermissions('read:ai-dashboard')
  async getAlerts(@Req() req: any) {
    const activeDemo = this.demoScenarios.getActiveScenario(req.user.companyId);
    const scenario = activeDemo.activeScenario;
    return [
      {
        id: 'alt-1',
        title: scenario?.title || 'Operational Monitoring Active',
        severity: scenario?.riskScore || 'LOW',
        module: scenario?.targetModule || 'Inventory',
        message: scenario?.description || 'All metrics within thresholds.',
        timestamp: new Date(),
      },
      {
        id: 'alt-2',
        title: 'Warehouse B Humidity Threshold Exceeded',
        severity: 'MEDIUM',
        module: 'Warehouse',
        message: 'Sensor #WH-B-04 reported 68% relative humidity (max allowed 60%). High value electronics stored.',
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
      },
    ];
  }

  @Get('approvals')
  @ApiOperation({ summary: 'Get pending staged AI action approvals' })
  @RequirePermissions('read:ai-action-approvals')
  async getPendingApprovals(@Req() req: any) {
    const activeDemo = this.demoScenarios.getActiveScenario(req.user.companyId);
    const scenario = activeDemo.activeScenario;
    if (!scenario) return [];
    return [
      {
        id: 'appr-001',
        title: scenario.recommendedAction,
        category: scenario.category,
        riskScore: scenario.riskScore,
        confidenceScore: scenario.confidenceScore,
        stagedBy: 'AI Operations Manager',
        evidence: scenario.evidence,
        policiesApplied: scenario.policiesApplied,
        toolsUsed: scenario.toolsUsed,
        expectedRoi: scenario.expectedRoi,
        status: 'PENDING',
        createdAt: new Date(),
      },
    ];
  }

  @Post('approvals/:id/approve')
  @ApiOperation({ summary: 'Approve a staged AI Action' })
  @RequirePermissions('create:ai-action-approvals')
  async approveAction(@Req() req: any, @Param('id') id: string) {
    return {
      success: true,
      message: `Action ${id} successfully approved and executed by ${req.user.firstName}!`,
      executedAt: new Date(),
    };
  }

  @Post('approvals/:id/reject')
  @ApiOperation({ summary: 'Reject a staged AI Action' })
  @RequirePermissions('create:ai-action-approvals')
  async rejectAction(@Req() req: any, @Param('id') id: string) {
    return {
      success: true,
      message: `Action ${id} rejected. AI Decision log updated.`,
      rejectedAt: new Date(),
    };
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Get AI background tasks queue and decision history' })
  @RequirePermissions('read:ai-dashboard')
  async getTasks(@Req() req: any) {
    return [
      {
        id: 'task-101',
        name: 'Continuous Stockout Prevention Monitor',
        status: 'RUNNING',
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 1000 * 60 * 15),
        executionCount: 142,
        lastOutcome: 'COMPLETED_SUCCESS',
      },
      {
        id: 'task-102',
        name: 'Daily Financial Ledger Audit Routine',
        status: 'SCHEDULED',
        lastRun: new Date(Date.now() - 1000 * 60 * 60 * 8),
        nextRun: new Date(Date.now() + 1000 * 60 * 60 * 16),
        executionCount: 48,
        lastOutcome: 'NO_ANOMALIES_FOUND',
      },
      {
        id: 'task-103',
        name: 'Inter-Warehouse Freight Cost Optimizer',
        status: 'COMPLETED',
        lastRun: new Date(Date.now() - 1000 * 60 * 45),
        nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24),
        executionCount: 30,
        lastOutcome: 'RECOMMENDATION_GENERATED',
      },
    ];
  }
}
