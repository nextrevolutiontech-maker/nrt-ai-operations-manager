import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AiContextEngineService {
  private readonly logger = new Logger(AiContextEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async buildContext(
    companyId: string,
    userId: string,
    activeModule?: string,
  ): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) throw new Error('User not found');

    const permissions = user.userRoles.flatMap((ur: any) =>
      ur.role.rolePermissions.map((rp: any) => rp.permission.action),
    );

    return {
      companyId,
      userId,
      userEmail: user.email,
      userName: `${user.firstName} ${user.lastName}`,
      permissions,
      activeModule: activeModule || 'Dashboard',
      timestamp: new Date().toISOString(),
    };
  }
}
