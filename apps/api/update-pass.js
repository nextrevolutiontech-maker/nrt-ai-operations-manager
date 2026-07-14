const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_L8HcwB3dlVYD@ep-floral-sky-atp441ii-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString });

async function main() {
  await pool.query(
    "UPDATE users SET password_hash = $1 WHERE email = $2",
    ['$2b$12$3H/4c1DEy494cgheuLf5ueTCTenbzPlG7VNgwwufpmfaT1FtJLFQy', 'admin@example.com']
  );
  console.log('Password updated via direct SQL');
}
main().finally(() => pool.end());
