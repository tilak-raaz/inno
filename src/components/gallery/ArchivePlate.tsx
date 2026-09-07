import type { Capture } from "@/data/gallery";

/**
 * An archive frame.
 *
 * When a capture has a `src` this renders the photograph. Without one it
 * renders a procedural plate derived from the capture's seed — a deterministic
 * stand-in that keeps the archive legible and on-palette until real images
 * land, rather than a grey box or a broken <img>.
 */
export function ArchivePlate({ capture }: { capture: Capture }) {
  if (capture.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={capture.src}
        alt={capture.caption}
        className="h-full w-full object-cover"
        loading="lazy"
        draggable={false}
      />
    );
  }

  const s = capture.seed;
  const hue = 232 + ((s * 13) % 70); // indigo -> violet
  const h2 = hue + 22;
  const bx = 18 + ((s * 7) % 64);
  const by = 20 + ((s * 11) % 55);
  const cx = 30 + ((s * 17) % 50);
  const cy = 40 + ((s * 5) % 45);
  const tilt = -28 + ((s * 3) % 56);

  return (
    <div
      aria-hidden
      className="relative h-full w-full overflow-hidden"
      style={{
        backgroundImage:
          `radial-gradient(ellipse 58% 52% at ${bx}% ${by}%, hsl(${hue} 72% 42% / 0.62) 0%, hsl(${hue} 60% 18% / 0) 68%),` +
          `radial-gradient(ellipse 46% 44% at ${cx}% ${cy}%, hsl(${h2} 80% 58% / 0.34) 0%, hsl(${h2} 60% 20% / 0) 66%),` +
          `linear-gradient(${tilt + 160}deg, #120b26 0%, #07040f 74%)`,
      }}
    >
      {/* horizon */}
      <div
        className="absolute inset-x-[-20%] bottom-[-42%] aspect-[2/1] rounded-[50%]"
        style={{
          background: `radial-gradient(ellipse 50% 50% at 50% 0%, hsl(${hue} 80% 60% / 0.4) 0%, hsl(${hue} 70% 30% / 0) 62%)`,
          borderTop: `1px solid hsl(${hue} 80% 72% / 0.35)`,
        }}
      />
      {/* transmission grain */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.9) 0 1px, transparent 1px 3px)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to top, rgba(6,3,14,0.88) 0%, rgba(6,3,14,0.1) 46%, rgba(6,3,14,0.35) 100%)",
        }}
      />
    </div>
  );
}
