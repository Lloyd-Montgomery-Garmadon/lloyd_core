import fs from "fs";
import path from "path";

const targetDir = path.resolve("./src"); // 目标目录
const outputFile = path.join(targetDir, "index.ts");

function getAllTsFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let result: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            result = result.concat(getAllTsFiles(fullPath));
        } else if (
            entry.name.endsWith(".ts") &&
            entry.name !== "index.ts" &&
            !entry.name.endsWith(".d.ts")
        ) {
            result.push(fullPath);
        }
    }
    return result;
}

const files = getAllTsFiles(targetDir);

const exportLines = files
    .filter(file => {
        const content = fs.readFileSync(file, "utf-8").trim();
        return content.length > 0; // 文件内容非空才导出
    })
    .map(file => {
        const relPath = "./" + path.relative(targetDir, file).replace(/\\/g, "/").replace(/\.ts$/, "");
        return `export * from "${relPath}";`;
    });

fs.writeFileSync(outputFile, exportLines.join("\n") + "\n", "utf-8");
console.log(`✅ 已生成 ${outputFile}`);
