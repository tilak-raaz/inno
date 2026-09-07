import type { Metadata } from "next";
import { RequireSignIn } from "@/components/auth/RequireSignIn";
import { PageHeader } from "@/components/ui/PageHeader";
import { Showroom } from "@/components/merch/Showroom";
import { products } from "@/data/merch";

export const metadata: Metadata = {
  title: "Merch",
  description:
    "Official INNOVISION 2026 merchandise — hoodies, tees, caps and archive prints from the orbital showroom.",
};

/* Reads the session, so it cannot be statically rendered. */
export const dynamic = "force-dynamic";

export default async function MerchPage() {
  return (
    <RequireSignIn
      title="Sign in to enter the showroom"
      lead="Merch is reserved for INNOVISION accounts. Sign in to browse and order."
      callbackURL="/merch"
    >
      <PageHeader
        eyebrow="Orbital showroom"
        title="Wear the mission"
        lead="Six pieces, printed in small runs for the 26th edition. Order online or collect from the merch desk on campus."
        meta={[
          { label: "Pieces", value: String(products.length) },
          { label: "From", value: "₹399" },
          { label: "Printing", value: "Small run" },
          { label: "Collection", value: "On campus" },
        ]}
      />
      <section className="pb-28 sm:pb-36">
        <Showroom />
      </section>
    </RequireSignIn>
  );
}
