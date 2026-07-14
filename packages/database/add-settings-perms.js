const { Pool } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

let connectionString = "postgresql://postgres:postgres@localhost:5432/nrt_ai_ops_dev?schema=public";
try {
  const envPath = path.join(__dirname, '../../apps/api/.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/DATABASE_URL=([^\r\n]+)/);
  if (match) {
    connectionString = match[1].replace(/['"]/g, '').trim();
  }
} catch (e) {
  console.log("Could not parse .env, using default connection string");
}

console.log("Using DB URL:", connectionString.replace(/:[^:@]+@/, ':***@'));

const pool = new Pool({ connectionString });

async function main() {
  const permissions = [
    'read:settings', 'update:settings', 'read:notifications'
  ];

  const adminRoleRes = await pool.query("SELECT id FROM roles WHERE name = 'Admin'");
  if (adminRoleRes.rows.length === 0) {
    console.log("Admin role not found!");
    return;
  }
  const adminRoleId = adminRoleRes.rows[0].id;

  for (const permName of permissions) {
    let permRes = await pool.query("SELECT id FROM permissions WHERE name = $1", [permName]);
    let permId;
    if (permRes.rows.length === 0) {
       permId = crypto.randomUUID();
       await pool.query(
         "INSERT INTO permissions (id, name, description, updated_at) VALUES ($1, $2, $3, NOW())",
         [permId, permName, `Auto-generated permission: ${permName}`]
       );
       console.log(`Created permission: ${permName}`);
    } else {
       permId = permRes.rows[0].id;
    }

    const existingLinkRes = await pool.query(
      "SELECT * FROM role_permissions WHERE role_id = $1 AND permission_id = $2",
      [adminRoleId, permId]
    );
    
    if (existingLinkRes.rows.length === 0) {
      const linkId = crypto.randomUUID();
      await pool.query(
        "INSERT INTO role_permissions (id, role_id, permission_id) VALUES ($1, $2, $3)",
        [linkId, adminRoleId, permId]
      );
      console.log(`Assigned ${permName} to Admin role`);
    }
  }

  console.log('Settings permissions successfully injected.');
}

main().catch(console.error).finally(() => pool.end());
