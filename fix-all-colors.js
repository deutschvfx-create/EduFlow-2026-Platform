const fs = require('fs');
const path = require('path');

// Comprehensive color replacements for light theme
const replacements = [
    // TEXT COLOR REPLACEMENTS (most critical for visibility)
    { from: /text-zinc-100\b/g, to: 'text-foreground' },
    { from: /text-zinc-200\b/g, to: 'text-foreground' },
    { from: /text-zinc-300\b/g, to: 'text-foreground' },
    { from: /text-zinc-400\b/g, to: 'text-muted-foreground' },
    { from: /text-zinc-500\b/g, to: 'text-muted-foreground' },
    { from: /text-zinc-600\b/g, to: 'text-muted-foreground' },
    { from: /text-zinc-700\b/g, to: 'text-muted-foreground' },

    // BACKGROUND REPLACEMENTS
    { from: /bg-zinc-950\b/g, to: 'bg-background' },
    { from: /bg-zinc-900\b/g, to: 'bg-card' },
    { from: /bg-zinc-800\b/g, to: 'bg-secondary' },
    { from: /bg-zinc-700\b/g, to: 'bg-secondary' },
    { from: /bg-zinc-600\b/g, to: 'bg-muted' },
    { from: /bg-zinc-500\b/g, to: 'bg-muted' },
    { from: /bg-zinc-100\b/g, to: 'bg-secondary' },
    { from: /bg-zinc-50\b/g, to: 'bg-secondary' },

    // BORDER REPLACEMENTS
    { from: /border-zinc-950\b/g, to: 'border-border' },
    { from: /border-zinc-900\b/g, to: 'border-border' },
    { from: /border-zinc-800\b/g, to: 'border-border' },
    { from: /border-zinc-700\b/g, to: 'border-border' },
    { from: /border-zinc-600\b/g, to: 'border-border' },
    { from: /border-zinc-500\b/g, to: 'border-border' },
    { from: /border-zinc-200\b/g, to: 'border-border' },

    // HOVER STATE REPLACEMENTS
    { from: /hover:bg-zinc-900\b/g, to: 'hover:bg-secondary' },
    { from: /hover:bg-zinc-800\b/g, to: 'hover:bg-secondary' },
    { from: /hover:bg-zinc-700\b/g, to: 'hover:bg-secondary' },
    { from: /hover:bg-zinc-200\b/g, to: 'hover:bg-secondary' },
    { from: /hover:bg-zinc-100\b/g, to: 'hover:bg-secondary' },
    { from: /hover:bg-zinc-50\b/g, to: 'hover:bg-secondary' },

    { from: /hover:text-zinc-100\b/g, to: 'hover:text-foreground' },
    { from: /hover:text-zinc-200\b/g, to: 'hover:text-foreground' },
    { from: /hover:text-zinc-300\b/g, to: 'hover:text-foreground' },
    { from: /hover:text-zinc-500\b/g, to: 'hover:text-muted-foreground' },

    { from: /hover:border-zinc-700\b/g, to: 'hover:border-border' },
    { from: /hover:border-zinc-600\b/g, to: 'hover:border-border' },
    { from: /hover:border-zinc-500\b/g, to: 'hover:border-border' },

    // PLACEHOLDER REPLACEMENTS
    { from: /placeholder:text-zinc-600\b/g, to: 'placeholder:text-muted-foreground' },
    { from: /placeholder:text-zinc-500\b/g, to: 'placeholder:text-muted-foreground' },

    // OPACITY VARIANTS
    { from: /bg-zinc-950\/80\b/g, to: 'bg-background/80' },
    { from: /bg-zinc-950\/60\b/g, to: 'bg-background/60' },
    { from: /bg-zinc-950\/50\b/g, to: 'bg-background/50' },
    { from: /bg-zinc-950\/30\b/g, to: 'bg-background/30' },
    { from: /bg-zinc-950\/20\b/g, to: 'bg-background/20' },
    { from: /bg-zinc-950\/10\b/g, to: 'bg-background/10' },

    { from: /bg-zinc-900\/80\b/g, to: 'bg-card/80' },
    { from: /bg-zinc-900\/60\b/g, to: 'bg-card/60' },
    { from: /bg-zinc-900\/50\b/g, to: 'bg-card/50' },
    { from: /bg-zinc-900\/30\b/g, to: 'bg-card/30' },
    { from: /bg-zinc-900\/20\b/g, to: 'bg-card/20' },
    { from: /bg-zinc-900\/10\b/g, to: 'bg-card/10' },

    { from: /bg-zinc-800\/50\b/g, to: 'bg-secondary/50' },
    { from: /bg-zinc-800\/30\b/g, to: 'bg-secondary/30' },

    { from: /border-zinc-800\/50\b/g, to: 'border-border/50' },
    { from: /border-zinc-700\/50\b/g, to: 'border-border/50' },

    // GROUP HOVER STATES
    { from: /group-hover:text-zinc-500\b/g, to: 'group-hover:text-muted-foreground' },
    { from: /group-hover:text-zinc-200\b/g, to: 'group-hover:text-foreground' },
];

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let changeCount = 0;

        replacements.forEach(({ from, to }) => {
            const matches = content.match(from);
            if (matches) {
                content = content.replace(from, to);
                modified = true;
                changeCount += matches.length;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Fixed ${path.basename(filePath)} (${changeCount} changes)`);
            return { files: 1, changes: changeCount };
        }
        return { files: 0, changes: 0 };
    } catch (error) {
        console.error(`✗ Error processing ${filePath}:`, error.message);
        return { files: 0, changes: 0 };
    }
}

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) {
        console.log(`⚠ Directory not found: ${dir}`);
        return;
    }

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

const baseDir = 'd:/my Programms/lenguage-schooll01/eduflow-2026';
const dirs = [
    'app',
    'components',
    'lib'
];

let totalFiles = 0;
let totalChanges = 0;

console.log('🎨 Starting comprehensive color audit fix...\n');

dirs.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    console.log(`\n📁 Processing ${dir}/...`);
    walkDir(fullPath, (file) => {
        const result = processFile(file);
        totalFiles += result.files;
        totalChanges += result.changes;
    });
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Complete Project Color Audit Fix Complete!`);
console.log(`📊 Files updated: ${totalFiles}`);
console.log(`🎨 Total color changes: ${totalChanges}`);
console.log(`${'='.repeat(60)}`);
