const fs = require('fs');
const path = require('path');

const OLD_FILE = path.join(__dirname, '../../FE_old/giaodien/client/order-complete.html');
const NEW_FILE = path.join(__dirname, '../src/app/(client)/order-complete/page.tsx');

let html = fs.readFileSync(OLD_FILE, 'utf-8');

// Extract body content
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (!bodyMatch) {
    console.error('No body found');
    process.exit(1);
}

let contentToConvert = bodyMatch[1];

let jsx = contentToConvert.replace(/class=/g, 'className=');
jsx = jsx.replace(/for=/g, 'htmlFor=');
jsx = jsx.replace(/onclick="[^"]*"/g, '');
jsx = jsx.replace(/<input([^>]*?[^\/])>/g, '<input$1 />');
jsx = jsx.replace(/<img([^>]*?[^\/])>/g, '<img$1 />');
jsx = jsx.replace(/<br>/g, '<br />');
jsx = jsx.replace(/<hr([^>]*?[^\/])>/g, '<hr$1 />');
jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');
jsx = jsx.replace(/href="([^"]+)\.html"/g, 'href="/$1"');
jsx = jsx.replace(/href="index"/g, 'href="/"');

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

// There is a <style> block and <script> block inside the body? No, they were in head.
// Let's check if there are <svg> with fill-rule etc.
jsx = jsx.replace(/fill-rule/g, 'fillRule');
jsx = jsx.replace(/clip-rule/g, 'clipRule');
jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
jsx = jsx.replace(/stroke-linejoin/g, 'strokeLinejoin');

const newContent = `import Link from 'next/link';

export default function Page() {
  return (
    <>
${jsx}
    </>
  );
}`;

fs.writeFileSync(NEW_FILE, newContent);
console.log('Fixed order-complete');
