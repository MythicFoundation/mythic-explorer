"use client";

export default function NetworkError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-mythic-surface border border-red-500/30 p-8 text-center space-y-4">
        <h1 className="font-heading font-bold text-xl text-white">Something went wrong</h1>
        <p className="text-mythic-muted text-sm">Failed to load this page. The node may be temporarily unavailable.</p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-mythic-green/10 border border-mythic-green/30 text-mythic-green text-sm hover:bg-mythic-green/20 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
