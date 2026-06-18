const fs = require('fs');
const path = require('path');

// Directory to search
const directory = path.join(__dirname, 'frontend', 'src');

// Walk through directory
function walkDir(dir) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results.push(...walkDir(filePath));
    } else if (
      filePath.endsWith('.ts') ||
      filePath.endsWith('.tsx')
    ) {
      results.push(filePath);
    }
  });
  return results;
}

// Process all files
const files = walkDir(directory);
console.log(`Found ${files.length} files to process...`);

files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace '${API_BASE_URL}' with `${API_BASE_URL}` (backticks)
  const oldPattern = /'\$\{API_BASE_URL\}'/g;
  if (content.match(oldPattern)) {
    content = content.replace(oldPattern, '`${API_BASE_URL}`');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
  }
});

console.log('All files fixed!');
