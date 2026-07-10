import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { UnitsModule } from './units/units.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { InventoriesModule } from './inventories/inventories.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { WorkflowsModule } from './workflows/workflows.module';
import { ApprovalsModule } from './approvals/approvals.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ActivitiesModule } from './activities/activities.module';
import { EventsModule } from './events/events.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ExportsModule } from './exports/exports.module';
import { ReportsModule } from './reports/reports.module';
import { CustomersModule } from './customers/customers.module';
import { SalesOrdersModule } from './sales-orders/sales-orders.module';
import { AccountsModule } from './accounts/accounts.module';
import { JournalsModule } from './journals/journals.module';
import { LedgerModule } from './ledger/ledger.module';

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
    PrismaModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    BrandsModule,
    UnitsModule,
    ProductsModule,
    WarehousesModule,
    InventoriesModule,
    StockMovementsModule,
    SuppliersModule,
    PurchaseOrdersModule,
    WorkflowsModule,
    ApprovalsModule,
    NotificationsModule,
    ActivitiesModule,
    EventsModule,
    DashboardsModule,
    AnalyticsModule,
    ExportsModule,
    ReportsModule,
    CustomersModule,
    SalesOrdersModule,
    AccountsModule,
    JournalsModule,
    LedgerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
