import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCompanyProfile(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    
    return company;
  }

  async updateCompanyProfile(companyId: string, userId: string, payload: any) {
    const updated = await this.prisma.company.update({
      where: { id: companyId },
      data: {
        ...(payload as any),
        updatedBy: userId
      },
    });

    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action: 'UPDATE_SETTINGS',
        entity: 'Company',
        entityId: companyId,
      },
    });

    return updated;
  }
}
