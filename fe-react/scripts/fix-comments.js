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
            
            // Replace HTML comments <!-- ... --> with JSX comments {/* ... */}
            const regex = /<!--([\s\S]*?)-->/g;
            if (regex.test(content)) {
                content = content.replace(regex, '{/*$1*/}');
                modified = true;
            }
            
            // Also fix inline style issues if any (e.g., style="background-image: url(...)")
            // Wait, my previous script converted style="" to style={{}} but might have left some syntax errors if there were unhandled cases.
            
            if (modified) {
                fs.writeFileSync(fullPath, content);
                console.log(`Fixed comments in ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, '../src/app'));
