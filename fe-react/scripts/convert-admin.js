const fs = require('fs');
const path = require('path');

const OLD_DIR = path.join(__dirname, '../../FE_old/giaodien/admin');
const NEW_DIR = path.join(__dirname, '../src/app/(admin)/admin');

function convertHtmlToJsx(html) {
    let jsx = html.replace(/class=/g, 'className=');
    jsx = jsx.replace(/for=/g, 'htmlFor=');
    jsx = jsx.replace(/onclick="[^"]*"/g, '');
    jsx = jsx.replace(/oninput="[^"]*"/g, '');
    jsx = jsx.replace(/onchange="[^"]*"/g, '');
    
    // Close input tags
    jsx = jsx.replace(/<input([^>]*?[^\/])>/g, '<input$1 />');
    // Close img tags
    jsx = jsx.replace(/<img([^>]*?[^\/])>/g, '<img$1 />');
    // Close br tags
    jsx = jsx.replace(/<br>/g, '<br />');
    // Close hr tags
    jsx = jsx.replace(/<hr([^>]*?[^\/])>/g, '<hr$1 />');
    // Fix SVG unclosed or syntax
    jsx = jsx.replace(/fill-rule/g, 'fillRule');
    jsx = jsx.replace(/clip-rule/g, 'clipRule');
    jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
    jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
    jsx = jsx.replace(/stroke-linejoin/g, 'strokeLinejoin');
    // Comments
    jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');
    
    // Change href="*.html" to href="/admin/*"
    jsx = jsx.replace(/href="([^"]+)\.html"/g, (match, p1) => {
        if (p1 === 'dashboard' || p1 === 'index') return 'href="/admin"';
        return `href="/admin/${p1}"`;
    });
    
    // Convert style="x: y;" to style={{x: 'y'}}
    jsx = jsx.replace(/style="([^"]+)"/g, (match, p1) => {
        const styles = p1.split(';').filter(s => s.trim()).map(s => {
            let [key, value] = s.split(':');
            key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            value = value.trim();
            // Handle url(...) properly by using double quotes inside
            if (value.startsWith("url('") || value.startsWith('url("')) {
                return `${key}: "${value}"`;
            }
            return `${key}: '${value}'`;
        }).join(', ');
        return `style={{ ${styles} }}`;
    });

    return `import Link from 'next/link';

export default function Page() {
  return (
    <>
${jsx}
    </>
  );
}`;
}

const filesToConvert = [
    { oldFile: 'dashboard.html', newPath: 'page.tsx', extractToken: '<div class="flex-1 overflow-y-auto' },
    { oldFile: 'products.html', newPath: 'products/page.tsx', extractToken: '<div class="flex-1 overflow-y-auto' },
    { oldFile: 'orders.html', newPath: 'orders/page.tsx', extractToken: '<div class="flex-1 overflow-y-auto' },
    { oldFile: 'add-product.html', newPath: 'add-product/page.tsx', extractToken: '<div class="flex-1 overflow-y-auto' },
    { oldFile: 'categories.html', newPath: 'categories/page.tsx', extractToken: '<div class="flex-1 overflow-y-auto' },
    { oldFile: 'customers.html', newPath: 'customers/page.tsx', extractToken: '<div class="flex-1 overflow-y-auto' },
    { oldFile: 'inventory.html', newPath: 'inventory/page.tsx', extractToken: '<div class="flex-1 overflow-y-auto' },
    { oldFile: 'invoice.html', newPath: 'invoice/page.tsx', extractToken: '<main' },
    { oldFile: 'pos.html', newPath: 'pos/page.tsx', extractToken: '<main' },
    { oldFile: 'settings.html', newPath: 'settings/page.tsx', extractToken: '<div class="flex-1 overflow-y-auto' }
];

filesToConvert.forEach(item => {
    const filePath = path.join(OLD_DIR, item.oldFile);
    if (!fs.existsSync(filePath)) return;
    const html = fs.readFileSync(filePath, 'utf-8');
    
    let contentToConvert = html;
    const startIdx = html.indexOf(item.extractToken);
    
    if (startIdx !== -1) {
        const afterStart = html.substring(startIdx);
        // Find matching end. We assume the main container ends before </main> or </body>
        const mainEndIdx = afterStart.indexOf('</main>');
        if (mainEndIdx !== -1) {
            contentToConvert = afterStart.substring(0, mainEndIdx);
        } else {
            const bodyEndIdx = afterStart.indexOf('</body>');
            if (bodyEndIdx !== -1) contentToConvert = afterStart.substring(0, bodyEndIdx);
        }
        
        // Remove closing </div> if it was wrapped inside <main> and we missed it?
        // Actually, it's safer to just extract from token up to </main> and then remove the last </div> if necessary,
        // but Next.js fragments <>...</> will wrap it. 
        // Wait, if we extract `<div class="..."> ... </div> </div>` (unbalanced), React will fail to parse.
        // Let's just do:
        contentToConvert = afterStart.substring(0, mainEndIdx !== -1 ? mainEndIdx : afterStart.indexOf('</body>'));
        // If it starts with `<main`, we strip `<main...>` and `</main>`.
        if (item.extractToken === '<main') {
            const innerStart = contentToConvert.indexOf('>') + 1;
            contentToConvert = contentToConvert.substring(innerStart);
        }
    }
    
    const jsx = convertHtmlToJsx(contentToConvert);
    const destPath = path.join(NEW_DIR, item.newPath);
    
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, jsx);
    console.log(`Converted ${item.oldFile} -> ${item.newPath}`);
});
