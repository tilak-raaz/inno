"use client";

import { useCallback, useState } from "react";
import { ProductArt } from "./ProductArt";
import { products } from "@/data/merch";
import { usePointerDrag } from "@/lib/usePointerDrag";
import { usePrefersReducedMotion } from "@/lib/useMediaQuery";

/**
 * MERCH — an orbital showroom.
 *
 * One product is lit and held at the centre of the stage; the rest wait in a
 * shallow arc beneath it and swing into position when selected. Everything a
 * shopper needs — price, colourway, size, stock — stays in a fixed panel that
 * never moves, so the motion is scenery, not an obstacle.
 */

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const STOCK_LABEL = {
  in: { text: "In stock", tone: "text-emerald-300/90" },
  low: { text: "Low stock", tone: "text-amber-300/90" },
  out: { text: "Sold out", tone: "text-rose-300/90" },
} as const;

export function Showroom() {
  const [active, setActive] = useState(0);
  const [colour, setColour] = useState(0);
  const [size, setSize] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  const product = products[active];

  const step = useCallback(
    (dir: 1 | -1) => setActive((i) => (i + dir + products.length) % products.length),
    [],
  );
  const { dragging, handlers } = usePointerDrag({ onStep: step, stepDistance: 150 });

  // Reset the picked colourway and size when the product changes. Done during
  // render (React's "adjusting state when a prop changes" path) rather than in
  // an effect, so the panel never paints one product's selection on another.
  const [lastActive, setLastActive] = useState(active);
  if (lastActive !== active) {
    setLastActive(active);
    setColour(0);
    setSize(null);
  }

  const stock = STOCK_LABEL[product.stock];

  return (
    <div className="mx-auto max-w-(--shell) px-(--gutter)">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-20">
        {/* ---------------- stage ---------------- */}
        <div
          {...handlers}
          tabIndex={0}
          role="group"
          aria-label="Product showcase — use arrow keys to browse"
          className={`showroom relative aspect-square w-full select-none rounded-3xl border border-[var(--line)] ${
            dragging ? "cursor-grabbing" : "cursor-grab"
          }`}
        >
          {/* key light */}
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden rounded-[inherit]"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 62% 48% at 50% 26%, rgba(124,58,237,0.3) 0%, rgba(6,3,14,0) 68%)," +
                "radial-gradient(ellipse 80% 40% at 50% 108%, rgba(167,139,250,0.22) 0%, rgba(6,3,14,0) 70%)",
            }}
          />
          {/* pedestal */}
          <div
            aria-hidden
            className="absolute left-1/2 top-[64%] h-[34%] w-[68%] -translate-x-1/2 rounded-[50%] border border-[var(--line)]"
            style={{
              background:
                "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(124,58,237,0.16) 0%, rgba(6,3,14,0) 72%)",
            }}
          />

          {/* the product, floating */}
          <div
            key={product.id}
            className="absolute inset-[10%] bottom-[24%] animate-fade-up"
          >
            <div
              className={reduced ? "" : "animate-drift [--drift-dur:9s] [--drift-y:-12px] [--spin-delta:0deg]"}
              style={{ filter: `drop-shadow(0 26px 40px rgba(0,0,0,0.6))` }}
            >
              <ProductArt product={product} colour={product.colours[colour].hex} />
            </div>
          </div>

          {product.badge ? (
            <span className="absolute left-6 top-6 rounded-full border border-[var(--line-bright)] bg-[rgba(124,58,237,0.2)] px-3.5 py-1.5 font-display text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-violet-100">
              {product.badge}
            </span>
          ) : null}

          {/* the rest of the catalogue, in a shallow arc */}
          <div className="absolute inset-x-0 bottom-5 flex items-end justify-center gap-2 px-4">
            {products.map((p, i) => {
              const d = Math.abs(i - active);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-current={i === active}
                  className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl border p-2 transition-all duration-500 sm:h-16 sm:w-16 ${
                    i === active
                      ? "border-[var(--violet-300)] bg-[rgba(124,58,237,0.2)]"
                      : "border-[var(--line)] bg-[rgba(10,5,24,0.6)] hover:border-[var(--line-bright)]"
                  }`}
                  style={{ transform: `translateY(${Math.min(d, 3) * 5}px)` }}
                >
                  <span className="sr-only">{p.name}</span>
                  <span aria-hidden className="block h-full w-full">
                    <ProductArt product={p} colour={p.colours[0].hex} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- panel ---------------- */}
        <div aria-live="polite">
          <div key={product.id} className="animate-fade-up">
            <div className="flex items-center gap-4">
              <span className="hud">
                {String(active + 1).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
              </span>
              <div className="rule flex-1" />
              <span className={`font-display text-[0.625rem] font-semibold uppercase tracking-[0.2em] ${stock.tone}`}>
                {stock.text}
              </span>
            </div>

            <h2 className="section-title mt-6">{product.name}</h2>
            <p className="mt-3 font-display text-sm font-semibold uppercase tracking-[0.16em] text-violet-200">
              {product.subtitle}
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-display text-3xl font-black text-white">
                {INR.format(product.price)}
              </span>
              {product.mrp ? (
                <span className="text-sm text-text-faint line-through">
                  {INR.format(product.mrp)}
                </span>
              ) : null}
            </div>

            <p className="body-copy mt-6 max-w-lg">{product.description}</p>

            {/* colourway */}
            <fieldset className="mt-9">
              <legend className="hud">
                Colourway — {product.colours[colour].name}
              </legend>
              <div className="mt-4 flex flex-wrap gap-3">
                {product.colours.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setColour(i)}
                    aria-pressed={i === colour}
                    className={`h-10 w-10 rounded-full border-2 transition-all duration-400 ${
                      i === colour
                        ? "border-[var(--violet-300)] shadow-[0_0_18px_-2px_rgba(167,139,250,0.8)]"
                        : "border-[var(--line)] hover:border-[var(--line-bright)]"
                    }`}
                    style={{ background: c.hex }}
                  >
                    <span className="sr-only">{c.name}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            {/* size */}
            {product.sizes ? (
              <fieldset className="mt-8">
                <legend className="hud">Size</legend>
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      aria-pressed={size === s}
                      className={`min-w-14 rounded-lg border px-4 py-2.5 font-display text-xs font-semibold tracking-[0.1em] transition-all duration-400 ${
                        size === s
                          ? "border-[var(--violet-300)] bg-[rgba(124,58,237,0.22)] text-white"
                          : "border-[var(--line)] text-text-muted hover:border-[var(--line-bright)] hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null}

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                disabled={product.stock === "out"}
                className="btn-primary px-7 py-4 text-[0.8125rem] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                {product.stock === "out" ? "Sold out" : "Add to bag"}
              </button>
              <button type="button" onClick={() => step(1)} className="btn-ghost">
                Next item
                <span aria-hidden>→</span>
              </button>
            </div>

            <p className="hud mt-6">
              Ships from campus · Collect at the merch desk during the festival
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
