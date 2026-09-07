import type { Product } from "@/data/merch";

/**
 * Product silhouettes.
 *
 * Line-drawn rather than photographed: the showroom lighting is done in CSS,
 * so a garment reads correctly against any backdrop and recolours instantly
 * when the shopper picks a colourway. Swap any of these for a real product
 * render by returning an <img> from the matching branch.
 */

type Props = { product: Product; colour: string; className?: string };

const stroke = "rgba(196,181,253,0.55)";
const seam = "rgba(196,181,253,0.3)";

export function ProductArt({ product, colour, className = "" }: Props) {
  const shared = {
    viewBox: "0 0 200 200",
    className: `h-full w-full ${className}`,
    fill: "none" as const,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  const shade = (
    <defs>
      <linearGradient id={`fill-${product.id}`} x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor={colour} stopOpacity="1" />
        <stop offset="55%" stopColor={colour} stopOpacity="0.86" />
        <stop offset="100%" stopColor="#05030d" stopOpacity="0.92" />
      </linearGradient>
      <linearGradient id={`sheen-${product.id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
        <stop offset="45%" stopColor="#ffffff" stopOpacity="0.02" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </linearGradient>
    </defs>
  );
  const F = `url(#fill-${product.id})`;
  const S = `url(#sheen-${product.id})`;

  switch (product.art) {
    case "tee":
      return (
        <svg {...shared} aria-hidden>
          {shade}
          <path
            d="M72 32 L58 38 L26 56 L40 84 L56 76 L56 172 Q100 178 144 172 L144 76 L160 84 L174 56 L142 38 L128 32 Q114 46 100 46 Q86 46 72 32 Z"
            fill={F}
            stroke={stroke}
            strokeWidth="1.6"
          />
          <path
            d="M72 32 L58 38 L26 56 L40 84 L56 76 L56 172 Q100 178 144 172 L144 76 L160 84 L174 56 L142 38 L128 32 Q114 46 100 46 Q86 46 72 32 Z"
            fill={S}
          />
          <path d="M72 32 Q100 54 128 32" stroke={stroke} strokeWidth="1.6" />
          <circle cx="76" cy="70" r="9" stroke={seam} strokeWidth="1.2" />
          <path d="M76 65 L76 75 M71 70 L81 70" stroke={seam} strokeWidth="1.2" />
        </svg>
      );

    case "hoodie":
      return (
        <svg {...shared} aria-hidden>
          {shade}
          <path
            d="M70 40 L52 48 L22 68 L36 96 L52 88 L52 176 Q100 182 148 176 L148 88 L164 96 L178 68 L148 48 L130 40 Q126 66 100 66 Q74 66 70 40 Z"
            fill={F}
            stroke={stroke}
            strokeWidth="1.6"
          />
          <path
            d="M70 40 L52 48 L22 68 L36 96 L52 88 L52 176 Q100 182 148 176 L148 88 L164 96 L178 68 L148 48 L130 40 Q126 66 100 66 Q74 66 70 40 Z"
            fill={S}
          />
          {/* hood */}
          <path
            d="M70 40 Q100 20 130 40 Q126 66 100 66 Q74 66 70 40 Z"
            fill="rgba(0,0,0,0.35)"
            stroke={stroke}
            strokeWidth="1.6"
          />
          {/* drawcords + kangaroo pocket */}
          <path d="M88 62 L86 92 M112 62 L114 92" stroke={seam} strokeWidth="1.4" />
          <path d="M66 124 L134 124 L138 158 L62 158 Z" stroke={seam} strokeWidth="1.3" />
        </svg>
      );

    case "cap":
      return (
        <svg {...shared} aria-hidden>
          {shade}
          <path
            d="M42 122 Q42 56 100 56 Q158 56 158 122 Z"
            fill={F}
            stroke={stroke}
            strokeWidth="1.6"
          />
          <path d="M42 122 Q42 56 100 56 Q158 56 158 122 Z" fill={S} />
          <path
            d="M42 122 Q26 126 20 140 Q54 150 100 150 L100 122 Z"
            fill={F}
            stroke={stroke}
            strokeWidth="1.6"
          />
          <path d="M100 56 L100 122 M72 60 Q78 96 76 122 M128 60 Q122 96 124 122" stroke={seam} strokeWidth="1.2" />
          <circle cx="100" cy="58" r="4" fill={stroke} />
        </svg>
      );

    case "tote":
      return (
        <svg {...shared} aria-hidden>
          {shade}
          <path d="M46 72 L154 72 L146 176 L54 176 Z" fill={F} stroke={stroke} strokeWidth="1.6" />
          <path d="M46 72 L154 72 L146 176 L54 176 Z" fill={S} />
          <path d="M74 72 Q74 30 100 30 Q126 30 126 72" stroke={stroke} strokeWidth="3.2" />
          <circle cx="100" cy="120" r="24" stroke={seam} strokeWidth="1.3" />
          <ellipse cx="100" cy="120" rx="24" ry="9" stroke={seam} strokeWidth="1.1" />
        </svg>
      );

    case "bottle":
      return (
        <svg {...shared} aria-hidden>
          {shade}
          <path
            d="M84 46 L116 46 L116 62 Q134 72 134 96 L134 168 Q134 178 124 178 L76 178 Q66 178 66 168 L66 96 Q66 72 84 62 Z"
            fill={F}
            stroke={stroke}
            strokeWidth="1.6"
          />
          <path
            d="M84 46 L116 46 L116 62 Q134 72 134 96 L134 168 Q134 178 124 178 L76 178 Q66 178 66 168 L66 96 Q66 72 84 62 Z"
            fill={S}
          />
          <rect x="80" y="22" width="40" height="26" rx="7" fill={F} stroke={stroke} strokeWidth="1.6" />
          <path d="M66 112 L134 112 M66 132 L134 132" stroke={seam} strokeWidth="1.1" />
          <path d="M78 82 L78 164" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
        </svg>
      );

    case "poster":
    default:
      return (
        <svg {...shared} aria-hidden>
          {shade}
          <rect x="42" y="24" width="116" height="152" rx="3" fill={F} stroke={stroke} strokeWidth="1.6" />
          <rect x="42" y="24" width="116" height="152" rx="3" fill={S} />
          <circle cx="100" cy="104" r="34" fill="rgba(124,58,237,0.4)" stroke={stroke} strokeWidth="1.4" />
          <ellipse cx="100" cy="104" rx="52" ry="17" stroke={seam} strokeWidth="1.2" transform="rotate(-18 100 104)" />
          <path d="M64 156 L136 156" stroke={seam} strokeWidth="1.2" />
        </svg>
      );
  }
}
