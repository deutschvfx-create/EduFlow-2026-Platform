const fs = require('fs');
const path = require('path');

// Typography fixes: increase too-small fonts for readability
const replacements = [
    // Critical fixes: 7-8px is unreadable, increase to 10px minimum
    { from: /text-\[7px\]/g, to: 'text-[10px]', description: '7px → 10px (critical)' },
    { from: /text-\[8px\]/g, to: 'text-[10px]', description: '8px → 10px (critical)' },

    // Contextual fixes: upgrade important 9px text to 10px or xs (12px)
    // We'll do this selectively based on context
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
const dirs = ['components'];

let totalFiles = 0;
let totalChanges = 0;

console.log('📝 Starting typography readability fixes...\n');

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
console.log(`✅ Typography Readability Fix Complete!`);
console.log(`📊 Files updated: ${totalFiles}`);
console.log(`📝 Font size changes: ${totalChanges}`);
console.log(`${'='.repeat(60)}`);
