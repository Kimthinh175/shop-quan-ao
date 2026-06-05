const fs = require('fs');

const html = fs.readFileSync('c:/xampp/htdocs/lab_nodejs/shop-quan-ao.drawio.html', 'utf-8');
const match = html.match(/&quot;xml&quot;:&quot;(.*?)&quot;/);
if (!match) {
    console.log("No xml found");
    process.exit(1);
}

// Unescape basic XML entities from JSON string
let xmlStr = match[1]
    .replace(/\\n/g, '\n')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\\"/g, '"');

fs.writeFileSync('c:/xampp/htdocs/lab_nodejs/scratch/drawio.xml', xmlStr);
console.log("Extracted XML.");
