const fs = require('fs');
const path = require('path');

// Chat theme conversion: Dark WhatsApp → Light Clean
const replacements = [
    // Background colors
    { from: /#0B141A/g, to: 'hsl(var(--background))', description: 'Dark bg → background' },
    { from: /#111B21/g, to: 'hsl(var(--card))', description: 'Dark card → card' },
    { from: /#202C33/g, to: 'hsl(var(--secondary))', description: 'Dark secondary → secondary' },
    { from: /#2A3942/g, to: 'hsl(var(--secondary))', description: 'Dark hover → secondary' },
    { from: /#374248/g, to: 'hsl(var(--accent))', description: 'Dark selected → accent' },
    { from: /#04090C/g, to: 'hsl(var(--background))', description: 'Very dark → background' },
    { from: /#1A2329/g, to: 'hsl(var(--muted))', description: 'Dark muted → muted' },

    // Text colors
    { from: /#8696A0/g, to: 'hsl(var(--muted-foreground))', description: 'Gray text → muted-foreground' },
    { from: /#D1D7DB/g, to: 'hsl(var(--foreground))', description: 'Light text → foreground' },
    { from: /#E9EDEF/g, to: 'hsl(var(--foreground))', description: 'Very light text → foreground' },

    // WhatsApp green - keep for accent but adjust
    { from: /#00A884/g, to: 'hsl(var(--primary))', description: 'WhatsApp green → primary (cyan)' },
    { from: /#00C49A/g, to: 'hsl(var(--primary))', description: 'Light green → primary' },
    { from: /#005C4B/g, to: 'hsl(var(--primary))', description: 'Dark green → primary' },
    { from: /#53BDEB/g, to: 'hsl(var(--primary))', description: 'Blue accent → primary' },
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

console.log('💬 Converting Chat from Dark WhatsApp theme to Light Clean theme...\n');

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
console.log(`✅ Chat Light Theme Conversion Complete!`);
console.log(`📊 Files updated: ${totalFiles}`);
console.log(`💬 Color changes: ${totalChanges}`);
console.log(`${'='.repeat(60)}`);
console.log(`\n🎨 Chat is now light and clean!`);
