const fs = require('fs');
const path = require('path');

const srcDir = 'c:/xampp/htdocs/lab_nodejs/src';

// Map of file names to their new relative path from src/
const fileMap = {
    'config/db.js': 'core/config/db.js',
    // ... we don't need a static map if we can just scan the directory structure
};

function buildFileMap(dir, map = {}) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            buildFileMap(fullPath, map);
        } else {
            const relPath = path.relative(srcDir, fullPath).replace(/\\/g, '/');
            const basename = path.basename(file);
            // Ignore index.js collisions, but record others
            if (basename !== 'index.js') {
                map[basename] = relPath;
                // Also map without extension
                const ext = path.extname(basename);
                if (ext) {
                    map[basename.replace(ext, '')] = relPath;
                }
            }
        }
    }
    return map;
}

const map = buildFileMap(srcDir);
// Special handling for core stuff
map['db'] = 'core/config/db.js'; // if they require('../config/db')

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changed = false;
    
    // regex to find requires like require('../models/Product.model')
    const requireRegex = /require\(['"](\.[^'"]+)['"]\)/g;
    
    content = content.replace(requireRegex, (match, p1) => {
        // p1 is something like '../models/Product.model'
        // Let's resolve what it originally pointed to based on OLD structure
        // Since we don't know the exact old file location, we can just extract the basename
        const targetBasename = path.basename(p1);
        
        if (map[targetBasename]) {
            // Found where it moved to
            const targetRelPath = map[targetBasename]; // e.g. modules/catalog/models/Product.model.js
            const currentRelPath = path.relative(srcDir, filePath).replace(/\\/g, '/'); // e.g. modules/checkout/controllers/orders.controller.js
            
            // Calculate new relative path from current to target
            const currentDir = path.dirname(path.join(srcDir, currentRelPath));
            const targetAbsPath = path.join(srcDir, targetRelPath);
            
            let newRequirePath = path.relative(currentDir, targetAbsPath).replace(/\\/g, '/');
            if (!newRequirePath.startsWith('.')) {
                newRequirePath = './' + newRequirePath;
            }
            // Remove .js extension if it wasn't there
            if (!p1.endsWith('.js') && newRequirePath.endsWith('.js')) {
                newRequirePath = newRequirePath.slice(0, -3);
            }
            
            if (p1 !== newRequirePath) {
                console.log(`Updated in ${filePath}: ${p1} -> ${newRequirePath}`);
                changed = true;
                return `require('${newRequirePath}')`;
            }
        }
        return match;
    });
    
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf-8');
    }
}

function processAllFiles(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== 'scratch') {
                processAllFiles(fullPath);
            }
        } else if (file.endsWith('.js')) {
            fixImportsInFile(fullPath);
        }
    }
}

processAllFiles(srcDir);
console.log("Done fixing imports");
