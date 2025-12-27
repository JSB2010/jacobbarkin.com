import fs from "node:fs/promises";
import path from "node:path";
import EmbedPageClient from "./EmbedPageClient";

export const dynamic = "force-static";

export default async function EmbedPage() {
  const instructionsPath = path.join(process.cwd(), "public", "embed", "INSTRUCTIONS.md");
  let instructionsText = "";

  try {
    instructionsText = await fs.readFile(instructionsPath, "utf8");
  } catch {
    instructionsText = "";
  }

  return <EmbedPageClient instructionsText={instructionsText} />;
}
