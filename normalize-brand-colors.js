const fs = require('fs');
const path = require('path');

const rootDir = 'd:/my Programms/lenguage-schooll01/eduflow-2026';

const replacements = [
    // Cyan to Primary
    { regex: /text-cyan-[3456]00/g, replacement: 'text-primary' },
    { regex: /bg-cyan-[3456]00/g, replacement: 'bg-primary' },
    { regex: /border-cyan-[3456]00/g, replacement: 'border-primary' },
    { regex: /hover:bg-cyan-[3456]00/g, replacement: 'hover:bg-primary/90' },
    { regex: /hover:text-cyan-[3456]00/g, replacement: 'hover:text-primary/90' },
    { regex: /bg-cyan-500\/([0-9]+)/g, replacement: 'bg-primary/$1' },
    { regex: /text-cyan-500\/([0-9]+)/g, replacement: 'text-primary/$1' },
    { regex: /border-cyan-500\/([0-9]+)/g, replacement: 'border-primary/$1' },

    // Hex to Semantic
    { regex: /text-\[#CBD5E1\]/g, replacement: 'text-muted-foreground' },
    { regex: /placeholder:text-\[#CBD5E1\]/g, replacement: 'placeholder:text-muted-foreground' },
    { regex: /text-\[#6B7280\]/g, replacement: 'text-muted-foreground' },
    { regex: /bg-\[#F6F7F9\]/g, replacement: 'bg-muted' },
    { regex: /border-\[#E6E8EC\]/g, replacement: 'border-border' },
    { regex: /text-\[#1C1E21\]/g, replacement: 'text-foreground' },
    { regex: /text-\[#AEBAC1\]/g, replacement: 'text-muted-foreground' },
    { regex: /bg-\[#AEBAC1\]/g, replacement: 'bg-muted' },

    // Specific buttons mentioned in grep
    { regex: /bg-cyan-600/g, replacement: 'bg-primary' },
    { regex: /hover:bg-cyan-700/g, replacement: 'hover:bg-primary/90' },

    // Custom hex shades of cyan from the previous theme
    { regex: /#2EC4C6/gi, replacement: 'oklch(var(--primary))' },
    { regex: /#0F3D4C/gi, replacement: 'oklch(var(--foreground))' },
    { regex: /#FAFAF2/gi, replacement: 'oklch(var(--background))' },
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    replacements.forEach(rep => {
        content = content.replace(rep.regex, rep.replacement);
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
                walkDir(fullPath);
            }
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(fullPath);
        }
    });
}

walkDir(rootDir);
console.log('Color normalization complete.');
