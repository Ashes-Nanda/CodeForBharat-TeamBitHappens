const fs = require('fs');
const path = require('path');

const fixFile = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove unused React imports
  content = content.replace(/import React(?:,|\s+{.*?}) from ['"]react['"];?/g, (match) => {
    if (match.includes('{')) {
      // Keep the named imports but remove React
      return match.replace('React,', '').replace('React', '');
    }
    return '';
  });

  // Remove unused useState imports
  content = content.replace(/,?\s*useState\s*(?=,|})/g, '');
  
  // Remove unused useEffect imports
  content = content.replace(/,?\s*useEffect\s*(?=,|})/g, '');
  
  // Remove unused Button imports
  content = content.replace(/import\s*{\s*Button\s*}\s*from\s*['"]@\/components\/ui\/button['"];?/g, '');
  
  // Remove unused Theme imports
  content = content.replace(/,?\s*Theme\s*(?=,|})/g, '');
  
  // Remove unused getThemeClasses function
  content = content.replace(/const\s+getThemeClasses\s*=\s*\(\)\s*=>\s*{[^}]*};?/g, '');
  
  // Remove unused addEntry variable
  content = content.replace(/,?\s*addEntry\s*(?=,|})/g, '');
  
  // Remove unused index parameter
  content = content.replace(/,?\s*index\s*(?=,|})/g, '');
  
  // Remove unused ChevronLeft and ChevronRight imports
  content = content.replace(/import\s*{\s*ChevronLeft,\s*ChevronRight\s*}\s*from\s*['"]lucide-react['"];?/g, '');
  
  fs.writeFileSync(filePath, content);
};

const processDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(filePath);
    }
  });
};

// Start processing from the src directory
processDirectory(path.join(__dirname, 'src')); 