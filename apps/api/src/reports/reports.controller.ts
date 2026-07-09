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
  Res,
  BadRequestException,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ExportsService } from '../exports/exports.service';
import { CreateReportTemplateDto } from './dto/create-report-template.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportFilterDto, GenerateReportDto } from './dto/report-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly exportsService: ExportsService,
  ) {}

  @Get('templates')
  @Permissions('read:report')
  @ApiOperation({ summary: 'List all global report templates' })
  @ApiQuery({ name: 'module', required: false, type: String })
  findAllTemplates(@Query('module') module?: string) {
    return this.reportsService.findAllTemplates(module);
  }

  @Post()
  @Permissions('manage:report')
  @ApiOperation({ summary: 'Create a customized report' })
  create(@Req() req: any, @Body() dto: CreateReportDto) {
    return this.reportsService.create(req.user.companyId, req.user.id, dto);
  }

  @Get()
  @Permissions('read:report')
  @ApiOperation({ summary: 'List all custom reports' })
  findAll(@Req() req: any, @Query() query: ReportFilterDto) {
    return this.reportsService.findAll(req.user.companyId, query);
  }

  @Get(':id')
  @Permissions('read:report')
  @ApiOperation({ summary: 'Get report details by ID' })
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.findOne(req.user.companyId, id, req.user.id);
  }

  @Patch(':id')
  @Permissions('manage:report')
  @ApiOperation({ summary: 'Update a report configuration' })
  update(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
  ) {
    return this.reportsService.update(req.user.companyId, id, req.user.id, dto);
  }

  @Delete(':id')
  @Permissions('manage:report')
  @ApiOperation({ summary: 'Soft delete a report' })
  remove(@Req() req: any, @Param('id') id: string) {
    return this.reportsService.remove(req.user.companyId, id, req.user.id);
  }

  @Post(':id/generate')
  @Permissions('read:report')
  @ApiOperation({ summary: 'Generate report data dynamically' })
  generateReport(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: GenerateReportDto,
  ) {
    return this.reportsService.generateReportData(
      req.user.companyId,
      id,
      req.user.id,
      dto,
    );
  }

  @Get(':id/export')
  @Permissions('export:report')
  @ApiOperation({ summary: 'Export report data to PDF, Excel, or CSV' })
  @ApiQuery({ name: 'format', required: true, enum: ['pdf', 'excel', 'csv'] })
  async exportReport(
    @Req() req: any,
    @Res() res: Response,
    @Param('id') id: string,
    @Query('format') format: string,
  ) {
    if (!['pdf', 'excel', 'csv', 'xlsx'].includes(format.toLowerCase())) {
      throw new BadRequestException('Invalid format specified');
    }

    // Pass default empty dto, filters could be accepted via query strings or a POST request to export
    const exportData = await this.reportsService.generateReportData(
      req.user.companyId,
      id,
      req.user.id,
      { page: 1, limit: 10000 }, // Max 10k rows for export right now
    );

    const { content, contentType, extension } =
      await this.exportsService.exportData(format, exportData);

    const filename = `${exportData.title.replace(/\s+/g, '_')}_${Date.now()}.${extension}`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    if (Buffer.isBuffer(content)) {
      res.send(content);
    } else {
      content.pipe(res);
    }
  }
}
