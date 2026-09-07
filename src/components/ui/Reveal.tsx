"use client";

import { useReveal } from "@/lib/useReveal";

/**
 * Scroll-reveal container. Any descendant marked `data-reveal` fades and
 * rises once the group enters the viewport, staggered in DOM order.
 * One observer per group; reduced-motion users get the end state immediately.
 */
export function Reveal({
  children,
  className,
  stagger,
  as: Tag = "div",
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "section" | "ul" | "ol";
} & React.HTMLAttributes<HTMLElement>) {
  const ref = useReveal<HTMLDivElement>({ stagger });
  return (
    // @ts-expect-error — polymorphic tag, ref type is compatible at runtime
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
