import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { EventExplorer } from "./Event";
import { events } from "@/data/events";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Ten destinations across robotics, software, aeromodelling, management and more. Explore the INNOVISION 2026 event universe.",
};

export default function EventsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Destinations"
        title="Explore the event universe"
        lead="Every event is a world of its own — an arena, a lab, a stage. Take the controls and travel between them."
        meta={[
          { label: "Events", value: String(events.length) },
          { label: "Disciplines", value: "9" },
          { label: "Prize pool", value: "₹25L+" },
          { label: "Duration", value: "4 days" },
        ]}
      />
      <section className="pb-28 sm:pb-36">
        <EventExplorer />
      </section>
    </>
  );
}
