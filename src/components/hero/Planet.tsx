import type { CSSProperties } from "react";

/**
 * The INNOVISION planet, translated 1:1 from Figma node 4:150.
 *
 * Every internal measurement is a fraction of the planet diameter, so the
 * whole composite scales from a single `--pd` length set by the caller. That
 * is what lets the hero, the About section and the page transitions share one
 * planet instead of three lookalikes.
 *
 *   surface   radial gradient  #1c0d50 -> #040 20e (Figma 4:150)
 *   cool spot rgba(100,160,255,.5) blurred blob    (4:156)
 *   warm spot rgba(120,50,220,.3) blurred blob     (4:157)
 *   texture   photographic map, mix-blend soft-light (4:160)
 *   rim       inset 0 0 6.67% #9046ff + inset shadow (4:154)
 */

const SURFACE =
  "radial-gradient(ellipse 93.72% 93.72% at 40% 28%, rgb(28,13,80) 0%, rgb(21,10,59) 20%, rgb(13,6,38) 40%, rgb(4,2,14) 80%)";

type PlanetProps = {
  /** Extra classes on the outer circle. */
  className?: string;
  /** Rendered above the surface, inside the clip — used for orbital content. */
  children?: React.ReactNode;
  /** Draw the three concentric orbit rings around the planet. */
  rings?: boolean;
  style?: CSSProperties;
};

export function Planet({ className = "", children, rings = false, style }: PlanetProps) {
  return (
    <div
      className={`pointer-events-none absolute left-1/2 top-1/2 h-[var(--pd)] w-[var(--pd)] -translate-x-1/2 -translate-y-1/2 ${className}`}
      style={style}
      aria-hidden
    >
      {rings ? (
        <>
          {/* Figma 4:147 / 4:148 / 4:149 — concentric at the planet centre */}
          <Ring scale={1.18} width={0.000874} color="rgba(120,60,220,0.06)" />
          <Ring scale={1.1} width={0.000815} color="rgba(120,60,220,0.1)" />
          <Ring scale={1.04} width={0.000771} color="rgba(120,60,220,0.14)" />
        </>
      ) : null}

      {/* 4:150 — planet body: surface gradient + outer atmosphere */}
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          backgroundImage: SURFACE,
          boxShadow:
            "0 0 calc(var(--pd) * 0.0889) calc(var(--pd) * 0.0222) #413159," +
            "0 0 calc(var(--pd) * 0.2222) calc(var(--pd) * 0.0667) #291e41",
        }}
      >
        {/* 4:155 — inner shell carries the violet bloom */}
        <div
          className="absolute inset-0 overflow-hidden rounded-full"
          style={{
            backgroundImage: SURFACE,
            boxShadow:
              "0 0 calc(var(--pd) * 0.0889) calc(var(--pd) * 0.0222) rgba(90,40,200,0.35)," +
              "0 0 calc(var(--pd) * 0.2222) calc(var(--pd) * 0.0667) rgba(70,30,160,0.2)",
          }}
        >
          {/* 4:156 — cool highlight, upper centre */}
          <div
            className="absolute left-[25%] top-[-5%] h-[55%] w-[50%]"
            style={{
              filter: "blur(calc(var(--pd) * 0.02))",
              backgroundImage:
                "radial-gradient(ellipse 70.71% 70.71% at 50% 50%, rgba(100,160,255,0.5) 0%, rgba(89,143,245,0.35) 22.5%, rgba(78,127,236,0.275) 33.75%, rgba(60,100,220,0.2) 45%, rgba(60,100,220,0) 70%)",
            }}
          />
          {/* 4:157 — warm violet wash, lower two thirds */}
          <div
            className="absolute left-[10%] top-[20%] h-[60%] w-[80%]"
            style={{
              filter: "blur(calc(var(--pd) * 0.0133))",
              backgroundImage:
                "radial-gradient(ellipse 70.71% 70.71% at 50% 50%, rgba(120,50,220,0.3) 0%, rgba(120,50,220,0) 65%)",
            }}
          />
          {/* 4:160 — surface map, soft-light so it reads as terrain not a photo */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/planet-texture.png"
            alt=""
            className="absolute left-1/2 top-1/2 h-[210.82%] w-[118.76%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover mix-blend-soft-light"
            draggable={false}
          />
        </div>

        {/* 4:154 — terminator + violet limb */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow:
              "inset 0 0 calc(var(--pd) * 0.0667) 0 #9046ff," +
              "inset calc(var(--pd) * -0.0333) calc(var(--pd) * -0.0333) calc(var(--pd) * 0.0889) 0 rgba(26,16,58,0.8)",
          }}
        />

        {children}
      </div>
    </div>
  );
}

function Ring({
  scale,
  width,
  color,
}: {
  scale: number;
  width: number;
  color: string;
}) {
  return (
    <div
      className="absolute left-1/2 top-1/2 rounded-full -translate-x-1/2 -translate-y-1/2"
      style={{
        width: `calc(var(--pd) * ${scale})`,
        height: `calc(var(--pd) * ${scale})`,
        border: `calc(var(--pd) * ${width}) solid ${color}`,
      }}
    />
  );
}
