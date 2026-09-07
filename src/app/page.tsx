import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/home/About";
import { Schedule } from "@/components/home/Schedule";
import { Sponsors } from "@/components/home/Sponsors";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Schedule />
      <Sponsors />
    </>
  );
}
