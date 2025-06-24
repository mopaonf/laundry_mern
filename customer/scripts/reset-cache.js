const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧹 Starting project cleanup...');

// Folders to delete
const foldersToDelete = ['.expo', 'node_modules', '.metro-cache'];

// Delete specified folders
foldersToDelete.forEach((folder) => {
   const folderPath = path.join(__dirname, '..', folder);

   if (fs.existsSync(folderPath)) {
      console.log(`Removing ${folder}...`);
      try {
         execSync(`rmdir /s /q "${folderPath}"`, { stdio: 'inherit' });
      } catch (error) {
         console.error(`Failed to remove ${folder}:`, error.message);
      }
   } else {
      console.log(`${folder} doesn't exist, skipping...`);
   }
});

// Clear watchman watches if available
try {
   console.log('Clearing Watchman watches...');
   execSync('watchman watch-del-all', { stdio: 'inherit' });
} catch (error) {
   // Watchman might not be installed, that's okay
   console.log('Watchman not installed or command failed, skipping...');
}

// Install packages again
console.log('📦 Reinstalling packages...');
try {
   execSync('npm install', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
   });
} catch (error) {
   console.error('Failed to install packages:', error.message);
   process.exit(1);
}

console.log('✅ Project reset completed!');
