const fs = require('fs');
const path = require('path');

// Scan chat components for low-contrast issues
const lowContrastPatterns = [
    { pattern: /text-muted-foreground\/[1-7]0/g, description: 'Light muted text' },
    { pattern: /text-foreground\/[1-3]0/g, description: 'Very light foreground' },
    { pattern: /bg-\w+-\d+\/[05]/g, description: 'Nearly transparent bg' },
    { pattern: /border-\w+-\d+\/[05]/g, description: 'Nearly invisible border' },
    { pattern: /opacity-[1-3]0/g, description: 'Low opacity' },
    { pattern: /text-gray-[234]00/g, description: 'Very light gray text' },
    { pattern: /bg-white\/[05]/g, description: 'Nearly transparent white' },
    { pattern: /border-white\/[05]/g, description: 'Invisible white border' },
];

function analyzeFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const issues = [];
        const lines = content.split('\n');

        lowContrastPatterns.forEach(({ pattern, description }) => {
            lines.forEach((line, index) => {
                const matches = line.match(pattern);
                if (matches) {
                    issues.push({
                        line: index + 1,
                        description,
                        code: line.trim().substring(0, 80),
                        matches: [...new Set(matches)]
                    });
                }
            });
        });

        return issues.length > 0 ? { file: filePath, issues } : null;
    } catch (error) {
        return null;
    }
}

const chatDir = 'd:/my Programms/lenguage-schooll01/eduflow-2026/components/chat';
const results = [];

console.log('🔍 Scanning Chat components for visibility issues...\n');

if (fs.existsSync(chatDir)) {
    const files = fs.readdirSync(chatDir);
    files.forEach(file => {
        if (file.endsWith('.tsx')) {
            const filePath = path.join(chatDir, file);
            const result = analyzeFile(filePath);
            if (result) results.push(result);
        }
    });
}

console.log(`Found ${results.length} chat components with contrast issues:\n`);

results.forEach(({ file, issues }) => {
    console.log(`📄 ${path.basename(file)}`);
    issues.forEach(({ line, description, code, matches }) => {
        console.log(`  Line ${line}: ${description}`);
        console.log(`    ${matches.join(', ')}`);
        console.log(`    ${code}...`);
    });
    console.log('');
});

console.log(`${'='.repeat(60)}`);
console.log(`Total files: ${results.length}`);
console.log(`Total issues: ${results.reduce((sum, r) => sum + r.issues.length, 0)}`);
console.log(`${'='.repeat(60)}`);
