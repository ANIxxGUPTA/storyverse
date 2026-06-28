const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const original = content;

  // 1. Buttons
  // bg-violet-500 hover:bg-violet-600 text-zinc-900 dark:text-white
  content = content.replace(/bg-violet-500 hover:bg-violet-600 text-zinc-900 dark:text-white/g, 'bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900');
  
  // bg-gradient-to-r from-violet-500 to-purple-600 text-zinc-900 dark:text-white
  content = content.replace(/bg-gradient-to-r from-violet-500 to-purple-600 text-zinc-900 dark:text-white/g, 'bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900');
  
  // bg-gradient-to-r from-violet-500 to-fuchsia-600 font-semibold text-zinc-900 dark:text-white
  content = content.replace(/bg-gradient-to-r from-violet-500 to-fuchsia-600/g, 'bg-zinc-900 dark:bg-white');
  content = content.replace(/bg-gradient-to-r from-violet-500 to-purple-600/g, 'bg-zinc-900 dark:bg-white');
  
  content = content.replace(/font-semibold text-zinc-900 dark:text-white hover:opacity-90 transition px-6 flex/g, 'font-semibold text-white dark:text-zinc-900 hover:opacity-90 transition px-6 flex');
  content = content.replace(/font-semibold text-zinc-900 dark:text-white hover:opacity-90 transition duration-200/g, 'font-semibold text-white dark:text-zinc-900 hover:opacity-90 transition duration-200');

  // bg-purple-600 hover:bg-purple-700 text-zinc-900 dark:text-white
  content = content.replace(/bg-purple-600 hover:bg-purple-700 text-zinc-900 dark:text-white/g, 'bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900');
  
  content = content.replace(/bg-gradient-to-r from-violet-500 to-purple-600 text-white/g, 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900');

  // 2. Gradients / Backgrounds
  // bg-gradient-to-br from-violet-500 to-purple-600
  content = content.replace(/bg-gradient-to-br from-violet-500 to-purple-600/g, 'bg-zinc-100 dark:bg-zinc-900');
  // bg-gradient-to-t from-violet-500 to-fuchsia-400
  content = content.replace(/bg-gradient-to-t from-violet-500 to-fuchsia-400/g, 'bg-zinc-800 dark:bg-zinc-200');
  // bg-gradient-to-r from-violet-500 to-purple-650 (Progress bar)
  content = content.replace(/bg-gradient-to-r from-violet-500 to-purple-650/g, 'bg-zinc-900 dark:bg-white');
  
  // 3. Texts
  content = content.replace(/text-violet-500/g, 'text-zinc-900 dark:text-white');
  content = content.replace(/hover:text-violet-500/g, 'hover:text-zinc-900 dark:hover:text-white');
  content = content.replace(/hover:text-violet-400/g, 'hover:text-zinc-900 dark:hover:text-white');
  content = content.replace(/group-hover:text-violet-500/g, 'group-hover:text-zinc-900 dark:group-hover:text-white');
  content = content.replace(/text-purple-500/g, 'text-zinc-900 dark:text-white');
  content = content.replace(/text-rose-500/g, 'text-zinc-900 dark:text-white');
  content = content.replace(/text-cyan-500/g, 'text-zinc-900 dark:text-white');

  // 4. Borders & Rings
  content = content.replace(/border-violet-500\/20/g, 'border-zinc-300 dark:border-zinc-700');
  content = content.replace(/focus:border-violet-500/g, 'focus:border-zinc-900 dark:focus:border-white');
  content = content.replace(/focus:ring-violet-500/g, 'focus:ring-zinc-900 dark:focus:ring-white');
  content = content.replace(/ring-violet-500/g, 'ring-zinc-900 dark:ring-white');
  
  // 5. Background Highlights
  content = content.replace(/bg-violet-500 text-zinc-900 dark:text-white/g, 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900');
  content = content.replace(/bg-violet-500 text-white/g, 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900');
  content = content.replace(/selection:bg-violet-500\/30/g, 'selection:bg-zinc-300 dark:selection:bg-zinc-700');
  content = content.replace(/selection:text-violet-200/g, 'selection:text-zinc-900 dark:selection:text-white');
  content = content.replace(/group-hover:bg-violet-500/g, 'group-hover:bg-zinc-900 dark:group-hover:bg-white');
  content = content.replace(/group-hover:text-zinc-900/g, 'group-hover:text-white dark:group-hover:text-zinc-900');
  
  // 6. Shadows
  content = content.replace(/shadow-violet-500\/20/g, 'shadow-zinc-900/10 dark:shadow-white/10');
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    changed++;
    console.log('Updated: ' + file);
  }
});

console.log('Total files updated: ' + changed);
