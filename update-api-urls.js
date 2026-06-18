const fs = require('fs');
const path = require('path');

// Directory to search
const directory = path.join(__dirname, 'frontend', 'src');

// String to search and replace
const searchStr = 'http://localhost:5001';
const replaceStr = '${API_BASE_URL}';
const importStr = "import API_BASE_URL from '@/lib/api';";

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
  const hasSearchStr = content.includes(searchStr);
  
  if (hasSearchStr) {
    // Replace the search string
    content = content.split(searchStr).join(`${replaceStr}`);
    
    // Add import if not already there
    if (!content.includes("import API_BASE_URL from '@/lib/api'")) {
      // Find the first import statement and add after it
      const lines = content.split('\n');
      let importLineIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import')) {
          importLineIndex = i;
        }
      }
      
      if (importLineIndex !== -1) {
        lines.splice(importLineIndex + 1, 0, importStr);
        content = lines.join('\n');
      }
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
});

console.log('All files processed!');
