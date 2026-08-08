import { Project, SyntaxKind, FunctionDeclaration, ClassDeclaration, InterfaceDeclaration, TypeAliasDeclaration, VariableStatement } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

function generateMap() {
    const project = new Project();
    
    // Thêm toàn bộ các file TS, TSX, JS trong FE và BE
    project.addSourceFilesAtPaths("FE/src/**/*.{ts,tsx,js,jsx}");
    project.addSourceFilesAtPaths("BE/src/**/*.{ts,js}");

    const sourceFiles = project.getSourceFiles();
    
    let output = "# TỔNG QUAN DỰ ÁN SHOP QUẦN ÁO (PROJECT MAP)\n\n";
    output += "> File này được tự động tạo. Hãy dùng file này để hiểu cấu trúc code, tên hàm, và các tham số.\n\n";

    // Phân nhóm Backend và Frontend
    const backendFiles = sourceFiles.filter(f => f.getFilePath().includes('/BE/src/'));
    const frontendFiles = sourceFiles.filter(f => f.getFilePath().includes('/FE/src/'));

    const processFiles = (files, sectionName) => {
        output += `## ${sectionName}\n\n`;
        files.forEach(file => {
            const relativePath = file.getFilePath().split(`/${sectionName === 'Backend' ? 'BE' : 'FE'}/src/`)[1] || file.getFilePath();
            let fileContent = "";

            // 1. Classes & Methods
            file.getClasses().forEach((cls) => {
                const isExported = cls.isExported() ? "export " : "";
                fileContent += `- **Class**: \`${isExported}${cls.getName()}\`\n`;
                cls.getMethods().forEach(method => {
                    const params = method.getParameters().map(p => `${p.getName()}: ${p.getTypeNode()?.getText() || 'any'}`).join(', ');
                    const returnType = method.getReturnTypeNode()?.getText() || 'any';
                    fileContent += `  - Method: \`${method.getName()}(${params}): ${returnType}\`\n`;
                });
            });

            // 2. Interfaces
            file.getInterfaces().forEach((iface) => {
                fileContent += `- **Interface**: \`${iface.getName()}\`\n`;
            });

            // 3. Types
            file.getTypeAliases().forEach((t) => {
                fileContent += `- **Type**: \`${t.getName()}\`\n`;
            });

            // 4. Functions (Standard)
            file.getFunctions().forEach((func) => {
                const isExported = func.isExported() ? "export " : "";
                const params = func.getParameters().map(p => `${p.getName()}: ${p.getTypeNode()?.getText() || 'any'}`).join(', ');
                const returnType = func.getReturnTypeNode()?.getText() || 'any';
                fileContent += `- **Function**: \`${isExported}${func.getName()}(${params}): ${returnType}\`\n`;
            });

            // 5. Arrow Functions (Exported Constants)
            file.getVariableStatements().forEach((v) => {
                if (v.isExported()) {
                    v.getDeclarations().forEach(d => {
                        const initializer = d.getInitializer();
                        if (initializer && (initializer.getKind() === SyntaxKind.ArrowFunction || initializer.getKind() === SyntaxKind.FunctionExpression)) {
                            fileContent += `- **Exported Arrow Func**: \`${d.getName()}\`\n`;
                        } else if (d.getName().includes('Module') || d.getName().includes('Routes') || d.getName().includes('Controller') || d.getName().includes('Service')) {
                            fileContent += `- **Exported Variable**: \`${d.getName()}\`\n`;
                        }
                    });
                }
            });

            // 6. API Routes
            if (sectionName === 'Backend') {
                const text = file.getFullText();
                const routeRegex = /router\.(get|post|put|delete|patch|route)\(['"]([^'"]+)['"]/g;
                let match;
                const routesFound = new Set();
                while ((match = routeRegex.exec(text)) !== null) {
                    routesFound.add(`- **API Route**: \`${match[1].toUpperCase()} ${match[2]}\``);
                }
                if (routesFound.size > 0) {
                    fileContent += Array.from(routesFound).join('\n') + '\n';
                }
            }

            if (fileContent) {
                output += `### File: \`${relativePath}\`\n`;
                output += fileContent + "\n";
            }
        });
    }

    processFiles(backendFiles, "Backend");
    processFiles(frontendFiles, "Frontend");

    fs.writeFileSync('PROJECT_MAP.md', output);
    console.log("Đã tạo thành công bản đồ dự án tại PROJECT_MAP.md!");
}

generateMap();
