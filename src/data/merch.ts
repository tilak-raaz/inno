/** Merchandise catalogue for the orbital showroom. */

export type Product = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  mrp?: number;
  /** Which silhouette ProductArt renders. */
  art: "tee" | "hoodie" | "cap" | "tote" | "bottle" | "poster";
  hue: number;
  sizes?: string[];
  colours: { name: string; hex: string }[];
  badge?: string;
  stock: "in" | "low" | "out";
};

export const products: Product[] = [
  {
    id: "orbit-hoodie",
    name: "Orbit Hoodie",
    subtitle: "Heavyweight 380 GSM fleece",
    description:
      "Brushed-back fleece in deep space black with the INNOVISION limb print across the shoulders. Ribbed cuffs, kangaroo pocket, unisex boxy fit.",
    price: 1499,
    mrp: 1899,
    art: "hoodie",
    hue: 265,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colours: [
      { name: "Void Black", hex: "#0b0714" },
      { name: "Nebula Violet", hex: "#4c1d95" },
    ],
    badge: "Bestseller",
    stock: "in",
  },
  {
    id: "mission-tee",
    name: "Mission Tee",
    subtitle: "240 GSM combed cotton",
    description:
      "The crew tee. Front-left mission patch, full transmission grid printed across the back in reflective violet ink.",
    price: 699,
    mrp: 899,
    art: "tee",
    hue: 250,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colours: [
      { name: "Void Black", hex: "#0b0714" },
      { name: "Lunar Grey", hex: "#3a3550" },
      { name: "Ion White", hex: "#e8e4f5" },
    ],
    stock: "in",
  },
  {
    id: "flight-cap",
    name: "Flight Cap",
    subtitle: "Structured six-panel",
    description:
      "Cotton twill with an embroidered orbit mark and a metal closure. Pre-curved brim, internal sweatband.",
    price: 549,
    art: "cap",
    hue: 280,
    colours: [
      { name: "Void Black", hex: "#0b0714" },
      { name: "Deep Indigo", hex: "#1e1b4b" },
    ],
    stock: "low",
  },
  {
    id: "archive-tote",
    name: "Archive Tote",
    subtitle: "16 oz canvas, gusseted",
    description:
      "Built to survive four days of campus. Screen-printed star chart on natural canvas with reinforced webbing handles.",
    price: 449,
    art: "tote",
    hue: 235,
    colours: [
      { name: "Raw Canvas", hex: "#d9d2c5" },
      { name: "Void Black", hex: "#0b0714" },
    ],
    stock: "in",
  },
  {
    id: "cryo-bottle",
    name: "Cryo Bottle",
    subtitle: "750 ml vacuum steel",
    description:
      "Double-walled stainless steel, laser-etched mission markings. Twelve hours hot, twenty-four cold.",
    price: 899,
    mrp: 1099,
    art: "bottle",
    hue: 210,
    colours: [
      { name: "Matte Black", hex: "#12101c" },
      { name: "Brushed Steel", hex: "#8b8aa0" },
    ],
    badge: "New",
    stock: "in",
  },
  {
    id: "limb-poster",
    name: "Limb Print",
    subtitle: "A2 giclée, 300 GSM",
    description:
      "The hero frame, printed archival on matte cotton rag. Numbered edition of 200, shipped rolled in a rigid tube.",
    price: 399,
    art: "poster",
    hue: 292,
    colours: [{ name: "Edition Print", hex: "#2a1b52" }],
    badge: "Limited 200",
    stock: "low",
  },
];
