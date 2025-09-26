import { NextResponse } from "next/server";
import { getScheme, normalizeNavHistory } from "@/lib/mfapi";
import { computeReturns } from "@/lib/calculations";

export async function GET(req, { params }) {
  try {
    const { code } = params;
    const url = new URL(req.url);
    const period = url.searchParams.get("period");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const raw = await getScheme(code);
    const navHistory = normalizeNavHistory(raw);
    const result = computeReturns(navHistory, { period, from, to });
    return new NextResponse(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}


