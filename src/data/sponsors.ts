/**
 * Sponsor roster. Tiers map to orbital shells on the home page — inner shells
 * carry the largest partners.
 *
 * `logo` is intentionally absent: swap in an SVG path per sponsor and the
 * constellation will render it in place of the wordmark fallback.
 */

export type SponsorTier = {
  tier: string;
  /** Orbit radius as a fraction of the constellation's half-width. */
  shell: number;
  sponsors: { name: string; note: string; href?: string; logo?: string }[];
};

export const sponsorTiers: SponsorTier[] = [
  {
    tier: "Title Partner",
    shell: 0,
    sponsors: [{ name: "Aurora Dynamics", note: "Title partner" }],
  },
  {
    tier: "Powered By",
    shell: 0.52,
    sponsors: [
      { name: "Helix Semiconductor", note: "Silicon partner" },
      { name: "Northwind Energy", note: "Sustainability partner" },
      { name: "Vector Robotics", note: "Arena partner" },
    ],
  },
  {
    tier: "Associate Partners",
    shell: 0.82,
    sponsors: [
      { name: "Lumen Cloud", note: "Infrastructure" },
      { name: "Ferrite Labs", note: "Hardware" },
      { name: "Meridian Capital", note: "Startup Orbit" },
      { name: "Quanta Foods", note: "Hospitality" },
      { name: "Orbit Media", note: "Broadcast" },
    ],
  },
];
