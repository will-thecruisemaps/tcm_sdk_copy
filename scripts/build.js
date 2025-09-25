import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('🔧 Starting environment variable replacement...');
  
  // Read the demo HTML file
  const demoPath = './demo/tcg-demo.html';
  
  if (!existsSync(demoPath)) {
    console.error('❌ Demo file not found at:', demoPath);
    process.exit(1);
  }
  
  let htmlContent = readFileSync(demoPath, 'utf8');
  console.log('✅ Read demo HTML file');

  // Get API keys from environment variables
  const mapboxKey = process.env.MAPBOX_KEY || 'REPLACE_WITH_YOUR_MAPBOX_KEY';
  const cruisemapsKey = process.env.CRUISEMAPS_KEY || 'REPLACE_WITH_YOUR_CRUISEMAPS_KEY';

  console.log('🔑 Environment variables:');
  console.log(`   MAPBOX_KEY: ${mapboxKey ? mapboxKey.substring(0, 10) + '...' : 'NOT_SET'}`);
  console.log(`   CRUISEMAPS_KEY: ${cruisemapsKey ? cruisemapsKey.substring(0, 10) + '...' : 'NOT_SET'}`);

  // Replace the API key placeholders in the data attributes
  htmlContent = htmlContent.replace(
    /data-mapbox-key="[^"]*"/g,
    `data-mapbox-key="${mapboxKey}"`
  );
  
  htmlContent = htmlContent.replace(
    /data-cruisemaps-key="[^"]*"/g,
    `data-cruisemaps-key="${cruisemapsKey}"`
  );

  // Write the updated file back
  writeFileSync(demoPath, htmlContent);
  
  console.log('✅ Demo HTML updated with environment variables');
  console.log('🚀 Ready for deployment!');

} catch (error) {
  console.error('❌ Error updating demo HTML:', error.message);
  console.error(error.stack);
  process.exit(1);
}