import { Injectable, Logger } from '@nestjs/common';
import { RuntimeStateService } from './runtime-state.service';

@Injectable()
export class RuntimeHealthService {
  private readonly logger = new Logger(RuntimeHealthService.name);

  constructor(private readonly stateService: RuntimeStateService) {}

  checkHealth() {
    const status = this.stateService.getStatus();
    const uptime = this.stateService.getUptimeSeconds();

    return {
      status,
      healthy: status === 'RUNNING' || status === 'STARTING',
      uptimeSeconds: uptime,
      timestamp: new Date().toISOString(),
    };
  }

  recover() {
    this.logger.log('[RUNTIME HEALTH] Triggering runtime recovery...');
    this.stateService.setStatus('RECOVERING');
    setTimeout(() => {
      this.stateService.setStatus('RUNNING');
      this.logger.log('[RUNTIME HEALTH] Runtime recovery completed successfully.');
    }, 100);
  }
}
