import type { ReactNode } from "react";
import { DeviconBackdrop } from "@/components/DeviconBackdrop";
import { PageEyebrow } from "@/components/PageEyebrow";

export default function Header({
  children,
  height = "360px",
}: {
  children: ReactNode;
  height?: string;
}) {
  return (
    <section
      style={{ minHeight: height }}
      className="relative flex w-full items-center overflow-hidden border-b border-border pt-20"
    >
      <DeviconBackdrop />
      <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
      <div className="site-shell relative z-10 py-16 text-left sm:py-20">
        <PageEyebrow />
        <div className="[&_h1]:max-w-5xl [&_h1]:text-balance [&_h1]:text-[clamp(2.8rem,8vw,6rem)] [&_h1]:font-medium [&_h1]:leading-[.98] [&_h1]:tracking-[-.055em] [&_h1]:text-foreground">
          {children}
        </div>
      </div>
    </section>
  );
}
