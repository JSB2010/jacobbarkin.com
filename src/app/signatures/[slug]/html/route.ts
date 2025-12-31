import { NextRequest, NextResponse } from "next/server";
import { getSignatureById } from "../../signatures-data";

export const dynamic = "force-static";
// Next.js requires this to be a literal, not an expression.
export const revalidate = 86400; // 24 hours

export async function GET(_request: NextRequest, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const signature = getSignatureById(slug);

  if (!signature) {
    return NextResponse.json({ error: "Signature not found" }, { status: 404 });
  }

  return new Response(signature.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
