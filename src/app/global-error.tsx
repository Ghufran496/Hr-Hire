"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global] route error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "Inter, Arial, sans-serif",
          padding: "64px 24px",
          color: "#0a0a0a",
          background: "#ffffff",
        }}
      >
        <div
          style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}
        >
          <p
            style={{
              color: "#dc2626",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            SMARTHIRE
          </p>
          <h1
            style={{ fontSize: "28px", fontWeight: 700, margin: "16px 0 12px" }}
          >
            Something broke at the application root
          </h1>
          <p style={{ color: "#64748b", margin: "0 0 24px" }}>
            We&apos;ve logged the error. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#dc2626",
              color: "#ffffff",
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
