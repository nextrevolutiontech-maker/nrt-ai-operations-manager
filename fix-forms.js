const fs = require('fs');
const path = require('path');

const files = [
  'd:/NRT AI EMPLOYES/nrt-ai-operations-manager/apps/web/src/components/forms/SupplierForm.tsx',
  'd:/NRT AI EMPLOYES/nrt-ai-operations-manager/apps/web/src/components/forms/CustomerForm.tsx',
  'd:/NRT AI EMPLOYES/nrt-ai-operations-manager/apps/web/src/components/forms/PurchaseOrderForm.tsx',
  'd:/NRT AI EMPLOYES/nrt-ai-operations-manager/apps/web/src/components/forms/SalesOrderForm.tsx',
  'd:/NRT AI EMPLOYES/nrt-ai-operations-manager/apps/web/src/components/forms/StockMovementForm.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix {...register('name')} -> registration={register('name')}
  content = content.replace(/\{\.\.\.register\('([^']+)'\)\}/g, 'registration={register(\'$1\')}');
  content = content.replace(/\{\.\.\.register\('([^']+)',\s*\{([^\}]+)\}\)\}/g, 'registration={register(\'$1\', {$2})}');

  // Fix inventoryService -> warehouseService
  if (content.includes('inventoryService.getAllWarehouses')) {
    content = content.replace('inventoryService.getAllWarehouses', 'warehouseService.getAll');
    content = content.replace('import { inventoryService } from \'../../services/inventory\';', 'import { warehouseService } from \'../../services/inventory\';');
  }

  // Fix StockMovementForm quantity issue
  if (file.includes('StockMovementForm')) {
    content = content.replace('quantity: z.number().or(z.string()).transform((val) => Number(val))', 'quantity: z.coerce.number().min(0.01)');
    content = content.replace('quantity: z.any()', 'quantity: z.coerce.number()'); // whatever the z schema is
  }

  fs.writeFileSync(file, content);
}
console.log("Fixes applied.");
