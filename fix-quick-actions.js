const fs = require('fs');
const path = require('path');

// Fix Quick Actions icon contrast
const replacements = [
    // Icon colors in Quick Actions
    {
        from: /group-hover:text-indigo-400 text-muted-foreground transition-colors/g,
        to: 'group-hover:text-indigo-500 text-foreground/60 transition-colors',
        description: 'Quick action icon color'
    },
    {
        from: /group-hover:text-cyan-400 text-muted-foreground transition-colors/g,
        to: 'group-hover:text-cyan-500 text-foreground/60 transition-colors',
        description: 'Quick action icon color'
    },
    {
        from: /group-hover:text-emerald-400 text-muted-foreground transition-colors/g,
        to: 'group-hover:text-emerald-500 text-foreground/60 transition-colors',
        description: 'Quick action icon color'
    },
    {
        from: /group-hover:text-purple-400 text-muted-foreground transition-colors/g,
        to: 'group-hover:text-purple-500 text-foreground/60 transition-colors',
        description: 'Quick action icon color'
    },
    {
        from: /group-hover:text-rose-400 text-muted-foreground transition-colors/g,
        to: 'group-hover:text-rose-500 text-foreground/60 transition-colors',
        description: 'Quick action icon color'
    },
];

function processFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        let changeCount = 0;

        replacements.forEach(({ from, to, description }) => {
            const matches = content.match(from);
            if (matches) {
                content = content.replace(from, to);
                modified = true;
                changeCount += matches.length;
                console.log(`  ${description}: ${matches.length} changes`);
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
        return;
    }

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            walkDir(filePath, callback);
        } else if (file.startsWith('create-') && file.endsWith('.tsx')) {
            callback(filePath);
        }
    });
}

const baseDir = 'd:/my Programms/lenguage-schooll01/eduflow-2026/components/dashboard';

let totalFiles = 0;
let totalChanges = 0;

console.log('🎨 Fixing Quick Actions icon contrast...\n');

walkDir(baseDir, (file) => {
    const result = processFile(file);
    totalFiles += result.files;
    totalChanges += result.changes;
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Quick Actions Icon Fix Complete!`);
console.log(`📊 Files updated: ${totalFiles}`);
console.log(`🎨 Icon changes: ${totalChanges}`);
console.log(`${'='.repeat(60)}`);
console.log(`\n✨ Quick Actions icons now visible!`);
