"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-gray-400 text-sm">An unexpected error occurred.</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-sm hover:bg-[#39FF14]/20 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
