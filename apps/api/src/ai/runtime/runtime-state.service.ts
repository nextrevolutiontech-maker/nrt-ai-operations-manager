import { Injectable } from '@nestjs/common';

export type RuntimeStatus = 'STOPPED' | 'STARTING' | 'RUNNING' | 'DEGRADED' | 'RECOVERING';

@Injectable()
export class RuntimeStateService {
  private status: RuntimeStatus = 'STOPPED';
  private startedAt?: Date;

  getStatus(): RuntimeStatus {
    return this.status;
  }

  setStatus(status: RuntimeStatus) {
    this.status = status;
    if (status === 'RUNNING' && !this.startedAt) {
      this.startedAt = new Date();
    }
  }

  getUptimeSeconds(): number {
    if (!this.startedAt) return 0;
    return Math.floor((Date.now() - this.startedAt.getTime()) / 1000);
  }
}
