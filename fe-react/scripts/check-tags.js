const fs = require('fs');
const html = fs.readFileSync('c:/xampp/htdocs/shop-quan-ao/fe-react/src/app/(admin)/admin/products/page.tsx', 'utf8');

const regex = /<\/?([a-zA-Z0-9]+)[^>]*>/g;
let match;
const stack = [];

// Skip lines 1-5 which are imports and <>
const lines = html.split('\n');
const content = lines.slice(5).join('\n'); // after <>

let lineCount = 5;

while ((match = regex.exec(content)) !== null) {
    const tagFull = match[0];
    const tagName = match[1].toLowerCase();
    
    // Ignore self closing
    if (tagFull.endsWith('/>') || ['img', 'input', 'br', 'hr', 'meta', 'link'].includes(tagName)) {
        continue;
    }
    
    if (tagFull.startsWith('</')) {
        if (stack.length > 0 && stack[stack.length - 1].tag === tagName) {
            stack.pop();
        } else {
            console.log(`Mismatch: found ${tagFull} but expected </${stack[stack.length-1]?.tag}> at match index ${match.index}`);
        }
    } else {
        stack.push({ tag: tagName, match: tagFull, index: match.index });
    }
}

if (stack.length > 0) {
    console.log('Unclosed tags:');
    stack.forEach(s => console.log(s));
} else {
    console.log('All tags balanced!');
}
