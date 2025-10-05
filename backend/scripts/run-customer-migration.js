#!/usr/bin/env node

/**
 * Customer ID Migration Runner
 * This script runs the migration to assign PL customer IDs to existing customers
 */

const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Starting Customer ID Migration...\n');

// Add the backend directory to the path so we can require our modules
process.chdir(path.join(__dirname, '..'));

// Run the migration script
const migrationPath = path.join(__dirname, 'migrate-customer-ids.js');

exec(`node "${migrationPath}"`, (error, stdout, stderr) => {
   if (error) {
      console.error('❌ Migration failed:', error);
      return;
   }

   if (stderr) {
      console.error('⚠️ Migration warnings:', stderr);
   }

   console.log(stdout);
   console.log('\n✅ Migration completed successfully!');
   console.log('\n📋 Next Steps:');
   console.log('1. Verify the migration results above');
   console.log(
      '2. Test customer registration to ensure new customers get PL IDs'
   );
   console.log('3. Update your frontend to display customer IDs where needed');
   console.log(
      '4. Consider updating any existing reports or exports to include customer IDs'
   );
});
