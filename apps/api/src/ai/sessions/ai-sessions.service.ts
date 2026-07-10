import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiSessionsService {
  private readonly logger = new Logger(AiSessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSession(companyId: string, userId: string, title?: string) {
    return this.prisma.aiSession.create({
      data: {
        companyId,
        userId,
        title,
      },
    });
  }

  async getSessionHistory(sessionId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      this.prisma.aiMessage.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.aiMessage.count({ where: { sessionId } }),
    ]);

    return {
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async saveMessage(
    sessionId: string,
    role: 'USER' | 'AI' | 'SYSTEM',
    content: string,
    tokens?: number,
  ) {
    return this.prisma.aiMessage.create({
      data: {
        sessionId,
        role,
        content,
        tokens,
      },
    });
  }
}
