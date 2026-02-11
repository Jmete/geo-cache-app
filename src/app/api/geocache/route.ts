import { NextRequest, NextResponse } from "next/server";

type UnknownRecord = Record<string, unknown>;

interface NormalizedGeocacheResponse {
  input: {
    raw: string;
  };
  normalizedKey: string;
  canonical: {
    countryIso2: string;
    countryName: string;
    displayName: string;
    admin1: string;
    city: string;
  };
  granularity: string;
  confidence: number;
  flags: Record<string, unknown>;
  provider: string;
  cache: {
    hit: boolean;
  };
  point: {
    lat: number;
    lon: number;
  } | null;
  bbox?: [number, number, number, number];
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asFiniteNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function hasValidPoint(value: unknown): value is { lat: number; lon: number } {
  if (!isRecord(value)) return false;
  return asFiniteNumber(value.lat) !== null && asFiniteNumber(value.lon) !== null;
}

function selectCandidate(payload: unknown): UnknownRecord | null {
  if (isRecord(payload)) {
    return payload;
  }

  if (!Array.isArray(payload)) {
    return null;
  }

  const records = payload.filter(isRecord);
  if (records.length === 0) {
    return null;
  }

  return records.find((item) => hasValidPoint(item.point)) ?? records[0];
}

function normalizeGeocacheResponse(
  payload: unknown,
  rawQuery: string
): NormalizedGeocacheResponse | null {
  const candidate = selectCandidate(payload);
  if (!candidate) {
    return null;
  }

  const canonical = isRecord(candidate.canonical) ? candidate.canonical : {};
  const cache = isRecord(candidate.cache) ? candidate.cache : {};
  const pointData = hasValidPoint(candidate.point)
    ? {
        lat: candidate.point.lat,
        lon: candidate.point.lon,
      }
    : null;
  const bbox =
    Array.isArray(candidate.bbox) &&
    candidate.bbox.length === 4 &&
    candidate.bbox.every((item) => asFiniteNumber(item) !== null)
      ? (candidate.bbox as [number, number, number, number])
      : undefined;

  return {
    input: {
      raw: isRecord(candidate.input)
        ? asString(candidate.input.raw, rawQuery)
        : rawQuery,
    },
    normalizedKey: asString(candidate.normalizedKey),
    canonical: {
      countryIso2: asString(canonical.countryIso2),
      countryName: asString(canonical.countryName),
      displayName: asString(canonical.displayName),
      admin1: asString(canonical.admin1),
      city: asString(canonical.city),
    },
    granularity: asString(candidate.granularity),
    confidence: asFiniteNumber(candidate.confidence) ?? 0,
    flags: isRecord(candidate.flags) ? candidate.flags : {},
    provider: asString(candidate.provider),
    cache: {
      hit: typeof cache.hit === "boolean" ? cache.hit : false,
    },
    point: pointData,
    ...(bbox ? { bbox } : {}),
  };
}

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
    const normalized = normalizeGeocacheResponse(data, trimmedQuery);

    if (!normalized) {
      return NextResponse.json(
        { error: "No location data returned by provider" },
        { status: 502 }
      );
    }

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("Geocache API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
