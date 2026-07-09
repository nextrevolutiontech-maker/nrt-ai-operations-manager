import {
  Injectable,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportFilterDto, GenerateReportDto } from './dto/report-filter.dto';
import { ReportStatus, Prisma } from '@nrt-ai-workforce/database';
import { ExportData } from '../exports/providers/export-provider.interface';

@Injectable()
export class ReportsService implements OnModuleInit {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedTemplates();
  }

  private async seedTemplates() {
    const templates = [
      {
        code: 'INVENTORY_REPORT',
        name: 'Inventory Valuation & Stock Report',
        module: 'INVENTORY',
        description:
          'Comprehensive view of all active inventory across warehouses including stock levels and valuation.',
        defaultConfig: {
          columns: [
            { key: 'productSku', header: 'SKU' },
            { key: 'productName', header: 'Product Name' },
            { key: 'warehouseName', header: 'Warehouse' },
            { key: 'availableStock', header: 'Available Stock' },
            { key: 'reservedStock', header: 'Reserved Stock' },
            { key: 'damagedStock', header: 'Damaged Stock' },
            { key: 'minStockLevel', header: 'Min Stock Level' },
          ],
        },
      },
      {
        code: 'PRODUCT_REPORT',
        name: 'Product Catalog Report',
        module: 'CATALOG',
        description:
          'Export of product catalog data including pricing and categorizations.',
        defaultConfig: {
          columns: [
            { key: 'sku', header: 'SKU' },
            { key: 'name', header: 'Product Name' },
            { key: 'categoryName', header: 'Category' },
            { key: 'brandName', header: 'Brand' },
            { key: 'cost', header: 'Unit Cost' },
            { key: 'price', header: 'Selling Price' },
            { key: 'status', header: 'Status' },
          ],
        },
      },
      {
        code: 'SUPPLIER_REPORT',
        name: 'Supplier Database Report',
        module: 'PROCUREMENT',
        description:
          'Comprehensive list of registered suppliers and contact information.',
        defaultConfig: {
          columns: [
            { key: 'name', header: 'Supplier Name' },
            { key: 'contactPerson', header: 'Contact Person' },
            { key: 'email', header: 'Email' },
            { key: 'phone', header: 'Phone' },
            { key: 'status', header: 'Status' },
          ],
        },
      },
      {
        code: 'PURCHASE_ORDER_REPORT',
        name: 'Purchase Orders Register',
        module: 'PROCUREMENT',
        description:
          'Tracking all purchase orders and their current lifecycle statuses.',
        defaultConfig: {
          columns: [
            { key: 'orderNumber', header: 'PO Number' },
            { key: 'supplierName', header: 'Supplier' },
            { key: 'warehouseName', header: 'Target Warehouse' },
            { key: 'orderDate', header: 'Order Date' },
            { key: 'expectedDeliveryDate', header: 'Expected Delivery' },
            { key: 'totalAmount', header: 'Total Amount' },
            { key: 'status', header: 'Status' },
          ],
        },
      },
      {
        code: 'WAREHOUSE_REPORT',
        name: 'Warehouse Locations Report',
        module: 'INVENTORY',
        description: 'List of all warehouses.',
        defaultConfig: {
          columns: [
            { key: 'name', header: 'Warehouse Name' },
            { key: 'location', header: 'Location' },
            { key: 'capacity', header: 'Capacity' },
            { key: 'status', header: 'Status' },
          ],
        },
      },
      {
        code: 'WORKFLOW_REPORT',
        name: 'Workflow & Approvals Status',
        module: 'WORKFLOW',
        description:
          'List of all approval requests and their tracking details.',
        defaultConfig: {
          columns: [
            { key: 'workflowName', header: 'Workflow Name' },
            { key: 'entityType', header: 'Entity Type' },
            { key: 'status', header: 'Status' },
            { key: 'createdAt', header: 'Date Created' },
          ],
        },
      },
      {
        code: 'NOTIFICATION_REPORT',
        name: 'System Notifications Report',
        module: 'SYSTEM',
        description: 'Extract of system events and notifications.',
        defaultConfig: {
          columns: [
            { key: 'title', header: 'Title' },
            { key: 'message', header: 'Message' },
            { key: 'type', header: 'Type' },
            { key: 'priority', header: 'Priority' },
            { key: 'isRead', header: 'Read Status' },
            { key: 'createdAt', header: 'Date' },
          ],
        },
      },
    ];

    for (const t of templates) {
      const exists = await this.prisma.reportTemplate.findUnique({
        where: { code: t.code },
      });
      if (!exists) {
        await this.prisma.reportTemplate.create({ data: t });
        this.logger.log(`Seeded Report Template: ${t.code}`);
      }
    }
  }

  async create(companyId: string, userId: string, dto: CreateReportDto) {
    const template = await this.prisma.reportTemplate.findUnique({
      where: { id: dto.templateId },
    });
    if (!template) throw new NotFoundException('Report template not found');

    const report = await this.prisma.report.create({
      data: {
        ...dto,
        companyId,
        createdBy: userId,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'CREATE_REPORT', report.id);
    return report;
  }

  async findAllTemplates(module?: string) {
    const where = module ? { module } : {};
    return this.prisma.reportTemplate.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findAll(companyId: string, query: ReportFilterDto) {
    const { page = 1, limit = 10, search, module } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {
      companyId,
      deletedAt: null,
    };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }
    if (module) {
      where.template = { module };
    }

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        include: { template: true },
        skip: Number(skip),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(companyId: string, id: string, userId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { template: true },
    });
    if (!report) throw new NotFoundException('Report not found');

    await this.logAudit(companyId, userId, 'REPORT_VIEWED', report.id);
    return report;
  }

  async update(
    companyId: string,
    id: string,
    userId: string,
    dto: UpdateReportDto,
  ) {
    const report = await this.prisma.report.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!report) throw new NotFoundException('Report not found');

    const updated = await this.prisma.report.update({
      where: { id },
      data: { ...dto, updatedBy: userId },
    });

    await this.logAudit(companyId, userId, 'UPDATE_REPORT', updated.id);
    return updated;
  }

  async remove(companyId: string, id: string, userId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id, companyId, deletedAt: null },
    });
    if (!report) throw new NotFoundException('Report not found');

    const deleted = await this.prisma.report.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: ReportStatus.INACTIVE,
        updatedBy: userId,
      },
    });

    await this.logAudit(companyId, userId, 'DELETE_REPORT', deleted.id);
    return deleted;
  }

  async generateReportData(
    companyId: string,
    id: string,
    userId: string,
    dto: GenerateReportDto,
  ): Promise<ExportData> {
    const report = await this.prisma.report.findFirst({
      where: { id, companyId, deletedAt: null, status: ReportStatus.ACTIVE },
      include: { template: true },
    });
    if (!report) throw new NotFoundException('Report not found or inactive');

    const config: any = report.config || {};
    const selectedColumns = config.columns || []; // Array of { key, header }

    const {
      page = 1,
      limit = 50,
      filters = {},
      sortColumn,
      sortOrder = 'asc',
    } = dto;
    const skip = (page - 1) * limit;

    const queryWhere: any = { companyId, deletedAt: null, ...filters };
    const queryOrder: any = sortColumn
      ? { [sortColumn]: sortOrder }
      : { createdAt: 'desc' };

    let data: any[] = [];

    // Dynamically query based on template code
    switch (report.template.code) {
      case 'INVENTORY_REPORT':
        data = await this.prisma.inventory.findMany({
          where: { companyId, ...filters }, // Inventory might not have deletedAt
          skip: Number(skip),
          take: Number(limit),
          orderBy: sortColumn ? { [sortColumn]: sortOrder } : undefined,
          include: { product: true, warehouse: true },
        });
        // Flatten for export
        data = data.map((d: any) => ({
          ...d,
          productName: d.product?.name,
          productSku: d.product?.sku,
          warehouseName: d.warehouse?.name,
        }));
        break;
      case 'PRODUCT_REPORT':
        data = await this.prisma.product.findMany({
          where: queryWhere,
          skip: Number(skip),
          take: Number(limit),
          orderBy: queryOrder,
          include: { category: true, brand: true },
        });
        data = data.map((d: any) => ({
          ...d,
          categoryName: d.category?.name,
          brandName: d.brand?.name,
        }));
        break;
      case 'SUPPLIER_REPORT':
        data = await this.prisma.supplier.findMany({
          where: queryWhere,
          skip: Number(skip),
          take: Number(limit),
          orderBy: queryOrder,
        });
        break;
      case 'PURCHASE_ORDER_REPORT':
        data = await this.prisma.purchaseOrder.findMany({
          where: { companyId, ...filters }, // PO might not have deletedAt
          skip: Number(skip),
          take: Number(limit),
          orderBy: queryOrder,
          include: { supplier: true, warehouse: true },
        });
        data = data.map((d: any) => ({
          ...d,
          supplierName: d.supplier?.name,
          warehouseName: d.warehouse?.name,
        }));
        break;
      default:
        throw new BadRequestException(
          `Report template ${report.template.code} is not implemented for generation yet`,
        );
    }

    await this.logAudit(companyId, userId, 'REPORT_GENERATED', report.id);

    return {
      title: report.name,
      columns: selectedColumns,
      data,
    };
  }

  private async logAudit(
    companyId: string,
    userId: string,
    action: string,
    entityId: string,
  ) {
    await this.prisma.auditLog.create({
      data: {
        companyId,
        userId,
        action,
        entity: 'Report',
        entityId,
      },
    });
  }
}
