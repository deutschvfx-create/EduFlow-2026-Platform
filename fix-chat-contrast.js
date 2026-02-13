const fs = require('fs');
const path = require('path');

// Fix Chat light theme contrast issues
const replacements = [
    // White borders → semantic borders (visible on light bg)
    { from: /border-white\/5/g, to: 'border-border', description: 'Invisible white border → border' },
    { from: /border-white\/10/g, to: 'border-border', description: 'Invisible white border → border' },

    // Dark backgrounds → light backgrounds
    { from: /bg-black\/40/g, to: 'bg-secondary', description: 'Dark toggle bg → secondary' },
    { from: /bg-black\/20/g, to: 'bg-secondary/50', description: 'Dark bg → secondary' },
    { from: /bg-white\/5/g, to: 'bg-secondary/50', description: 'Invisible white bg → secondary' },

    // Shadow fixes for light theme
    { from: /shadow-\[0_30px_60px_rgba\(0,0,0,0\.6\)\]/g, to: 'shadow-xl', description: 'Dark shadow → xl' },
    { from: /shadow-\[0_0_20px_rgba\(0,168,132,0\.3\)\]/g, to: 'shadow-lg shadow-primary/20', description: 'Green shadow → primary' },
    { from: /shadow-\[0_0_25px_rgba\(0,168,132,0\.4\)\]/g, to: 'shadow-lg shadow-primary/30', description: 'Green shadow → primary' },
    { from: /shadow-\[0_0_10px_rgba\(83,189,235,0\.5\)\]/g, to: 'shadow-md shadow-primary/20', description: 'Blue shadow → primary' },
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
        } else if (file.endsWith('.tsx')) {
            callback(filePath);
        }
    });
}

const baseDir = 'd:/my Programms/lenguage-schooll01/eduflow-2026';
const dirs = [
    'app/(protected)/app/chat',
    'components/chat'
];

let totalFiles = 0;
let totalChanges = 0;

console.log('🎨 Fixing Chat light theme contrast issues...\n');

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
console.log(`✅ Chat Contrast Fix Complete!`);
console.log(`📊 Files updated: ${totalFiles}`);
console.log(`🎨 Contrast changes: ${totalChanges}`);
console.log(`${'='.repeat(60)}`);
console.log(`\n✨ Chat now has proper contrast for light theme!`);
