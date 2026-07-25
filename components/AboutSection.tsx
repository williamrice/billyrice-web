import Link from "next/link";
import { ArrowUpRight, Landmark, ShieldCheck, Waypoints } from "lucide-react";
import { Reveal } from "./PortfolioMotion";

const principles = [
  { icon: ShieldCheck, title: "Own the outcome", text: "Responsibility does not stop at the edge of a ticket." },
  { icon: Waypoints, title: "Make context travel", text: "Good decisions compound when their reasoning is shared." },
  { icon: Landmark, title: "Serve the whole", text: "Leadership means balancing urgency with long-term trust." },
];

export default function AboutSection() {
  return (
    <section className="section-block border-y border-border bg-card/30" id="about-section">
      <div className="site-shell grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:gap-24">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow mb-8">Leadership, earned in context</p>
          <p className="max-w-md text-balance text-3xl font-medium leading-tight tracking-[-.035em] text-foreground sm:text-4xl">
            Judgment is built by being accountable for real outcomes.
          </p>
          <div className="mt-10 h-px w-full bg-border">
            <div className="h-px w-24 bg-primary" />
          </div>
        </Reveal>
        <div>
          <Reveal>
            <h2 className="text-balance text-[2.25rem] font-medium leading-[1.06] tracking-[-.04em] text-foreground sm:text-4xl md:text-6xl">
              A technical career shaped by public service.
            </h2>
            <div className="mt-9 space-y-7 text-base leading-7 text-muted-foreground sm:space-y-6 sm:text-lg sm:leading-8">
              <p>
                Before software became my full-time work, I spent more than a
                decade in law enforcement. Today, I also serve my community as
                an elected city council member.
              </p>
              <p>
                Those experiences sharpened the same instincts I bring to
                engineering: remain calm inside complexity, listen before
                deciding, communicate plainly, and take responsibility for what
                happens after a decision ships.
              </p>
            </div>
          </Reveal>
          <div className="mt-14">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <Reveal key={principle.title} delay={index * 0.06}>
                  <div className="grid grid-cols-[auto_1fr] gap-6 border-t border-border py-8">
                    <Icon className="mt-1 size-5 text-primary" strokeWidth={1.5} />
                    <div>
                      <h3 className="text-lg font-medium text-foreground">{principle.title}</h3>
                      <p className="mt-1 text-muted-foreground">{principle.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Link href="/resume" className="text-link group mt-7 inline-flex">
            Read the full career story
            <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
