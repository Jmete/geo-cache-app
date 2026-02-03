import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      return NextResponse.json(
        { error: "Query cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedQuery.length > 512) {
      return NextResponse.json(
        { error: "Query exceeds maximum length of 512 characters" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEOCACHE_API_KEY;
    if (!apiKey) {
      console.error("GEOCACHE_API_KEY is not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.geocache.dev/v1/geocode", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ text: trimmedQuery }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Geocache API error response:", response.status, errorBody);

      if (response.status === 401) {
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 500 }
        );
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Failed to fetch location data" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Geocache API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
