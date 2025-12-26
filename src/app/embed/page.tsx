import fs from "node:fs/promises";
import path from "node:path";
import EmbedPageClient from "./EmbedPageClient";

export default async function EmbedPage() {
  const instructionsPath = path.join(process.cwd(), "public", "embed", "INSTRUCTIONS.md");
  const instructionsText = await fs.readFile(instructionsPath, "utf8");

  return <EmbedPageClient instructionsText={instructionsText} />;
}
