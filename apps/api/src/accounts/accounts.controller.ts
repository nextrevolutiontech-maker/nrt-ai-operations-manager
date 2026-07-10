import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { AccountFilterDto } from './dto/account-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Chart of Accounts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @Permissions('manage:finance')
  @ApiOperation({ summary: 'Create a new account' })
  create(@Req() req: any, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(req.user.companyId, req.user.id, dto);
  }

  @Get()
  @Permissions('read:finance')
  @ApiOperation({ summary: 'List and filter accounts' })
  findAll(@Req() req: any, @Query() query: AccountFilterDto) {
    return this.accountsService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:finance')
  @ApiOperation({ summary: 'Get account details' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.accountsService.findOne(req.user.companyId, id);
  }

  @Patch(':id')
  @Permissions('manage:finance')
  @ApiOperation({ summary: 'Update an account' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(
      req.user.companyId,
      id,
      req.user.id,
      dto,
    );
  }

  @Delete(':id')
  @Permissions('manage:finance')
  @ApiOperation({ summary: 'Soft delete an account' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.accountsService.remove(req.user.companyId, id, req.user.id);
  }

  @Patch(':id/restore')
  @Permissions('manage:finance')
  @ApiOperation({ summary: 'Restore a deleted account' })
  restore(@Req() req: any, @Param('id') id: string) {
    return this.accountsService.restore(req.user.companyId, id, req.user.id);
  }
}
