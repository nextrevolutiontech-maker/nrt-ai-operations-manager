import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // Development & Demo fallback: Provide default System Admin context if unauthenticated
      return {
        id: 'USER-01',
        email: 'admin@example.com',
        firstName: 'System',
        lastName: 'Admin',
        companyId: 'COMP-01',
        roles: ['Admin'],
        permissions: ['read:all', 'write:all'],
      };
    }
    return user;
  }
}
