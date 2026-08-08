const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src/components/client');
const typesDir = path.join(__dirname, '../src/types');
const typesFile = path.join(typesDir, 'components.ts');

if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
}

let allInterfaces = '';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Match `interface Name { ... }` block where ... does not contain another `interface` keyword
    // A robust way without AST for this specific codebase:
    const interfaceRegex = /interface\s+([A-Za-z0-9_]+)\s*\{([\s\S]*?)\}/g;
    
    let hasInterface = false;
    const matchedInterfaces = [];
    
    let newContent = content.replace(interfaceRegex, (match, name, body) => {
        hasInterface = true;
        matchedInterfaces.push(name);
        allInterfaces += `export interface ${name} {${body}}\n\n`;
        return '';
    });
    
    if (hasInterface) {
        // Add import statement at the top
        const importStmt = `import { ${matchedInterfaces.join(', ')} } from "../../../types/components";\n`;
        
        let lines = newContent.split('\n');
        // insert after the last import line, or at top if no import
        let insertIdx = 0;
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].trim().startsWith('import ')) {
                insertIdx = i + 1;
                break;
            }
        }
        
        lines.splice(insertIdx, 0, importStmt);
        newContent = lines.join('\n');
        
        fs.writeFileSync(filePath, newContent);
        console.log(`Processed ${filePath}`);
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.tsx')) {
            processFile(p);
        }
    });
}

walk(srcDir);
fs.writeFileSync(typesFile, allInterfaces);
console.log('All interfaces extracted to', typesFile);
