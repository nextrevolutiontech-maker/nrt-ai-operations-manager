import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiApprovalsService {
  private readonly logger = new Logger(AiApprovalsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createApproval(messageId: string, actionType: string, payload: any) {
    this.logger.log(`Staging AI Action Approval for message: ${messageId}`);
    return this.prisma.aiActionApproval.create({
      data: {
        messageId,
        actionType,
        payload,
        status: 'PENDING',
      },
    });
  }

  async approveAction(approvalId: string, approverUserId: string) {
    const approval = await this.prisma.aiActionApproval.findUnique({
      where: { id: approvalId },
    });

    if (!approval) throw new NotFoundException('Approval not found');

    // In a real scenario, we would trigger the specific tool/service using the actionType and payload
    // For this sprint, we just update the status to mark it as approved and then executed.

    await this.prisma.aiActionApproval.update({
      where: { id: approvalId },
      data: {
        status: 'EXECUTED',
        approvedBy: approverUserId,
      },
    });

    return { success: true, message: 'Action approved and executed.' };
  }
}
