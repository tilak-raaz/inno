/**
 * Ambient starfield. Rendered once in the root layout as a fixed backdrop so
 * every page shares the same sky and page transitions don't re-seed it.
 *
 * Positions come from a deterministic PRNG, so the server and client agree and
 * there is no hydration mismatch. Three parallax bands, all pure CSS — no
 * canvas, no rAF loop, nothing to schedule on the main thread.
 */

const BANDS = [
  { count: 46, size: [1, 1.7], opacity: [0.18, 0.42], twinkle: false },
  { count: 30, size: [1.3, 2.2], opacity: [0.3, 0.62], twinkle: true },
  { count: 12, size: [2, 3.1], opacity: [0.45, 0.8], twinkle: true },
] as const;

/** mulberry32 — small, stable, seeded. */
function prng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Starfield({ className = "" }: { className?: string }) {
  const rand = prng(20260406);

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}
    >
      {/* Deep field wash — keeps the corners from reading as flat black */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(45,22,96,0.35) 0%, rgba(6,3,14,0) 70%)," +
            "radial-gradient(ellipse 60% 50% at 12% 78%, rgba(50,20,110,0.22) 0%, rgba(6,3,14,0) 70%)," +
            "radial-gradient(ellipse 55% 45% at 88% 30%, rgba(30,26,105,0.2) 0%, rgba(6,3,14,0) 70%)",
        }}
      />
      {BANDS.map((band, bandIndex) => (
        <div key={bandIndex} className="absolute inset-0">
          {Array.from({ length: band.count }, (_, i) => {
            const size =
              band.size[0] + rand() * (band.size[1] - band.size[0]);
            const opacity =
              band.opacity[0] + rand() * (band.opacity[1] - band.opacity[0]);
            return (
              <span
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  left: `${(rand() * 100).toFixed(3)}%`,
                  top: `${(rand() * 100).toFixed(3)}%`,
                  width: `${size.toFixed(2)}px`,
                  height: `${size.toFixed(2)}px`,
                  opacity,
                  boxShadow:
                    bandIndex === 2
                      ? `0 0 ${(size * 3).toFixed(1)}px rgba(196,181,253,0.75)`
                      : undefined,
                  animation: band.twinkle
                    ? `inno-twinkle ${(4 + rand() * 7).toFixed(2)}s ease-in-out ${(
                        rand() * -9
                      ).toFixed(2)}s infinite`
                    : undefined,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
