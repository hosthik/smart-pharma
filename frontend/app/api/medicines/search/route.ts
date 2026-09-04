import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ||
  "http://127.0.0.1:4000";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `${BACKEND_URL}/medicines/search?q=${encodeURIComponent(query)}`,
      {
        cache: "no-store",
      },
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Medicine search proxy error:", error);

    return NextResponse.json(
      {
        message: "Unable to connect to SmartPharma backend.",
      },
      {
        status: 502,
      },
    );
  }
}