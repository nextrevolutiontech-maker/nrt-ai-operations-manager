import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  AI_PROVIDER_TOKEN,
  type IAiProvider,
} from '../providers/ai-provider.interface';
import { ToolRegistryService } from '../tools/tool-registry.service';
import { AiContextEngineService } from '../context/ai-context.service';
import { AiSessionsService } from '../sessions/ai-sessions.service';
import { AiApprovalsService } from '../approvals/ai-approvals.service';

@Injectable()
export class AiOrchestratorService {
  private readonly logger = new Logger(AiOrchestratorService.name);

  constructor(
    @Inject(AI_PROVIDER_TOKEN) private readonly aiProvider: IAiProvider,
    private readonly toolRegistry: ToolRegistryService,
    private readonly contextEngine: AiContextEngineService,
    private readonly sessionsService: AiSessionsService,
    private readonly approvalsService: AiApprovalsService,
  ) {}

  async handlePrompt(
    companyId: string,
    userId: string,
    sessionId: string,
    prompt: string,
  ) {
    // 1. Build Context
    const context = await this.contextEngine.buildContext(companyId, userId);

    // 2. Save User Prompt
    await this.sessionsService.saveMessage(sessionId, 'USER', prompt);

    // 3. Assemble Payload
    const tools = this.toolRegistry.getAllToolsDefinitions();
    const systemPrompt = `You are the NRT AI Operations Manager. Context: ${JSON.stringify(context)}`;

    const payload = {
      systemPrompt,
      userPrompt: prompt,
      tools,
    };

    // 4. Generate AI Response
    const response = await this.aiProvider.generateResponse(payload);

    // 5. Handle Tool Calls if any
    if (response.toolCalls && response.toolCalls.length > 0) {
      let finalContent = 'Executed actions: ';
      for (const call of response.toolCalls) {
        if (
          call.name.includes('Draft') ||
          call.name.includes('Create') ||
          call.name.includes('Post')
        ) {
          // Destructive / Sensitive action requires approval
          const aiMessage = await this.sessionsService.saveMessage(
            sessionId,
            'AI',
            `Suggested Action: ${call.name}`,
          );
          await this.approvalsService.createApproval(
            aiMessage.id,
            call.name,
            call.arguments,
          );
          finalContent += `\n- Staged ${call.name} for human approval.`;
        } else {
          // Safe action (e.g., read, search), execute immediately
          try {
            const toolResult = await this.toolRegistry.executeTool(
              call.name,
              call.arguments,
              context,
            );
            finalContent += `\n- Executed ${call.name}: Found ${Array.isArray(toolResult) ? toolResult.length : 1} items.`;
          } catch (e: any) {
            finalContent += `\n- Failed to execute ${call.name}: ${e.message}`;
          }
        }
      }

      await this.sessionsService.saveMessage(
        sessionId,
        'AI',
        finalContent,
        response.usage?.totalTokens,
      );
      return finalContent;
    }

    // 6. Save standard AI text response
    await this.sessionsService.saveMessage(
      sessionId,
      'AI',
      response.content,
      response.usage?.totalTokens,
    );
    return response.content;
  }
}
