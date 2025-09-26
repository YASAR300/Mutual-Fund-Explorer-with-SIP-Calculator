import { NextResponse } from "next/server";
import { getScheme, normalizeNavHistory } from "@/lib/mfapi";

export async function GET(_req, { params }) {
  try {
    const { code } = params;
    const raw = await getScheme(code);
    const navHistory = normalizeNavHistory(raw);
    const meta = {
      schemeName: raw?.meta?.scheme_name || raw?.scheme_name || raw?.name,
      fundHouse: raw?.meta?.fund_house || raw?.fund_house,
      schemeType: raw?.meta?.scheme_type || raw?.scheme_type,
      schemeCategory: raw?.meta?.scheme_category || raw?.category,
      isin: {
        dividend: raw?.meta?.isin_dividend || raw?.isin_div,
        growth: raw?.meta?.isin_growth || raw?.isin_growth,
      },
      lastUpdated: raw?.meta?.last_updated || navHistory[navHistory.length - 1]?.date,
    };
    return new NextResponse(JSON.stringify({ meta, navHistory }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


