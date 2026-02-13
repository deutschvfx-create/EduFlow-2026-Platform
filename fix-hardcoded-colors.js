const fs = require('fs');
const path = require('path');

// Hardcoded color fixes - replace with semantic variables where appropriate
const replacements = [
    // Attendance page - specific hardcoded colors that should be semantic
    { from: /#F6F7F9/g, to: 'hsl(var(--secondary))', description: 'Light gray bg → secondary' },
    { from: /#E6E8EC/g, to: 'hsl(var(--border))', description: 'Border gray → border' },
    { from: /#6B7280/g, to: 'hsl(var(--muted-foreground))', description: 'Muted text → muted-foreground' },
    { from: /#1C1E21/g, to: 'hsl(var(--foreground))', description: 'Dark text → foreground' },

    // Chat page - WhatsApp-like colors (keep these as they're intentional design)
    // #0B141A, #111B21, #00A884, #8696A0 - these are WhatsApp theme colors, keep them

    // SVG colors in mascot.tsx - keep these as they're part of the illustration
    // #ffffff, #e0f2fe, #1e293b, #451a03, etc. - keep for mascot design

    // Data visualizer SVG - keep cyan colors for charts
    // #22d3ee, #0891b2 - keep for data visualization

    // Journal colors - status colors (keep these as they're semantic status indicators)
    // #22C55E (green), #EF4444 (red), #F59E0B (amber), #CBD5E1 (gray) - keep
];

// Files to EXCLUDE from color replacement (intentional design colors)
const excludeFiles = [
    'mascot.tsx',  // SVG illustration
    'chat',  // WhatsApp-like theme
    'data-flow-visualizer.tsx',  // Chart colors
    'student-journal-card.tsx',  // Status colors
];

function shouldProcessFile(filePath) {
    return !excludeFiles.some(exclude => filePath.includes(exclude));
}

function processFile(filePath) {
    if (!shouldProcessFile(filePath)) {
        return { files: 0, changes: 0 };
    }

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
const dirs = ['app/(protected)/app/attendance', 'components/journal'];

let totalFiles = 0;
let totalChanges = 0;

console.log('🎨 Starting hardcoded color semantic replacement...\n');

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
console.log(`✅ Hardcoded Color Fix Complete!`);
console.log(`📊 Files updated: ${totalFiles}`);
console.log(`🎨 Color changes: ${totalChanges}`);
console.log(`${'='.repeat(60)}`);
console.log(`\n📝 Note: Intentional design colors preserved:`);
console.log(`  - Chat page (WhatsApp theme)`);
console.log(`  - Mascot SVG (illustration)`);
console.log(`  - Data visualizer (chart colors)`);
console.log(`  - Status indicators (green/red/amber)`);
