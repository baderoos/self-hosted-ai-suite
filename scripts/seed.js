// scripts/seed.js
// Node.js script to run SQL seed after supabase db reset
// Usage: node scripts/seed.js

const { execSync } = require('child_process');
const path = require('path');

const SEED_FILE = path.join(__dirname, '../supabase/seed.sql');

try {
  // Use Supabase CLI to run the SQL file against the local db
  execSync(`supabase db execute ${SEED_FILE}`, { stdio: 'inherit' });
  console.log('✅ Database seeded successfully.');
} catch (err) {
  console.error('❌ Error seeding database:', err.message);
  process.exit(1);
}
