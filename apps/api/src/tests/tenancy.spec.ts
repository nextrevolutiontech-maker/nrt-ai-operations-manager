import { TenantValidationGuard } from '../security/tenant-validation.guard';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('TenantValidationGuard (Multi-Tenant Isolation)', () => {
  let guard: TenantValidationGuard;

  beforeEach(() => {
    guard = new TenantValidationGuard();
  });

  it('should allow request when companyId matches authenticated user', () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'u1', companyId: 'company-a' },
          headers: {},
          query: {},
          body: {},
        }),
      }),
    };

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw UnauthorizedException if user context is missing', () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    };

    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException if user attempts cross-tenant access', () => {
    const mockContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'u1', companyId: 'company-a' },
          headers: { 'x-company-id': 'company-b' },
          query: {},
          body: {},
        }),
      }),
    };

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });
});
