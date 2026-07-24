import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('company')
  getCompanyProfile(@Req() req: any) {
    return this.settingsService.getCompanyProfile(req.user.companyId);
  }

  @Patch('company')
  updateCompanyProfile(@Req() req: any, @Body() payload: any) {
    return this.settingsService.updateCompanyProfile(
      req.user.companyId,
      req.user.id,
      payload
    );
  }
}
