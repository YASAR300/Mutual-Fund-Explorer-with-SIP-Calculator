import { NextResponse } from "next/server";
import { getAllSchemes } from "@/lib/mfapi";

export async function GET() {
  try {
    const data = await getAllSchemes();
    return new NextResponse(JSON.stringify(data), {
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


