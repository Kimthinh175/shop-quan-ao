const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const clientDir = path.join(__dirname, 'src', 'app', '(client)');
const componentsDir = path.join(__dirname, 'src', 'components', 'client');

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace product-detail with product
    content = content.replace(/href="\/product-detail"/g, 'href="/product"');
    content = content.replace(/href='\/product-detail'/g, "href='/product'");
    
    // Replace <a href= with <Link href=
    // First, check if file has Link imported
    let needsLinkImport = false;
    
    // Convert <a> tags to <Link> tags for internal routes (starting with /)
    const aTagRegex = /<a\s+([^>]*?)href=(["'])\/([^"']*)\2([^>]*?)>/g;
    
    if (aTagRegex.test(content)) {
        content = content.replace(aTagRegex, (match, p1, quote, pathPart, p4) => {
            needsLinkImport = true;
            return `<Link ${p1}href=${quote}/${pathPart}${quote}${p4}>`;
        });
        // Replace closing tags
        content = content.replace(/<\/a>/g, '</Link>');
    }

    if (needsLinkImport && !content.includes('import Link from')) {
        // Add import at top
        const firstLineBreak = content.indexOf('\n');
        if (content.includes('"use client"') || content.includes("'use client'")) {
            content = content.replace(/use client['"];?\n/, "$&\nimport Link from 'next/link';\n");
        } else {
            content = `import Link from 'next/link';\n` + content;
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed links in:', filePath);
    }
}

walkDir(clientDir, processFile);
walkDir(componentsDir, processFile);

console.log("Link fixing complete.");
