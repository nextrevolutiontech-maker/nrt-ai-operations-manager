import { Controller, Get, Res, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { MonitoringService } from './monitoring.service';

@ApiTags('System Health & Monitoring')
@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monitoring: MonitoringService,
  ) {}

  @Get('liveness')
  @ApiOperation({ summary: 'Kubernetes Liveness Probe - Checks if container is alive' })
  getLiveness() {
    return {
      status: 'UP',
      component: 'API Container',
      timestamp: new Date(),
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Kubernetes Readiness Probe - Checks DB & Core Services connectivity' })
  async getReadiness(@Res() res: any) {
    try {
      // Test database connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      const metrics = this.monitoring.getSystemMetrics();

      return res.status(HttpStatus.OK).json({
        status: 'UP',
        database: 'CONNECTED',
        metrics,
        timestamp: new Date(),
      });
    } catch (err: any) {
      return res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: 'DOWN',
        database: 'DISCONNECTED',
        error: err.message,
        timestamp: new Date(),
      });
    }
  }
}
