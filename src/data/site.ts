/**
 * Single source of truth for identity, navigation and contact details.
 * Presentation never hard-codes these — swap the values here and every page
 * follows.
 */

export const site = {
  name: "INNOVISION",
  year: "2026",
  tagline: "Precision. Speed. Intelligence.",
  host: "NIT Rourkela",
  edition: "The 26th Edition",
  dates: "6 – 9 November 2026",
  location: "NIT Rourkela, Odisha, India",
  description:
    "INNOVISION 2026 is a four-day techno-management festival — a journey through a universe of technology, creativity and innovation.",
} as const;

export type NavLink = {
  href: string;
  label: string;
  /** Shown in the nav's hover readout — the "destination" of each route. */
  sub: string;
};

export const navLinks: NavLink[] = [
  { href: "/", label: "Home", sub: "Enter the universe" },
  { href: "/events", label: "Events", sub: "Explore destinations" },
  { href: "/merch", label: "Merch", sub: "Orbital showroom" },
  { href: "/gallery", label: "Gallery", sub: "Mission archives" },
  { href: "/teams", label: "Teams", sub: "The crew" },
];

export const registerLink = {
  href: "/register",
  label: "Register",
  sub: "Begin your mission",
};

export const socials = [
  { label: "Instagram", href: "https://instagram.com/innovision.nitrkl", handle: "@innovision.nitrkl" },
  { label: "LinkedIn", href: "https://linkedin.com/company/innovision-nitrkl", handle: "/innovision-nitrkl" },
  { label: "YouTube", href: "https://youtube.com/@innovisionnitrkl", handle: "@innovisionnitrkl" },
  { label: "X", href: "https://x.com/innovision_nitr", handle: "@innovision_nitr" },
];

export const contacts = [
  { role: "General enquiries", name: "Mission Control", value: "hello@innovision.org.in", href: "mailto:hello@innovision.org.in" },
  { role: "Sponsorship", name: "Partnerships Desk", value: "sponsor@innovision.org.in", href: "mailto:sponsor@innovision.org.in" },
  { role: "Participation", name: "Flight Operations", value: "+91 98765 43210", href: "tel:+919876543210" },
];

export const footerLinks = [
  {
    title: "Navigate",
    links: [
      { label: "Home", href: "/" },
      { label: "Events", href: "/events" },
      { label: "Merch", href: "/merch" },
      { label: "Gallery", href: "/gallery" },
      { label: "Teams", href: "/teams" },
    ],
  },
  {
    title: "Participate",
    links: [
      { label: "Register", href: "/register" },
      { label: "Event rulebook", href: "/events" },
      { label: "Campus ambassador", href: "/register" },
      { label: "Accommodation", href: "/register" },
      { label: "Travel & arrival", href: "/register" },
    ],
  },
  {
    title: "Information",
    links: [
      { label: "About INNOVISION", href: "/#about" },
      { label: "Schedule", href: "/#schedule" },
      { label: "Sponsors", href: "/#sponsors" },
      { label: "Code of conduct", href: "/#about" },
      { label: "Press kit", href: "/gallery" },
    ],
  },
];
