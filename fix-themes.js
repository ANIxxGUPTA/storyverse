const fs = require('fs');
const path = require('path');

function replaceInFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInFiles(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      const replacements = [
        { regex: /text-zinc-100(?! dark:)/g, replacement: 'text-zinc-900 dark:text-zinc-100' },
        { regex: /text-zinc-200(?! dark:)/g, replacement: 'text-zinc-800 dark:text-zinc-200' },
        { regex: /text-zinc-300(?! dark:)/g, replacement: 'text-zinc-700 dark:text-zinc-300' },
        { regex: /text-zinc-400(?! dark:)/g, replacement: 'text-zinc-600 dark:text-zinc-400' },
        // also fix bg-zinc-950/80 which was missed by previous script
        { regex: /bg-zinc-950\/80(?! dark:)/g, replacement: 'bg-white/80 dark:bg-zinc-950/80' },
        { regex: /bg-zinc-900\/(\d+)(?! dark:)/g, replacement: 'bg-zinc-100/$1 dark:bg-zinc-900/$1' },
      ];

      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          changed = true;
        }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInFiles('src');
