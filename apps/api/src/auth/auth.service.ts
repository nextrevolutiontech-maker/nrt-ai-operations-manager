import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user || !user.isActive) {
      this.logAudit(user?.id, user?.companyId, 'LOGIN_FAILED', 'User', user?.id || 'unknown');
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logAudit(user.id, user.companyId, 'LOGIN_FAILED', 'User', user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.companyId, ipAddress, userAgent);
    
    this.logAudit(user.id, user.companyId, 'LOGIN_SUCCESS', 'User', user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      ...tokens,
    };
  }

  async logout(sessionId: string, userId: string, companyId?: string) {
    await this.prisma.session.updateMany({
      where: {
        id: sessionId,
        userId: userId,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    this.logAudit(userId, companyId, 'LOGOUT_SUCCESS', 'Session', sessionId);
    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const session = await this.prisma.session.findUnique({
        where: { id: payload.sessionId },
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      // Token rotation security: If token is already revoked, this indicates potential token theft.
      // We must revoke ALL active sessions for this user to be safe.
      if (session.revokedAt) {
        await this.prisma.session.updateMany({
          where: { userId: session.userId },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Security alert: Token reuse detected. All sessions revoked.');
      }

      const isTokenValid = await bcrypt.compare(refreshToken, session.hashedRefreshToken);
      if (!isTokenValid) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Revoke old session and create a new one (Token Rotation)
      await this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });

      const user = await this.usersService.findById(session.userId);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User is inactive or deleted');
      }

      return this.generateTokens(user.id, user.email, user.companyId, ipAddress, userAgent);
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(userId: string, companyId: string, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(changePasswordDto.oldPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid old password');
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const newPasswordHash = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Optionally revoke all sessions here so they have to re-login
    await this.prisma.session.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    this.logAudit(userId, companyId, 'PASSWORD_CHANGED', 'User', userId);

    return { message: 'Password changed successfully' };
  }

  private async generateTokens(userId: string, email: string, companyId: string, ipAddress?: string, userAgent?: string) {
    const accessTokenPayload = { sub: userId, email, companyId };
    const accessToken = this.jwtService.sign(accessTokenPayload);

    // Calculate expiration date (default 7 days)
    const refreshExpiresInDays = parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS || '7', 10);
    const expiresAt = new Date(Date.now() + refreshExpiresInDays * 24 * 60 * 60 * 1000);

    // Create session record to get sessionId
    const session = await this.prisma.session.create({
      data: {
        userId,
        hashedRefreshToken: '', // Will update
        ipAddress,
        userAgent,
        expiresAt,
      },
    });

    const refreshTokenPayload = { sub: userId, sessionId: session.id };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: `${refreshExpiresInDays}d`,
    });

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
    const hashedRefreshToken = await bcrypt.hash(refreshToken, saltRounds);

    await this.prisma.session.update({
      where: { id: session.id },
      data: { hashedRefreshToken },
    });

    return {
      accessToken,
      refreshToken,
      sessionId: session.id, // Usually sent so client knows which session to logout
    };
  }

  private logAudit(userId: string | undefined, companyId: string | undefined, action: string, entity: string, entityId: string) {
    // Only attempt to log if companyId exists to respect constraints
    // If system-wide logging is supported (companyId nullable), we handle that too.
    this.prisma.auditLog.create({
      data: {
        userId: userId || null,
        companyId: companyId || null,
        action,
        entity,
        entityId,
      },
    }).catch((e: any) => console.error('Failed to write audit log', e));
  }
}
