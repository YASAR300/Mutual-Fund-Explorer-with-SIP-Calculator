import { NextResponse } from "next/server";
import { getScheme, normalizeNavHistory } from "@/lib/mfapi";
import { computeSip } from "@/lib/calculations";

export async function POST(req, { params }) {
  try {
    const { code } = params;
    const body = await req.json();
    const amount = Number(body.amount);
    const frequency = body.frequency || "monthly";
    const from = body.from;
    const to = body.to;
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Invalid amount");
    if (!from || !to) throw new Error("from/to required");

    const raw = await getScheme(code);
    const navHistory = normalizeNavHistory(raw);
    const result = computeSip(navHistory, { amount, frequency, from, to });
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


