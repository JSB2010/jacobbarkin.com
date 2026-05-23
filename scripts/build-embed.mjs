import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { minify } from "terser";

const root = process.cwd();
const sourcePath = path.join(root, "src", "embed", "credit.js");
const outputPath = path.join(root, "public", "embed", "credit.js");

const source = await readFile(sourcePath, "utf8");
const result = await minify(source, {
  compress: {
    passes: 2,
  },
  mangle: true,
  format: {
    comments: false,
  },
  ecma: 2018,
});

if (!result.code) {
  throw new Error("Terser produced an empty embed script");
}

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${result.code}\n`, "utf8");
