const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../src');
const componentsDir = path.join(srcDir, 'components');
const typesDir = path.join(srcDir, 'types');

function extractInterfaces(fileContent) {
    const interfaces = {};
    const regex = /export\s+(interface|type)\s+([A-Za-z0-9_]+)[\s\S]*?\n\}/g;
    let match;
    while ((match = regex.exec(fileContent)) !== null) {
        interfaces[match[2]] = match[0];
    }
    return interfaces;
}

// 1. Read types/components.ts
const componentsTypesPath = path.join(typesDir, 'components.ts');
if (fs.existsSync(componentsTypesPath)) {
    const componentsContent = fs.readFileSync(componentsTypesPath, 'utf8');
    const compInterfaces = extractInterfaces(componentsContent);

    const mapping = {
        'Accordion': ['AccordionProps'],
        'BlogCard': ['BlogCardProps'],
        'Breadcrumb': ['BreadcrumbItem', 'BreadcrumbProps'],
        'CartItem': ['CartItemProps'],
        'ColorSwatches': ['ColorOption', 'ColorSwatchesProps'],
        'OrderSummary': ['OrderSummaryProps'],
        'Pagination': ['PaginationProps'],
        'ProductGallery': ['ProductGalleryProps'],
        'ProductSort': ['SortOption', 'ProductSortProps'],
        'ProductVariantSelector': ['ProductVariantSelectorProps'],
        'QuantityInput': ['QuantityInputProps'],
        'SidebarFilter': ['FilterSectionProps'],
        'SizeGuideModal': ['SizeRow', 'SizeGuideModalProps'],
        'SizeSelection': ['SizeSelectionProps'],
        'TrustPolicies': ['TrustPoliciesProps']
    };

    for (const [comp, typeNames] of Object.entries(mapping)) {
        const compPath = path.join(componentsDir, 'client', comp, 'index.tsx');
        if (fs.existsSync(compPath)) {
            let content = fs.readFileSync(compPath, 'utf8');
            // Remove the import from types/components
            content = content.replace(/import\s+\{.*\}\s+from\s+['"]\.\.\/\.\.\/\.\.\/types\/components['"];?\n?/g, '');
            // Append interfaces to the top (after other imports)
            let interfaceBlock = '\n';
            for (const typeName of typeNames) {
                if (compInterfaces[typeName]) {
                    interfaceBlock += compInterfaces[typeName] + '\n\n';
                }
            }
            
            // Insert after last import
            const importMatches = [...content.matchAll(/^import.*$/gm)];
            if (importMatches.length > 0) {
                const lastImport = importMatches[importMatches.length - 1];
                const insertPos = lastImport.index + lastImport[0].length;
                content = content.slice(0, insertPos) + '\n' + interfaceBlock + content.slice(insertPos);
            } else {
                content = interfaceBlock + content;
            }
            fs.writeFileSync(compPath, content, 'utf8');
            console.log(`Updated ${comp}`);
        }
    }
}

// 2. Read types/admin.ts
const adminTypesPath = path.join(typesDir, 'admin.ts');
if (fs.existsSync(adminTypesPath)) {
    const adminContent = fs.readFileSync(adminTypesPath, 'utf8');
    const adminInterfaces = extractInterfaces(adminContent);

    const adminMapping = {
        'AdminTable': ['AdminTableProps'],
        'AdminStatsCard': ['AdminStatsCardProps'],
        'AdminPagination': ['AdminPaginationProps'],
        'AdminActionButtons': ['AdminActionButtonsProps']
    };

    for (const [comp, typeNames] of Object.entries(adminMapping)) {
        const compPath = path.join(componentsDir, 'admin', comp, 'index.tsx');
        if (fs.existsSync(compPath)) {
            let content = fs.readFileSync(compPath, 'utf8');
            // Remove import
            content = content.replace(/import\s+\{.*\}\s+from\s+['"]\.\.\/\.\.\/\.\.\/types\/admin['"];?\n?/g, '');
            let interfaceBlock = '\n';
            for (const typeName of typeNames) {
                if (adminInterfaces[typeName]) {
                    interfaceBlock += adminInterfaces[typeName] + '\n\n';
                }
            }
            const importMatches = [...content.matchAll(/^import.*$/gm)];
            if (importMatches.length > 0) {
                const lastImport = importMatches[importMatches.length - 1];
                const insertPos = lastImport.index + lastImport[0].length;
                content = content.slice(0, insertPos) + '\n' + interfaceBlock + content.slice(insertPos);
            } else {
                content = interfaceBlock + content;
            }
            fs.writeFileSync(compPath, content, 'utf8');
            console.log(`Updated ${comp}`);
        }
    }
}

// 3. Move ProductCardProps from types/index.ts to ProductCard/index.tsx
const indexTypesPath = path.join(typesDir, 'index.ts');
if (fs.existsSync(indexTypesPath)) {
    let indexContent = fs.readFileSync(indexTypesPath, 'utf8');
    const indexInterfaces = extractInterfaces(indexContent);
    if (indexInterfaces['ProductCardProps']) {
        const pCardPath = path.join(componentsDir, 'client', 'ProductCard', 'index.tsx');
        if (fs.existsSync(pCardPath)) {
            let content = fs.readFileSync(pCardPath, 'utf8');
            // Fix import, might be `import { Product, ProductCardProps } from "../../../types";`
            // Change to `import { Product } from "../../../types";`
            content = content.replace(/import\s+\{\s*Product,\s*ProductCardProps\s*\}\s+from\s+['"]\.\.\/\.\.\/\.\.\/types['"];?/, 'import { Product } from "../../../types";');
            
            let interfaceBlock = '\n' + indexInterfaces['ProductCardProps'] + '\n\n';
            const importMatches = [...content.matchAll(/^import.*$/gm)];
            if (importMatches.length > 0) {
                const lastImport = importMatches[importMatches.length - 1];
                const insertPos = lastImport.index + lastImport[0].length;
                content = content.slice(0, insertPos) + '\n' + interfaceBlock + content.slice(insertPos);
            }
            fs.writeFileSync(pCardPath, content, 'utf8');
            console.log(`Updated ProductCard`);
            
            // Remove ProductCardProps from index.ts
            indexContent = indexContent.replace(indexInterfaces['ProductCardProps'], '');
            fs.writeFileSync(indexTypesPath, indexContent.trim() + '\n', 'utf8');
        }
    }
}

// 4. Delete components.ts and admin.ts
if (fs.existsSync(componentsTypesPath)) fs.unlinkSync(componentsTypesPath);
if (fs.existsSync(adminTypesPath)) fs.unlinkSync(adminTypesPath);
console.log('Deleted types/components.ts and types/admin.ts');
