const fs = require('fs');

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

  // Any line that has `registration={register('x')}` but does NOT have `<FormInput`
  // We can just revert ALL `registration={register...}` to `{...register...}`
  // EXCEPT for those inside FormInput.
  // Actually, I can just revert it for `<select`, `<textarea`, `<input`
  
  content = content.replace(/<select([^>]*?)registration=\{register\('([^']+)'\)\}/g, '<select$1{...register(\'$2\')}');
  content = content.replace(/<textarea([^>]*?)registration=\{register\('([^']+)'\)\}/g, '<textarea$1{...register(\'$2\')}');
  content = content.replace(/<input([^>]*?)registration=\{register\('([^']+)'([^}]*)\)\}/g, '<input$1{...register(\'$2\'$3)}');
  content = content.replace(/<select([^>]*?)registration=\{register\('([^']+)'([^}]*)\)\}/g, '<select$1{...register(\'$2\'$3)}');
  content = content.replace(/<textarea([^>]*?)registration=\{register\('([^']+)'([^}]*)\)\}/g, '<textarea$1{...register(\'$2\'$3)}');
  
  // also fix StockMovementForm.tsx types
  if (file.includes('StockMovementForm')) {
    // The previous replace might have broken the schema if it was something else.
    // Let's just fix the schema to quantity: z.coerce.number() if it's there.
    content = content.replace(/quantity:\s*z\.coerce\.number\(\)/g, 'quantity: z.number().or(z.string()).transform(val => Number(val))');
  }

  fs.writeFileSync(file, content);
}
console.log("Fixes 2 applied.");
