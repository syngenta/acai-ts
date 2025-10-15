#!/usr/bin/env node
/**
 * Fix ESM imports by adding .js extensions
 * Handles both file and directory imports correctly
 */

const fs = require('fs');
const path = require('path');

function fixImportsInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const dir = path.dirname(filePath);

    // Replace relative imports only (starting with ./ or ../)
    content = content.replace(/from '(\.[^']+)'/g, (match, importPath) => {
        // Skip if not a relative import
        if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
            return match;
        }

        // Skip if already has extension
        if (importPath.endsWith('.js')) {
            return match;
        }

        // Resolve the full path
        const fullPath = path.resolve(dir, importPath);

        // Check if it's a directory (has index.js)
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory()) {
            return `from '${importPath}/index.js'`;
        }

        // Otherwise it's a file
        return `from '${importPath}.js'`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.js')) {
            fixImportsInFile(filePath);
        }
    }
}

const esmDir = path.join(__dirname, '..', 'dist', 'esm');
walkDir(esmDir);
console.log('✓ Fixed ESM imports');
