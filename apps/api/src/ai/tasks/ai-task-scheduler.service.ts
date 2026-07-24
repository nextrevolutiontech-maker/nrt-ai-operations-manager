import { Injectable, Logger } from '@nestjs/common';
import { RUNTIME_SCHEDULE_CONFIG } from '../runtime/runtime-schedule.config';

@Injectable()
export class AiTaskSchedulerService {
  private readonly logger = new Logger(AiTaskSchedulerService.name);

  getScheduleConfig() {
    return RUNTIME_SCHEDULE_CONFIG;
  }
}
