"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Map,
  MapMarker,
  MarkerContent,
  type MapRef,
} from "@/components/ui/map";
import { cn } from "@/lib/utils";

interface GeocacheResult {
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
  };
  bbox: number[];
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<GeocacheResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const mapRef = useRef<MapRef | null>(null);

  const showSplitView = hasSearched;
  const hasCoordinates = Boolean(result?.point);
  const mapCenter: [number, number] = result
    ? [result.point.lon, result.point.lat]
    : [0, 20];

  useEffect(() => {
    if (!hasCoordinates || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [result.point.lon, result.point.lat],
      zoom: 10,
      duration: 1200,
      essential: true,
    });
  }, [hasCoordinates, result]);

  useEffect(() => {
    if (!showSplitView) return;
    const handle = window.setTimeout(() => {
      mapRef.current?.resize();
    }, 750);
    return () => window.clearTimeout(handle);
  }, [showSplitView, result]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Please enter a location");
      return;
    }

    setHasSearched(true);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/geocache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: trimmedQuery }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to fetch location data");
        return;
      }

      setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = () => {
    if (loading) return "SEARCHING...";
    if (error) return "ERROR";
    if (result) return "COMPLETE";
    return "NOMINAL";
  };

  const handleResetView = () => {
    setHasSearched(false);
    setLoading(false);
    setError(null);
    setResult(null);
  };

  return (
    <div className="relative min-h-screen bg-amber-50 dark:bg-black">
      <div className="absolute right-4 top-4 z-20">
        <ModeToggle />
      </div>

      {/* CRT scanline overlay - dark mode only */}
      <div className="pointer-events-none fixed inset-0 z-10 hidden bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)] dark:block" />

      {/* CRT vignette effect - dark mode only */}
      <div className="pointer-events-none fixed inset-0 z-10 hidden bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] dark:block" />

      {/* Paper texture overlay - light mode only */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(120,100,80,0.1)_100%)] dark:hidden" />

      <div
        className={cn(
          "relative z-0 flex flex-col px-4 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          showSplitView
            ? "h-screen overflow-hidden justify-start py-6 md:py-8"
            : "min-h-screen items-center justify-center py-12"
        )}
      >
        <div
          className={cn(
            "w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
            showSplitView ? "flex-1 min-h-0 max-w-none" : "max-w-2xl"
          )}
        >
          <div
            className={cn(
              "gap-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
              showSplitView
                ? "grid h-full min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)] items-stretch md:grid-cols-[minmax(320px,440px)_1fr] md:grid-rows-[auto_minmax(0,1fr)] md:gap-8"
                : "flex flex-col items-center"
            )}
          >
            <div
              className={cn(
                "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                showSplitView
                  ? "row-start-1 text-left md:col-start-1 md:row-start-1"
                  : "mx-auto w-full max-w-2xl text-center md:min-w-[40rem]"
              )}
            >
              <h1
                className={cn(
                  "font-bold tracking-[0.2em] text-green-800 drop-shadow-[0_0_1px_rgba(0,0,0,0.3)] dark:text-green-500 dark:drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]",
                  showSplitView ? "text-2xl md:text-3xl" : "text-4xl md:text-5xl"
                )}
              >
                <button
                  type="button"
                  onClick={handleResetView}
                  className="inline-flex items-center text-left transition-opacity hover:cursor-pointer hover:opacity-80 focus-visible:opacity-90 focus-visible:outline-none"
                >
                  GEOCACHE
                </button>
              </h1>
              {!showSplitView && (
                <p className="mt-2 text-[10px] tracking-[0.28em] text-green-700 dark:text-green-600">
                  DETERMINISTIC CACHED GEOCODING API FOR AI AGENTS
                </p>
              )}
            </div>

            <div
              className={cn(
                "flex w-full flex-col gap-6 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                showSplitView
                  ? "row-start-2 h-full min-h-0 overflow-hidden md:col-start-1 md:row-start-2 md:mx-0 md:translate-x-0 md:items-start"
                  : "mx-auto max-w-2xl items-center text-center md:min-w-[40rem]"
              )}
            >
              <div
                className={cn(
                  "border border-green-800/30 bg-amber-100/50 p-6 dark:border-green-900 dark:bg-black/50",
                  showSplitView ? "w-full" : "mx-auto w-[94%]"
                )}
              >
                <div className="mb-4 border-b border-green-800/30 pb-2 dark:border-green-900">
                  <span className="text-xs tracking-widest text-green-700 dark:text-green-700">
                    &gt; LOCATION QUERY
                  </span>
                </div>
                <form onSubmit={handleSubmit}>
                  <Input
                    type="text"
                    placeholder="ENTER SEARCH QUERY..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    disabled={loading}
                    className="h-12 rounded-none border border-green-800/50 bg-amber-50 px-4 font-mono text-base uppercase tracking-wider text-green-800 placeholder:text-green-800/40 caret-green-700 transition-all focus:border-green-700 focus:shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:border-green-700 dark:bg-black dark:text-green-500 dark:placeholder:text-green-900 dark:caret-green-500 dark:focus:border-green-500 dark:focus:shadow-[0_0_10px_rgba(34,197,94,0.3),inset_0_0_20px_rgba(34,197,94,0.05)]"
                  />
                </form>
                <div className="mt-4 flex justify-between text-xs tracking-widest text-green-700/70 dark:text-green-800">
                  <span>STATUS: {getStatusText()}</span>
                  <span className={loading ? "animate-pulse" : ""}>●</span>
                </div>
              </div>

              {(loading || error || result) && (
                <div className="flex w-full flex-1 min-h-0 flex-col overflow-hidden border border-green-800/30 bg-amber-100/50 p-6 dark:border-green-900 dark:bg-black/50">
                  <div className="mb-4 border-b border-green-800/30 pb-2 dark:border-green-900">
                    <span className="text-xs tracking-widest text-green-700 dark:text-green-700">
                      &gt; OUTPUT
                    </span>
                  </div>

                  <div className="geocache-scroll flex-1 min-h-0 overflow-y-auto pr-2">
                    {loading && (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-sm tracking-widest text-green-700 animate-pulse dark:text-green-500">
                          PROCESSING REQUEST...
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="py-4">
                        <div className="text-sm tracking-wider text-red-700 dark:text-red-500">
                          ERROR: {error.toUpperCase()}
                        </div>
                      </div>
                    )}

                    {result && !loading && (
                      <pre className="overflow-x-auto text-xs leading-relaxed text-green-800 dark:text-green-500">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              className={cn(
                "relative w-full transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                showSplitView
                  ? "row-start-3 h-full min-h-0 translate-x-0 opacity-100 md:col-start-2 md:row-start-2 md:self-stretch"
                  : "pointer-events-none h-0 translate-x-6 opacity-0"
              )}
            >
              <div className="flex h-full w-full flex-col border border-green-800/30 bg-amber-100/50 dark:border-green-900 dark:bg-black/50">
                <div className="flex items-center justify-between border-b border-green-800/30 px-4 py-3 dark:border-green-900">
                  <span className="text-xs tracking-widest text-green-700 dark:text-green-700">
                    &gt; MAP VIEW
                  </span>
                  <span className="text-[10px] tracking-widest text-green-700/60 dark:text-green-800">
                    {hasCoordinates
                      ? "LOCKED"
                      : loading
                        ? "LOCATING"
                        : "STANDBY"}
                  </span>
                </div>
                <div className="relative flex-1 overflow-hidden">
                  {showSplitView && (
                    <Map ref={mapRef} center={mapCenter} zoom={hasCoordinates ? 10 : 1.4}>
                      {hasCoordinates && result && (
                        <MapMarker
                          longitude={result.point.lon}
                          latitude={result.point.lat}
                        >
                          <MarkerContent className="drop-shadow-[0_0_12px_rgba(34,197,94,0.45)]">
                            <div className="h-4 w-4 rounded-full border border-green-200/60 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] dark:border-green-400/70 dark:bg-green-400" />
                          </MarkerContent>
                        </MapMarker>
                      )}
                    </Map>
                  )}
                  {!hasCoordinates && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs tracking-widest text-green-700/70 dark:text-green-800">
                      {loading
                        ? "ACQUIRING COORDINATES..."
                        : "AWAITING COORDINATES"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
