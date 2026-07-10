import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerStatementDto } from './dto/ledger-statement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('General Ledger')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('statement')
  @Permissions('read:finance')
  @ApiOperation({
    summary: 'Generate dynamic ledger statement with running balance',
  })
  getStatement(@Req() req: any, @Query() query: LedgerStatementDto) {
    return this.ledgerService.getStatement(req.user.companyId, query);
  }
}
