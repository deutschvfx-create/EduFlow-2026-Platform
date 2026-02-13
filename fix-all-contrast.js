const fs = require('fs');
const path = require('path');

// Comprehensive contrast fixes
const replacements = [
    // White borders → semantic borders
    { from: /border-white\/5\b/g, to: 'border-border', description: 'Invisible white border → border' },
    { from: /border-white\/10\b/g, to: 'border-border', description: 'Very light white border → border' },

    // Color borders with very low opacity → higher opacity
    { from: /border-(\w+)-(\d+)\/5\b/g, to: 'border-$1-$2/30', description: 'Invisible color borders → 30% opacity' },

    // Background colors with very low opacity → higher opacity  
    { from: /bg-(\w+)-(\d+)\/5\b/g, to: 'bg-$1-$2/20', description: 'Nearly invisible backgrounds → 20% opacity' },

    // Very low opacity → minimum 40%
    { from: /\bopacity-10\b/g, to: 'opacity-40', description: 'opacity-10 → opacity-40' },
    { from: /\bopacity-20\b/g, to: 'opacity-50', description: 'opacity-20 → opacity-50' },
    { from: /\bopacity-30\b/g, to: 'opacity-60', description: 'opacity-30 → opacity-60' },
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
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ ${path.basename(filePath)} (${changeCount} changes)`);
            return { files: 1, changes: changeCount };
        }
        return { files: 0, changes: 0 };
    } catch (error) {
        console.error(`✗ Error: ${path.basename(filePath)}`);
        return { files: 0, changes: 0 };
    }
}

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
            walkDir(filePath, callback);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            callback(filePath);
        }
    });
}

const baseDir = 'd:/my Programms/lenguage-schooll01/eduflow-2026';
let totalFiles = 0;
let totalChanges = 0;

console.log('🎨 Global Contrast Enhancement...\n');

['app', 'components'].forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    console.log(`\n📁 Processing ${dir}/...`);
    walkDir(fullPath, (file) => {
        const result = processFile(file);
        totalFiles += result.files;
        totalChanges += result.changes;
    });
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✅ Global Contrast Enhancement Complete!`);
console.log(`📊 Files updated: ${totalFiles}`);
console.log(`🎨 Total changes: ${totalChanges}`);
console.log(`${'='.repeat(60)}`);
console.log(`\n✨ All elements now have better visibility!`);
