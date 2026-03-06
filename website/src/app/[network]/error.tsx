"use client";

export default function NetworkError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="glass-card border-[#F87171]/20 p-10 text-center space-y-4">
        <div className="w-12 h-12 mx-auto bg-[#F87171]/10 border border-[#F87171]/20 flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="font-display font-bold text-[1.1rem] tracking-[0.04em] text-white">
          Something went wrong
        </h1>
        <p className="font-mono text-[0.7rem] text-text-400">
          Failed to load this page. The node may be temporarily unavailable.
        </p>
        <button
          onClick={() => reset()}
          className="mt-2 px-6 py-3 bg-bg-2 border border-white/[0.08] text-white font-mono text-[0.65rem] tracking-[0.08em] uppercase hover:border-[#7B2FFF]/30 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
