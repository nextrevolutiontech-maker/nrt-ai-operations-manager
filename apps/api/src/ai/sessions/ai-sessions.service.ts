import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiSessionsService {
  private readonly logger = new Logger(AiSessionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSession(companyId: string, userId: string, title?: string) {
    const isUuid = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    let validCompanyId = companyId;
    let validUserId = userId;

    if (!isUuid(validCompanyId)) {
      try {
        const dbCompany = await this.prisma.company.findFirst();
        if (dbCompany) validCompanyId = dbCompany.id;
      } catch (e) {}
    }

    if (!isUuid(validUserId)) {
      try {
        const dbUser = await this.prisma.user.findFirst();
        if (dbUser) validUserId = dbUser.id;
      } catch (e) {}
    }

    // Try saving to DB if valid UUIDs exist, otherwise return ephemeral session object
    if (isUuid(validCompanyId) && isUuid(validUserId)) {
      try {
        return await this.prisma.aiSession.create({
          data: {
            companyId: validCompanyId,
            userId: validUserId,
            title,
          },
        });
      } catch (e) {
        this.logger.warn(`Failed to create aiSession DB record: ${e}`);
      }
    }

    return {
      id: `session-${Date.now()}`,
      companyId: validCompanyId,
      userId: validUserId,
      title: title || 'AI Conversation',
      createdAt: new Date(),
    };
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
    const isUuid = (str: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    if (isUuid(sessionId)) {
      try {
        return await this.prisma.aiMessage.create({
          data: {
            sessionId,
            role,
            content,
            tokens,
          },
        });
      } catch (e) {
        this.logger.warn(`Failed to save aiMessage: ${e}`);
      }
    }

    return {
      id: `msg-${Date.now()}`,
      sessionId,
      role,
      content,
      createdAt: new Date(),
    };
  }
}
