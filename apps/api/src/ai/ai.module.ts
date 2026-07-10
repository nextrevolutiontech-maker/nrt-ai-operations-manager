import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiOrchestratorService } from './orchestrator/ai-orchestrator.service';
import { AiSessionsService } from './sessions/ai-sessions.service';
import { AiInsightsService } from './insights/ai-insights.service';
import { AiContextEngineService } from './context/ai-context.service';
import { AiApprovalsService } from './approvals/ai-approvals.service';
import { ToolRegistryService } from './tools/tool-registry.service';
import { ProductSearchTool } from './tools/product-search.tool';
import { MockAiProvider } from './providers/mock-ai.provider';
import { AI_PROVIDER_TOKEN } from './providers/ai-provider.interface';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [PrismaModule, ProductsModule],
  controllers: [AiController],
  providers: [
    AiOrchestratorService,
    AiSessionsService,
    AiInsightsService,
    AiContextEngineService,
    AiApprovalsService,
    ToolRegistryService,
    ProductSearchTool,
    {
      provide: AI_PROVIDER_TOKEN,
      useClass: MockAiProvider,
    },
  ],
})
export class AiModule {}
