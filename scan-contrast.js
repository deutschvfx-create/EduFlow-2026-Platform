const fs = require('fs');
const path = require('path');

// Find all low-contrast elements that might be hard to see
const lowContrastPatterns = [
    // Very light text colors
    { pattern: /text-muted-foreground\/[1-5]0/g, description: 'Very light muted text (10-50% opacity)' },
    { pattern: /text-foreground\/[1-3]0/g, description: 'Very light foreground text (10-30% opacity)' },
    { pattern: /text-gray-[234]00/g, description: 'Very light gray text' },

    // Very light backgrounds
    { pattern: /bg-\w+-\d+\/[05]/g, description: 'Nearly transparent backgrounds (0-5% opacity)' },
    { pattern: /bg-white\/[05]/g, description: 'Nearly transparent white backgrounds' },

    // Very light borders
    { pattern: /border-\w+-\d+\/[05]/g, description: 'Nearly invisible borders (0-5% opacity)' },
    { pattern: /border-white\/[05]/g, description: 'Nearly invisible white borders' },

    // Disabled/inactive states that might be too light
    { pattern: /disabled:text-muted-foreground/g, description: 'Disabled text (might be too light)' },
    { pattern: /opacity-[1-3]0/g, description: 'Very low opacity elements (10-30%)' },
];

function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];

        lowContrastPatterns.forEach(({ pattern, description }) => {
            const matches = content.match(pattern);
            if (matches) {
                issues.push({
                    description,
                    count: matches.length,
                    examples: [...new Set(matches)].slice(0, 3)
                });
            }
        });

        return issues.length > 0 ? { file: filePath, issues } : null;
    } catch (error) {
        return null;
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
const results = [];

console.log('🔍 Scanning for low-contrast elements...\n');

['app', 'components'].forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    walkDir(fullPath, (file) => {
        const result = analyzeFile(file);
        if (result) results.push(result);
    });
});

console.log(`Found ${results.length} files with potential contrast issues:\n`);

results.slice(0, 20).forEach(({ file, issues }) => {
    console.log(`📄 ${path.relative(baseDir, file)}`);
    issues.forEach(({ description, count, examples }) => {
        console.log(`  ⚠️  ${description}: ${count} instances`);
        console.log(`     Examples: ${examples.join(', ')}`);
    });
    console.log('');
});

if (results.length > 20) {
    console.log(`... and ${results.length - 20} more files\n`);
}

console.log(`\n${'='.repeat(60)}`);
console.log(`Total files with issues: ${results.length}`);
console.log(`${'='.repeat(60)}`);
