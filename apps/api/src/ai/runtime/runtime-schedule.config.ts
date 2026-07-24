export interface RuntimeScheduleConfig {
  inventoryMonitorIntervalMs: number;
  warehouseMonitorIntervalMs: number;
  purchaseMonitorIntervalMs: number;
  supplierMonitorIntervalMs: number;
  salesMonitorIntervalMs: number;
  financeMonitorIntervalMs: number;
  customerMonitorIntervalMs: number;
  dashboardMonitorIntervalMs: number;
  kpiMonitorIntervalMs: number;
  eventReplayIntervalMs: number;
  escalationCheckIntervalMs: number;
  cron: {
    dailySummary: string;
    weeklyReview: string;
    monthlyBusinessReview: string;
  };
}

export const RUNTIME_SCHEDULE_CONFIG: RuntimeScheduleConfig = {
  inventoryMonitorIntervalMs: Number(process.env.MONITOR_INV_MS) || 60000,
  warehouseMonitorIntervalMs: Number(process.env.MONITOR_WH_MS) || 60000,
  purchaseMonitorIntervalMs: Number(process.env.MONITOR_PO_MS) || 120000,
  supplierMonitorIntervalMs: Number(process.env.MONITOR_SUPP_MS) || 300000,
  salesMonitorIntervalMs: Number(process.env.MONITOR_SALES_MS) || 60000,
  financeMonitorIntervalMs: Number(process.env.MONITOR_FIN_MS) || 300000,
  customerMonitorIntervalMs: Number(process.env.MONITOR_CUST_MS) || 300000,
  dashboardMonitorIntervalMs: Number(process.env.MONITOR_DASH_MS) || 30000,
  kpiMonitorIntervalMs: Number(process.env.MONITOR_KPI_MS) || 300000,
  eventReplayIntervalMs: 15000,
  escalationCheckIntervalMs: 60000,
  cron: {
    dailySummary: '0 18 * * *', // 18:00 daily
    weeklyReview: '0 8 * * 1', // Monday 08:00
    monthlyBusinessReview: '0 9 1 * *', // 1st of month 09:00
  },
};
