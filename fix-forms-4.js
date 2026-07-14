const fs = require('fs');
const path = require('path');

const root = 'd:/NRT AI EMPLOYES/nrt-ai-operations-manager/apps/web/src';

// ProductForm
{
  const p = path.join(root, 'components/forms/ProductForm.tsx');
  let text = fs.readFileSync(p, 'utf8');
  text = text.replace(/price: z\.coerce\.number\(\)\.min\(0,\s*'[^']+'\),/g, 'price: z.any().transform(val => Number(val) || 0),');
  text = text.replace(/cost: z\.coerce\.number\(\)\.min\(0,\s*'[^']+'\),/g, 'cost: z.any().transform(val => Number(val) || 0),');
  text = text.replace(/minStockLevel: z\.coerce\.number\(\)\.min\(0\)\.default\(0\),/g, 'minStockLevel: z.any().transform(val => Number(val) || 0),');
  text = text.replace(/maxStockLevel: z\.coerce\.number\(\)\.min\(0\)\.optional\(\),/g, 'maxStockLevel: z.any().transform(val => val ? Number(val) : undefined).optional(),');
  text = text.replace(/reorderLevel: z\.coerce\.number\(\)\.min\(0\)\.default\(0\),/g, 'reorderLevel: z.any().transform(val => Number(val) || 0),');
  fs.writeFileSync(p, text);
}

// JournalForm
{
  const p = path.join(root, 'components/forms/JournalForm.tsx');
  let text = fs.readFileSync(p, 'utf8');
  text = text.replace(/debit: z\.coerce\.number\(\)\.default\(0\),/g, 'debit: z.any().transform(val => Number(val) || 0),');
  text = text.replace(/credit: z\.coerce\.number\(\)\.default\(0\),/g, 'credit: z.any().transform(val => Number(val) || 0),');
  fs.writeFileSync(p, text);
}

// StockMovementForm
{
  const p = path.join(root, 'components/forms/StockMovementForm.tsx');
  let text = fs.readFileSync(p, 'utf8');
  text = text.replace(/quantity: z\.coerce\.number\(\)\.min\(0\.01,\s*'[^']+'\),/g, 'quantity: z.any().transform(val => Number(val) || 0),');
  fs.writeFileSync(p, text);
}

console.log("Fixes 4 applied.");
