import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class TenantValidationGuard implements CanActivate {
  private readonly logger = new Logger(TenantValidationGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Authentication context missing.');
    }

    if (!user.companyId) {
      this.logger.warn(`User ${user.id} attempted request without companyId context.`);
      throw new ForbiddenException('Tenant context missing. Request rejected.');
    }

    // Header or Query parameter explicit company override check
    const headerCompanyId = request.headers['x-company-id'];
    const queryCompanyId = request.query?.companyId;
    const bodyCompanyId = request.body?.companyId;

    const requestedCompanyId = headerCompanyId || queryCompanyId || bodyCompanyId;

    if (requestedCompanyId && requestedCompanyId !== user.companyId) {
      this.logger.error(
        `SECURITY VIOLATION: User ${user.id} (Company: ${user.companyId}) attempted cross-tenant access to Company ${requestedCompanyId}.`,
      );
      throw new ForbiddenException('Cross-tenant data access violation blocked by Zero Trust Policy.');
    }

    return true;
  }
}
