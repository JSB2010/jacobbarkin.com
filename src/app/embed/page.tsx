import instructionsText from "./instructions";
import EmbedPageClient from "./EmbedPageClient";

export const dynamic = "force-static";

export default function EmbedPage() {
  return <EmbedPageClient instructionsText={instructionsText} />;
}
