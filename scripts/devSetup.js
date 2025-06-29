// scripts/devSetup.js
// Run all seeding steps for local/dev setup, including db reset and tests

const { execSync } = require('child_process');

try {
  console.log('Resetting Supabase database...');
  execSync('supabase db reset --no-confirm', { stdio: 'inherit' });
  console.log('Seeding database tables...');
  execSync('npm run seed', { stdio: 'inherit' });
  console.log('Seeding users and memberships...');
  execSync('npm run seed:users', { stdio: 'inherit' });
  console.log('Running tests...');
  execSync('npm test', { stdio: 'inherit' });
  console.log('\n✅ Local development database, users, and tests are ready!');
} catch (err) {
  console.error('❌ Error during dev setup:', err.message);
  process.exit(1);
}

// Sentry should be initialized in the main application entry point only.
