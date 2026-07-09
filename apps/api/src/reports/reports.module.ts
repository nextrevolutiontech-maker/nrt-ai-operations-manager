import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ExportsModule } from '../exports/exports.module';

@Module({
  imports: [ExportsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
