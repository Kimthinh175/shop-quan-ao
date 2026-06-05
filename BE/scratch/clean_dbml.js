const fs = require('fs');

let dbml = fs.readFileSync('c:/xampp/htdocs/lab_nodejs/erd.dblm', 'utf-8');

// The file has lines like: Table &lt;code_data-path-to-node=&quot;14&quot;_data-index-in-node=&quot;8&quot;&gt;&lt;font_face=&quot;Helvetica&quot;&gt;promotions&lt;/font&gt;&lt;/code&gt; {
// and:   &lt;u&gt;id&lt;/u&gt; varchar [pk]

// Let's decode html entities again just in case
dbml = dbml.replace(/&lt;/g, '<')
           .replace(/&gt;/g, '>')
           .replace(/&quot;/g, '"')
           .replace(/&amp;/g, '&');

// Now strip all <tag> elements
dbml = dbml.replace(/<[^>]*>/g, '');

// Clean up table names and column names from lingering attributes or spaces
// e.g. Table  promotions  { -> Table promotions {
dbml = dbml.replace(/Table\s+([A-Za-z0-9_]+)\s*\{/g, 'Table $1 {');
dbml = dbml.replace(/^\s+([A-Za-z0-9_]+)\s+varchar/gm, '  $1 varchar');

fs.writeFileSync('c:/xampp/htdocs/lab_nodejs/erd.dblm', dbml);
console.log("Cleaned DBML");
