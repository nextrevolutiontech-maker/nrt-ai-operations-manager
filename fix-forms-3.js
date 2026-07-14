const fs = require('fs');
const path = require('path');

const root = 'd:/NRT AI EMPLOYES/nrt-ai-operations-manager/apps/web/src';

// 1. Fix PurchaseOrderForm and SalesOrderForm
for (const file of ['components/forms/PurchaseOrderForm.tsx', 'components/forms/SalesOrderForm.tsx']) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  let text = fs.readFileSync(p, 'utf8');
  text = text.replace(/import\s*\{\s*masterDataService\s*\}\s*from\s*'([^']+)';/, "import { productService } from '$1';");
  text = text.replace(/masterDataService\.getAllProducts/g, "productService.getAll");
  fs.writeFileSync(p, text);
}

// 2. Fix ProductForm Zod schemas
{
  const p = path.join(root, 'components/forms/ProductForm.tsx');
  if (fs.existsSync(p)) {
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/price:\s*z\.string\(\)\.or\(z\.number\(\)\)/g, "price: z.coerce.number()");
    text = text.replace(/cost:\s*z\.string\(\)\.or\(z\.number\(\)\)/g, "cost: z.coerce.number()");
    text = text.replace(/minStockLevel:\s*z\.string\(\)\.or\(z\.number\(\)\)/g, "minStockLevel: z.coerce.number()");
    text = text.replace(/maxStockLevel:\s*z\.string\(\)\.or\(z\.number\(\)\)/g, "maxStockLevel: z.coerce.number()");
    text = text.replace(/reorderLevel:\s*z\.string\(\)\.or\(z\.number\(\)\)/g, "reorderLevel: z.coerce.number()");
    fs.writeFileSync(p, text);
  }
}

// 3. Fix JournalForm Zod schemas
{
  const p = path.join(root, 'components/forms/JournalForm.tsx');
  if (fs.existsSync(p)) {
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/debit:\s*z\.string\(\)\.or\(z\.number\(\)\)\.optional\(\)\.transform[^\,]+,/g, "debit: z.coerce.number().optional().default(0),");
    text = text.replace(/credit:\s*z\.string\(\)\.or\(z\.number\(\)\)\.optional\(\)\.transform[^\,]+,/g, "credit: z.coerce.number().optional().default(0),");
    // fallback if previous regex fails:
    text = text.replace(/debit:\s*z\.any\(\),/g, "debit: z.coerce.number().default(0),");
    text = text.replace(/credit:\s*z\.any\(\),/g, "credit: z.coerce.number().default(0),");
    
    // Actually the exact string in JournalForm might be: `debit: z.number().or(z.string()).transform(val => Number(val) || 0).optional(),`
    // I will just use regex to replace everything after `debit:` up to the comma
    text = text.replace(/debit:\s*z\.[^,]+,/g, "debit: z.coerce.number().default(0),");
    text = text.replace(/credit:\s*z\.[^,]+,/g, "credit: z.coerce.number().default(0),");
    fs.writeFileSync(p, text);
  }
}

// 4. Fix StockMovementForm Zod schema
{
  const p = path.join(root, 'components/forms/StockMovementForm.tsx');
  if (fs.existsSync(p)) {
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/quantity:\s*z\.[^,]+,/g, "quantity: z.coerce.number().min(0.01),");
    fs.writeFileSync(p, text);
  }
}

// 5. Fix Lucide icon title in inventory stock page
{
  const p = path.join(root, 'app/inventory/stock/page.tsx');
  if (fs.existsSync(p)) {
    let text = fs.readFileSync(p, 'utf8');
    text = text.replace(/title="Low Stock"/g, ""); // remove title prop
    fs.writeFileSync(p, text);
  }
}

console.log("Fixes 3 applied.");
