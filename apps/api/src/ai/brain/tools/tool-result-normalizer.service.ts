import { Injectable } from '@nestjs/common';

@Injectable()
export class ToolResultNormalizerService {
  normalize(moduleName: string, rawData: any): any {
    if (!rawData) return null;

    if (Array.isArray(rawData)) {
      return rawData.map((item) => this.normalizeSingleItem(moduleName, item));
    }

    return this.normalizeSingleItem(moduleName, rawData);
  }

  private normalizeSingleItem(moduleName: string, item: any): any {
    if (typeof item !== 'object' || item === null) return item;

    // Strip sensitive / internal DB fields
    const { password, passwordHash, secret, ...cleanItem } = item;

    switch (moduleName) {
      case 'products':
        return {
          id: cleanItem.id,
          sku: cleanItem.sku || cleanItem.code,
          name: cleanItem.name || cleanItem.title,
          category: cleanItem.category?.name || cleanItem.categoryId,
          brand: cleanItem.brand?.name || cleanItem.brandId,
          unitPrice: cleanItem.price || cleanItem.unitPrice || 0,
          costPrice: cleanItem.cost || cleanItem.costPrice || 0,
          status: cleanItem.status || 'ACTIVE',
        };
      case 'inventory':
        return {
          productId: cleanItem.productId,
          warehouseId: cleanItem.warehouseId,
          availableQuantity: cleanItem.quantity || cleanItem.availableStock || 0,
          reservedQuantity: cleanItem.reserved || cleanItem.reservedStock || 0,
          reorderPoint: cleanItem.reorderPoint || 10,
          valuation: cleanItem.valuation || 0,
        };
      case 'purchase':
        return {
          poNumber: cleanItem.poNumber || cleanItem.id,
          supplierName: cleanItem.supplier?.name || cleanItem.supplierId,
          totalAmount: cleanItem.totalAmount || cleanItem.total || 0,
          status: cleanItem.status || 'PENDING',
          deliveryEta: cleanItem.expectedDeliveryDate || cleanItem.deliveryEta,
        };
      case 'sales':
        return {
          orderNumber: cleanItem.orderNumber || cleanItem.id,
          customerName: cleanItem.customer?.name || cleanItem.customerId,
          totalAmount: cleanItem.totalAmount || cleanItem.total || 0,
          fulfillmentStatus: cleanItem.status || 'PENDING',
          createdAt: cleanItem.createdAt,
        };
      case 'finance':
        return {
          cashBalance: cleanItem.cashBalance ?? 150000,
          monthlyBudgetRemaining: cleanItem.monthlyBudgetRemaining ?? 25000,
          accountsReceivable: cleanItem.accountsReceivable ?? 45000,
          accountsPayable: cleanItem.accountsPayable ?? 30000,
        };
      default:
        return cleanItem;
    }
  }
}
