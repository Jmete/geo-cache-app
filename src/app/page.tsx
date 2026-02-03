import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
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

      <div className="relative z-0 flex min-h-screen flex-col items-center justify-center px-4">
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
          <Input
            type="text"
            placeholder="ENTER SEARCH QUERY..."
            className="h-12 rounded-none border border-green-800/50 bg-amber-50 px-4 font-mono text-base uppercase tracking-wider text-green-800 placeholder:text-green-800/40 caret-green-700 transition-all focus:border-green-700 focus:shadow-[0_0_10px_rgba(0,0,0,0.1)] dark:border-green-700 dark:bg-black dark:text-green-500 dark:placeholder:text-green-900 dark:caret-green-500 dark:focus:border-green-500 dark:focus:shadow-[0_0_10px_rgba(34,197,94,0.3),inset_0_0_20px_rgba(34,197,94,0.05)]"
          />
          <div className="mt-4 flex justify-between text-xs tracking-widest text-green-700/70 dark:text-green-800">
            <span>STATUS: NOMINAL</span>
            <span className="animate-pulse">●</span>
          </div>
        </div>
      </div>
    </div>
  );
}
