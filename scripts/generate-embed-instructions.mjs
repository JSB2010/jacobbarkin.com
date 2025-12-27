import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "public", "embed", "INSTRUCTIONS.md");
const outputPath = path.join(root, "src", "app", "embed", "instructions.ts");

const content = await readFile(sourcePath, "utf8");
const output = `const instructionsText = ${JSON.stringify(content)};\n\nexport default instructionsText;\n`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, output, "utf8");
