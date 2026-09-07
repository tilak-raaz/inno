import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { RegistrationConsole } from "@/components/register/Console";

export const metadata: Metadata = {
  title: "Register",
  description:
    "Register for INNOVISION 2026 — four steps to get you on the manifest for the 26th edition.",
};

export default function RegisterPage() {
  return (
    <>
      <PageHeader
        eyebrow="Begin your mission"
        title="Get on the manifest"
        lead="Four short steps. Pick your events, tell us when you arrive, and we will hold your place."
        meta={[
          { label: "Registration", value: "Open" },
          { label: "Closes", value: "28 Oct 2026" },
          { label: "Entry", value: "Free" },
          { label: "Accommodation", value: "On request" },
        ]}
      />
      <section className="pb-28 sm:pb-36">
        <RegistrationConsole />
      </section>
    </>
  );
}
