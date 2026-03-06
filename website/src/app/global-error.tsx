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
      <body className="min-h-screen bg-black text-white flex items-center justify-center" style={{ fontFamily: "monospace" }}>
        <div className="text-center space-y-4">
          <p style={{ fontSize: "0.55rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#686878" }}>
            Error
          </p>
          <h1 style={{ fontSize: "1.2rem", fontWeight: "bold", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.65rem", color: "#686878" }}>
            An unexpected error occurred.
          </p>
          <button
            onClick={() => reset()}
            style={{
              padding: "0.625rem 1.25rem",
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: "white",
              fontSize: "0.6rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              cursor: "pointer",
              fontFamily: "monospace",
              borderRadius: "0",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
