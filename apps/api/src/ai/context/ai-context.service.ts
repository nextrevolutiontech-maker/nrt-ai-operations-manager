import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface DynamicAiContext {
  company: {
    id: string;
    name: string;
    currency: string;
    timezone: string;
    fiscalYear: string;
  };
  user: {
    id: string;
    name: string;
    role: string;
    permissions: string[];
  };
  operationalState: {
    activeWarehouseId: string;
    activeBranchId: string;
    activeIndustry: string;
    language: string;
  };
  liveKpis: {
    lowStockCount: number;
    pendingApprovalsCount: number;
    openOrdersCount: number;
    dailyRevenue: number;
  };
  activeAlerts: Array<{ id: string; severity: string; message: string }>;
}

@Injectable()
export class AiContextEngineService {
  private readonly logger = new Logger(AiContextEngineService.name);

  constructor(private readonly prisma: PrismaService) {}

  async buildContext(
    companyId: string,
    userId: string,
    industryId?: string,
  ): Promise<DynamicAiContext> {
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

    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    const userRoles = user?.userRoles || [];
    const firstRole = userRoles[0]?.role;
    const userPermissions =
      firstRole?.rolePermissions.map((rp: any) => rp.permission.name) || [
        'read:inventory',
        'read:procurement',
        'read:sales',
        'read:finance',
        'read:dashboard',
      ];

    return {
      company: {
        id: companyId || 'COMP-01',
        name: company?.name || 'NRT Enterprise Solutions',
        currency: (company as any)?.currency || 'USD',
        timezone: (company as any)?.timezone || 'UTC',
        fiscalYear: '2026',
      },
      user: {
        id: userId || 'USER-01',
        name: user ? `${user.firstName} ${user.lastName}` : 'Operations Manager',
        role: firstRole?.name || 'Admin',
        permissions: userPermissions,
      },
      operationalState: {
        activeWarehouseId: 'WH-01',
        activeBranchId: 'BRANCH-MAIN',
        activeIndustry: industryId || 'retail',
        language: 'en',
      },
      liveKpis: {
        lowStockCount: 1,
        pendingApprovalsCount: 2,
        openOrdersCount: 14,
        dailyRevenue: 32000,
      },
      activeAlerts: [
        {
          id: 'ALT-01',
          severity: 'HIGH',
          message: 'SKU NRT-SRV-001 stock below safety threshold (5 units remaining)',
        },
        {
          id: 'ALT-02',
          severity: 'MEDIUM',
          message: 'Supplier Samsung shipment PO-8810 delayed by 4 days',
        },
      ],
    };
  }
}
