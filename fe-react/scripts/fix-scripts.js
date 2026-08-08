const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            // Remove <script> tags
            const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
            if (scriptRegex.test(content)) {
                content = content.replace(scriptRegex, '');
                modified = true;
            }
            
            // Fix nested quotes in styles
            if (content.includes("fontFamily: ''Playfair Display'")) {
                content = content.replace(/fontFamily:\s*''Playfair Display',Georgia,serif'/g, "fontFamily: \"'Playfair Display', Georgia, serif\"");
                content = content.replace(/fontFamily:\s*''Plus Jakarta Sans',sans-serif'/g, "fontFamily: \"'Plus Jakarta Sans', sans-serif\"");
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Fixed scripts/styles in ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, '../src/app'));
