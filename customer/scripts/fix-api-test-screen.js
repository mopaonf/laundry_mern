// This script fixes the Colors references in ApiTestScreen.tsx
const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../app/ApiTestScreen.tsx');

try {
   // Read the file
   let content = fs.readFileSync(filePath, 'utf8');

   // Replace all Colors references with CustomColors
   content = content.replace(/Colors\.success/g, 'CustomColors.success');
   content = content.replace(/Colors\.error/g, 'CustomColors.error');
   content = content.replace(/Colors\.primary/g, 'CustomColors.primary');
   content = content.replace(/Colors\.light/g, 'CustomColors.light');

   // Write the file back
   fs.writeFileSync(filePath, content);

   console.log('Successfully updated ApiTestScreen.tsx');
} catch (error) {
   console.error('Error updating ApiTestScreen.tsx:', error);
}
