import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "./PortfolioMotion";

export default function CallToAction() {
  return (
    <section className="relative overflow-hidden border-t border-border py-28 sm:py-32 md:py-40">
      <div className="ambient-orb ambient-orb-two" aria-hidden="true" />
      <Reveal className="site-shell relative z-10">
        <p className="eyebrow mb-8">Build what lasts</p>
        <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
          <h2 className="max-w-4xl text-balance text-[2.65rem] font-medium leading-[1.02] tracking-[-.055em] text-foreground sm:text-5xl md:text-7xl">
            Have a consequential problem worth solving?
          </h2>
          <Link className="button-primary group w-full sm:w-auto lg:mb-2" href="/contact">
            Let&apos;s talk
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
