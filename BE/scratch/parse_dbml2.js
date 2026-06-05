const fs = require('fs');

let html = fs.readFileSync('c:/xampp/htdocs/lab_nodejs/shop-quan-ao.drawio.html', 'utf-8');

// decode html entities
const xml = html.replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\\"/g, '"')
    .replace(/\\n/g, '\n');

const cellRegex = /<mxCell[^>]+id="([^"]+)"[^>]+parent="([^"]+)"[^>]+value="([^"]*)"/g;
const cells = {};

let match;
while ((match = cellRegex.exec(xml)) !== null) {
    const id = match[1];
    const parent = match[2];
    let value = match[3];
    
    // strip HTML tags correctly even if multiline
    value = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    
    // Check style
    const styleMatch = match[0].match(/style="([^"]+)"/);
    const style = styleMatch ? styleMatch[1] : '';
    
    cells[id] = { id, parent, value: value, style };
}

// Find tables
const tables = Object.values(cells).filter(c => c.style.includes('shape=table;'));

let dbml = '';

tables.forEach(table => {
    let tableName = table.value.replace(/\s+/g, '_');
    if (!tableName) return;
    dbml += `Table ${tableName} {\n`;
    
    // Find rows (children of table)
    const rows = Object.values(cells).filter(c => c.parent === table.id && c.style.includes('shape=tableRow'));
    
    rows.forEach(row => {
        // Find columns (children of row)
        const cols = Object.values(cells).filter(c => c.parent === row.id && c.style.includes('shape=partialRectangle'));
        
        let colName = '';
        let isPk = false;
        
        cols.forEach(col => {
            if (col.value.toLowerCase() === 'pk') isPk = true;
            else if (col.value !== '') colName = col.value.replace(/\s+/g, '_');
        });
        
        if (colName) {
            dbml += `  ${colName} varchar ${isPk ? '[pk]' : ''}\n`;
        }
    });
    
    dbml += `}\n\n`;
});

// Relationships
const edges = Object.values(cells).filter(c => c.style.includes('edgeStyle'));
edges.forEach(edge => {
    const sourceMatch = xml.match(new RegExp(`<mxCell[^>]+id="${edge.id}"[^>]+source="([^"]+)"[^>]+target="([^"]+)"`));
    if (sourceMatch) {
        const sourceRowId = sourceMatch[1];
        const targetRowId = sourceMatch[2];
        
        // Find table and column for source
        const sourceRow = cells[sourceRowId];
        const targetRow = cells[targetRowId];
        
        if (sourceRow && targetRow) {
            const sourceTableId = sourceRow.parent;
            const targetTableId = targetRow.parent;
            
            const sourceTable = cells[sourceTableId];
            const targetTable = cells[targetTableId];
            
            if (sourceTable && targetTable) {
                // To get column name, find children of the row
                const sourceCols = Object.values(cells).filter(c => c.parent === sourceRowId && c.style.includes('shape=partialRectangle'));
                const targetCols = Object.values(cells).filter(c => c.parent === targetRowId && c.style.includes('shape=partialRectangle'));
                
                let sourceColName = sourceCols.find(c => c.value && c.value.toLowerCase() !== 'pk')?.value || 'id';
                let targetColName = targetCols.find(c => c.value && c.value.toLowerCase() !== 'pk')?.value || 'id';
                
                sourceColName = sourceColName.replace(/\s+/g, '_');
                targetColName = targetColName.replace(/\s+/g, '_');
                
                let sourceTableName = sourceTable.value.replace(/\s+/g, '_');
                let targetTableName = targetTable.value.replace(/\s+/g, '_');
                
                if (sourceTableName && targetTableName) {
                    dbml += `Ref: ${sourceTableName}.${sourceColName} > ${targetTableName}.${targetColName}\n`;
                }
            }
        }
    }
});

fs.writeFileSync('c:/xampp/htdocs/lab_nodejs/erd.dblm', dbml);
console.log("Generated clean erd.dblm");
