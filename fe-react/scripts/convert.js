const fs = require('fs');
const path = require('path');

const OLD_DIR = path.join(__dirname, '../../FE_old/giaodien/client');
const NEW_DIR = path.join(__dirname, '../src/app/(client)');

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
    
    // Change href="*.html" to href="*"
    jsx = jsx.replace(/href="([^"]+)\.html"/g, 'href="/$1"');
    jsx = jsx.replace(/href="index"/g, 'href="/"');
    jsx = jsx.replace(/href="index.html"/g, 'href="/"');
    
    // Convert style="x: y;" to style={{x: 'y'}}
    jsx = jsx.replace(/style="([^"]+)"/g, (match, p1) => {
        const styles = p1.split(';').filter(s => s.trim()).map(s => {
            let [key, value] = s.split(':');
            key = key.trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            value = value.trim();
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
    { oldFile: 'index.html', newPath: 'page.tsx', extract: true },
    { oldFile: 'shop.html', newPath: 'shop/page.tsx', extract: true },
    { oldFile: 'product-detail.html', newPath: 'product/page.tsx', extract: true },
    { oldFile: 'cart.html', newPath: 'cart/page.tsx', extract: true },
    { oldFile: 'checkout.html', newPath: 'checkout/page.tsx', extract: true },
    { oldFile: 'order-complete.html', newPath: 'order-complete/page.tsx', extract: true },
    { oldFile: 'blog.html', newPath: 'blog/page.tsx', extract: true },
    { oldFile: 'lookbook.html', newPath: 'lookbook/page.tsx', extract: true },
    { oldFile: 'brand.html', newPath: 'brand/page.tsx', extract: true },
    { oldFile: 'post-detail.html', newPath: 'post-detail/page.tsx', extract: true }
];

filesToConvert.forEach(item => {
    const filePath = path.join(OLD_DIR, item.oldFile);
    if (!fs.existsSync(filePath)) return;
    const html = fs.readFileSync(filePath, 'utf-8');
    
    let contentToConvert = html;
    
    if (item.extract) {
        let startIdx = html.indexOf('</nav>');
        if (startIdx !== -1) startIdx += 6;
        else startIdx = html.indexOf('<body>') + 6;

        let endIdx = html.indexOf('<!-- Footer -->');
        if (endIdx === -1) endIdx = html.indexOf('<footer');
        if (endIdx === -1) endIdx = html.indexOf('</body>');
        
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            contentToConvert = html.substring(startIdx, endIdx);
        }
    }
    
    const jsx = convertHtmlToJsx(contentToConvert);
    const destPath = path.join(NEW_DIR, item.newPath);
    
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, jsx);
    console.log(`Converted ${item.oldFile} -> ${item.newPath}`);
});
