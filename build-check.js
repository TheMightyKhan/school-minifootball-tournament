const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const componentsDir = path.join(__dirname, 'components');
const filesToCheck = [
  'Dashboard.js',
  'PlayerProfileModal.js',
  'MatchAnalyticsModal.js',
  'ui.js',
  'Players.js',
  'GlobalSearchModal.js',
  'PublicAiChatbot.js',
  'AdminDashboard.js'
];

console.log('Build check started...');
let hasError = false;

filesToCheck.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: ${file} does not exist.`);
    hasError = true;
    return;
  }
  
  try {
    // node --check parses the file for syntax errors
    execSync(`node --check "${filePath}"`, { stdio: 'pipe' });
    console.log(`SUCCESS: ${file} passed syntax check.`);
  } catch (err) {
    console.error(`ERROR in ${file}: Syntax error detected.`);
    console.error(err.stderr ? err.stderr.toString() : err.message);
    hasError = true;
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log('Build check passed successfully!');
}
