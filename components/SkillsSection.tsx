import { Blocks, GitPullRequestArrow, UsersRound } from "lucide-react";
import CodeMark from "./CodeMark";
import { Reveal } from "./PortfolioMotion";

const expertise = [
  {
    icon: GitPullRequestArrow,
    title: "Implementation",
    lead: "The last mile matters.",
    body: "I move comfortably from an ambiguous requirement to tested, observable production code—without losing sight of performance, accessibility, or the people maintaining it next.",
    detail: "TypeScript · React · Next.js · Node · .NET · SQL",
  },
  {
    icon: Blocks,
    title: "Software design",
    lead: "Simple where it can be. Rigorous where it must be.",
    body: "I shape boundaries, data models, and interfaces around real constraints. The goal is not clever architecture; it is a system that stays understandable as the product and team evolve.",
    detail: "Architecture · APIs · Data · Security · Reliability",
  },
  {
    icon: UsersRound,
    title: "Leadership",
    lead: "Clarity creates momentum.",
    body: "I make decisions legible, surface risk early, mentor with context, and build alignment across technical and non-technical groups. Teams do their best work when trust is part of the system.",
    detail: "Direction · Mentorship · Communication · Delivery",
  },
];

export default function SkillsSection() {
  return (
    <section className="section-block" id="expertise">
      <div className="site-shell">
        <Reveal className="section-heading">
          <p className="eyebrow">Three dimensions of the work</p>
          <h2>Expertise is more than a stack.</h2>
          <p>
            Strong software comes from the code, the decisions behind it, and
            the environment in which people build it.
          </p>
        </Reveal>
        <div className="mt-16 border-t border-border">
          {expertise.map((item, index) => {
            const Icon = item.icon;
            return (
              <Reveal key={item.title} delay={index * 0.06}>
                <article className="expertise-row group">
                  <CodeMark />
                  <div>
                    <Icon className="mb-6 size-7 text-primary" strokeWidth={1.5} />
                    <h3>{item.title}</h3>
                  </div>
                  <div>
                    <p className="mb-3 text-lg font-medium text-foreground">{item.lead}</p>
                    <p className="leading-7 text-muted-foreground">{item.body}</p>
                    <p className="mt-5 font-mono text-[10px] uppercase tracking-[.16em] text-primary/80">{item.detail}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
