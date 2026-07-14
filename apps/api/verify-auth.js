const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const connectionString = "postgresql://neondb_owner:npg_L8HcwB3dlVYD@ep-floral-sky-atp441ii-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString });

async function main() {
  const res = await pool.query("SELECT email, password_hash FROM users WHERE email = 'admin@example.com'");
  if (res.rows.length === 0) {
    console.log('User admin@example.com NOT FOUND in Neon DB.');
    return;
  }
  
  const user = res.rows[0];
  console.log(`Found user: ${user.email}`);
  console.log(`Password Hash in DB: ${user.password_hash}`);
  
  const isValid = await bcrypt.compare('admin123', user.password_hash);
  console.log(`Verification of 'admin123' against DB hash: ${isValid ? 'SUCCESS' : 'FAILED'}`);
}

main().finally(() => pool.end());
