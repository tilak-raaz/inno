import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Archive } from "@/components/gallery/Archive";
import { captures } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Mission archives — transmissions and stills from previous editions of INNOVISION.",
};

export default function GalleryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Mission archives"
        title="Transmissions from previous editions"
        lead="Three years of arenas, all-nighters and closing nights, pulled from the archive and put back on the reel."
        meta={[
          { label: "Frames", value: String(captures.length) },
          { label: "Editions", value: "2023 – 2025" },
          { label: "Format", value: "Archive reel" },
          { label: "Rights", value: "INNOVISION" },
        ]}
      />
      <section className="pb-28 sm:pb-36">
        <Archive />
      </section>
    </>
  );
}
