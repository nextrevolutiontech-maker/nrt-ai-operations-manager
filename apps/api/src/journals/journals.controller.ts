import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JournalsService } from './journals.service';
import { CreateJournalDto } from './dto/create-journal.dto';
import { JournalFilterDto } from './dto/journal-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Journals & Financial Posting')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('journals')
export class JournalsController {
  constructor(private readonly journalsService: JournalsService) {}

  @Post()
  @Permissions('manage:finance')
  @ApiOperation({
    summary: 'Create a new DRAFT Journal (Generic Posting Service)',
  })
  create(@Req() req: any, @Body() dto: CreateJournalDto) {
    return this.journalsService.create(req.user.companyId, req.user.id, dto);
  }

  @Post(':id/post')
  @Permissions('manage:finance')
  @ApiOperation({
    summary: 'Transition a Journal to POSTED status, making it immutable',
  })
  postJournal(@Req() req: any, @Param('id') id: string) {
    return this.journalsService.postJournal(
      req.user.companyId,
      id,
      req.user.id,
    );
  }

  @Get()
  @Permissions('read:finance')
  @ApiOperation({ summary: 'List and filter Journals' })
  findAll(@Req() req: any, @Query() query: JournalFilterDto) {
    return this.journalsService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:finance')
  @ApiOperation({ summary: 'View Journal details' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.journalsService.findOne(req.user.companyId, id, req.user.id);
  }
}
