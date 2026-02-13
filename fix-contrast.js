const fs = require('fs');
const path = require('path');

// Directories to process
const dirs = [
    'app/(protected)/app',
    'components'
];

// Replacements to make
const replacements = [
    // Critical text contrast fixes
    { from: /className="([^"]*)\btext-white\b([^"]*)"/g, to: 'className="$1text-foreground$2"' },
    { from: /className='([^']*)\btext-white\b([^']*)'/g, to: "className='$1text-foreground$2'" },
    { from: /hover:text-white/g, to: 'hover:text-foreground' },

    // Remaining dark backgrounds
    { from: /bg-zinc-900 border border-zinc-800/g, to: 'bg-card border border-border' },
    { from: /bg-zinc-900\/50/g, to: 'bg-card/50' },
    { from: /bg-zinc-800\/50/g, to: 'bg-secondary/50' },
    { from: /bg-zinc-800\/30/g, to: 'bg-secondary/30' },
    { from: /hover:bg-zinc-800/g, to: 'hover:bg-secondary' },

    // Border fixes
    { from: /border-zinc-800 bg-card/g, to: 'border-border bg-card' },
    { from: /border border-zinc-800/g, to: 'border border-border' },

    // Active state fixes for tabs
    { from: /data-\[state=active\]:bg-zinc-800 data-\[state=active\]:text-white/g, to: 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground' },
    { from: /data-\[state=active\]:bg-zinc-800/g, to: 'data-[state=active]:bg-primary' },
];

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        replacements.forEach(({ from, to }) => {
            const newContent = content.replace(from, to);
            if (newContent !== content) {
                content = newContent;
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed: ${path.basename(filePath)}`);
            return 1;
        }
        return 0;
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        return 0;
    }
}

function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, callback);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            callback(filePath);
        }
    });
}

let totalFixed = 0;
const baseDir = 'd:/my Programms/lenguage-schooll01/eduflow-2026';

dirs.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    if (fs.existsSync(fullPath)) {
        console.log(`\nProcessing ${dir}...`);
        walkDir(fullPath, (file) => {
            totalFixed += processFile(file);
        });
    }
});

console.log(`\n=========================================`);
console.log(`Light Theme Contrast Fix Complete!`);
console.log(`Total files fixed: ${totalFixed}`);
console.log(`=========================================`);
