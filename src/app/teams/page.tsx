import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Crew } from "@/components/teams/Crew";
import { crew, departments } from "@/data/teams";

export const metadata: Metadata = {
  title: "Teams",
  description:
    "The crew behind INNOVISION 2026 — the students who build the arenas, write the brackets and run the four days.",
};

export default function TeamsPage() {
  return (
    <>
      <PageHeader
        eyebrow="The crew"
        title="The people running the mission"
        lead="A student body of several hundred, coordinated by the core below. Every arena, bracket and bus route on this site is somebody's semester."
        meta={[
          { label: "Core crew", value: String(crew.length) },
          { label: "Departments", value: String(departments.length) },
          { label: "Volunteers", value: "400+" },
          { label: "Since", value: "2001" },
        ]}
      />
      <section className="pb-28 sm:pb-36">
        <Crew />
      </section>
    </>
  );
}
