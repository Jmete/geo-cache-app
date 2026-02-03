"use client";

import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setError("Please enter a location");
      return;
    }

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

  return (
    <div className="relative min-h-screen bg-amber-50 dark:bg-black">
      <div className="absolute top-4 right-4 z-20">
        <ModeToggle />
      </div>

      {/* CRT scanline overlay - dark mode only */}
      <div className="pointer-events-none fixed inset-0 z-10 hidden bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)] dark:block" />

      {/* CRT vignette effect - dark mode only */}
      <div className="pointer-events-none fixed inset-0 z-10 hidden bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] dark:block" />

      {/* Paper texture overlay - light mode only */}
      <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(120,100,80,0.1)_100%)] dark:hidden" />

      <div className="relative z-0 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-[0.2em] text-green-800 drop-shadow-[0_0_1px_rgba(0,0,0,0.3)] dark:text-green-500 dark:drop-shadow-[0_0_10px_rgba(34,197,94,0.5)] md:text-5xl">
            GEOCACHE
          </h1>
          <p className="mt-2 text-xs tracking-[0.3em] text-green-700 dark:text-green-600">METE HOLDINGS</p>
        </div>

        <div className="w-full max-w-xl border border-green-800/30 bg-amber-100/50 p-6 dark:border-green-900 dark:bg-black/50">
          <div className="mb-4 border-b border-green-800/30 pb-2 dark:border-green-900">
            <span className="text-xs tracking-widest text-green-700 dark:text-green-700">&gt; LOCATION QUERY</span>
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

        {/* Results Display */}
        {(loading || error || result) && (
          <div className="mt-6 w-full max-w-xl border border-green-800/30 bg-amber-100/50 p-6 dark:border-green-900 dark:bg-black/50">
            <div className="mb-4 border-b border-green-800/30 pb-2 dark:border-green-900">
              <span className="text-xs tracking-widest text-green-700 dark:text-green-700">&gt; OUTPUT</span>
            </div>

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
        )}
      </div>
    </div>
  );
}
