const fs = require('fs');

const xml = fs.readFileSync('c:/xampp/htdocs/lab_nodejs/scratch/drawio.xml', 'utf-8');

const cellRegex = /<mxCell[^>]+id="([^"]+)"[^>]+parent="([^"]+)"[^>]+value="([^"]*)"/g;
const cells = {};

let match;
while ((match = cellRegex.exec(xml)) !== null) {
    const id = match[1];
    const parent = match[2];
    const value = match[3];
    
    // Check style
    const styleMatch = match[0].match(/style="([^"]+)"/);
    const style = styleMatch ? styleMatch[1] : '';
    
    cells[id] = { id, parent, value: value.trim(), style };
}

// Find tables
const tables = Object.values(cells).filter(c => c.style.includes('shape=table;'));

let dbml = '';

tables.forEach(table => {
    dbml += `Table ${table.value} {\n`;
    
    // Find rows (children of table)
    const rows = Object.values(cells).filter(c => c.parent === table.id && c.style.includes('shape=tableRow'));
    
    rows.forEach(row => {
        // Find columns (children of row)
        const cols = Object.values(cells).filter(c => c.parent === row.id && c.style.includes('shape=partialRectangle'));
        
        let colName = '';
        let isPk = false;
        
        cols.forEach(col => {
            if (col.value === 'PK') isPk = true;
            else if (col.value !== '') colName = col.value;
        });
        
        if (colName) {
            dbml += `  ${colName} varchar ${isPk ? '[pk]' : ''}\n`;
        }
    });
    
    dbml += `}\n\n`;
});

// Relationships
// edgeStyle=orthogonalEdgeStyle;...startArrow=ERzeroToOne;...endArrow=ERmandOne
// We can extract edges.
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
                
                let sourceColName = sourceCols.find(c => c.value && c.value !== 'PK')?.value || 'id';
                let targetColName = targetCols.find(c => c.value && c.value !== 'PK')?.value || 'id';
                
                dbml += `Ref: ${sourceTable.value}.${sourceColName} > ${targetTable.value}.${targetColName}\n`;
            }
        }
    }
});

fs.writeFileSync('c:/xampp/htdocs/lab_nodejs/erd.dbml', dbml);
console.log("Generated erd.dbml");
