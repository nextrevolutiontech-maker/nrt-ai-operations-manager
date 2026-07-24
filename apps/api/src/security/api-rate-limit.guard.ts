import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface TenantRateLimitState {
  requestCount: number;
  tokensUsedToday: number;
  lastResetWindow: number;
  lastDailyReset: string; // YYYY-MM-DD
}

@Injectable()
export class ApiRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(ApiRateLimitGuard.name);

  // In-memory rate limiting map per tenant/IP
  private tenantLimits: Map<string, TenantRateLimitState> = new Map();

  private readonly MAX_REQUESTS_PER_MINUTE = 120;
  private readonly MAX_DAILY_LLM_TOKENS = 100000;

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.user?.companyId || request.ip || 'anonymous';
    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    let state = this.tenantLimits.get(key);

    if (!state) {
      state = {
        requestCount: 0,
        tokensUsedToday: 0,
        lastResetWindow: now,
        lastDailyReset: today,
      };
      this.tenantLimits.set(key, state);
    }

    // 1. Reset 1-minute window
    if (now - state.lastResetWindow > 60000) {
      state.requestCount = 0;
      state.lastResetWindow = now;
    }

    // 2. Reset daily token window
    if (state.lastDailyReset !== today) {
      state.tokensUsedToday = 0;
      state.lastDailyReset = today;
    }

    // Check request limit
    state.requestCount++;
    if (state.requestCount > this.MAX_REQUESTS_PER_MINUTE) {
      this.logger.warn(`Rate limit exceeded for tenant/IP: ${key}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `API rate limit of ${this.MAX_REQUESTS_PER_MINUTE} requests/min exceeded. Please try again in 60 seconds.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Check daily LLM token quota if hitting AI endpoints
    if (request.url.includes('/api/ai/chat') && state.tokensUsedToday >= this.MAX_DAILY_LLM_TOKENS) {
      this.logger.warn(`Daily LLM token quota exceeded for tenant: ${key}`);
      throw new HttpException(
        {
          statusCode: HttpStatus.PAYMENT_REQUIRED,
          error: 'Token Quota Exceeded',
          message: `Daily tenant LLM token quota (${this.MAX_DAILY_LLM_TOKENS} tokens) reached. Quota resets at 00:00 UTC.`,
        },
        HttpStatus.PAYMENT_REQUIRED,
      );
    }

    return true;
  }

  recordTokenUsage(companyId: string, tokens: number) {
    const state = this.tenantLimits.get(companyId);
    if (state) {
      state.tokensUsedToday += tokens;
    }
  }
}
