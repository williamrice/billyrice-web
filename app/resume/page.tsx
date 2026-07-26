import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import Header from "@/components/Header";
import { getPublishedResume } from "@/features/resume/queries/resume";
import { generateMetadataWithCanonical } from "@/lib/utils/metadata";
import { SITE_URL } from "@/lib/site";
import { formatDatePeriod } from "@/lib/utils/dates";

export const metadata: Metadata = generateMetadataWithCanonical(
  "/resume",
  "Experience | Billy Rice",
  "The professional experience, applied AI practice, software design work, and leadership record of Billy Rice.",
);

export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const resume = await getPublishedResume();

  if (!resume) {
    return (
      <>
        <Header><h1>Experience, currently being rewritten.</h1></Header>
        <section className="section-block"><div className="site-shell"><p className="max-w-xl text-lg leading-8 text-muted-foreground">The new professional narrative is not published yet. In the meantime, start with the work or get in touch.</p><div className="mt-8 flex gap-3"><Link className="button-primary" href="/projects">View projects</Link><Link className="button-quiet" href="/contact">Contact</Link></div></div></section>
      </>
    );
  }

  const skillGroups = Map.groupBy(resume.skills, (skill) => skill.category);
  const organizationGroups = Map.groupBy(resume.positions, (position) => position.organization.id);
  const profileSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: resume.name,
      jobTitle: resume.headline,
      description: resume.introduction,
      url: `${SITE_URL}/resume`,
      address: {
        "@type": "PostalAddress",
        addressLocality: resume.location,
      },
      knowsAbout: resume.skills.map((skill) => skill.name),
    },
  };

  return (
    <>
      <Script id="resume-profile-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(profileSchema).replaceAll("<", "\\u003c") }} />
      <Header>
        <h1>{resume.headline}</h1>
      </Header>

      <article>
        <section className="section-block border-b border-border">
          <div className="site-shell grid gap-12 lg:grid-cols-[.65fr_1.35fr] lg:gap-24">
            <div>
              <p className="eyebrow mb-7">Professional profile</p>
              <h2 className="text-3xl font-medium tracking-[-.04em]">{resume.name}</h2>
              <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><MapPin className="size-4 text-primary" /> {resume.location}</p>
                {resume.email && <a href={`mailto:${resume.email}`} className="flex items-center gap-2 hover:text-primary"><Mail className="size-4 text-primary" /> {resume.email}</a>}
              </div>
              {resume.availability && <p className="mt-8 border-l border-primary pl-4 text-sm leading-6 text-muted-foreground">{resume.availability}</p>}
            </div>
            <p className="max-w-4xl text-balance text-2xl leading-[1.45] tracking-[-.025em] text-foreground sm:text-3xl">
              {resume.introduction}
            </p>
          </div>
        </section>

        <section className="section-block" id="experience">
          <div className="site-shell">
            <div className="section-heading"><p className="eyebrow mb-7">Experience</p><h2>A record of building and leading.</h2></div>
            <div className="mt-16 border-t border-border">
              {[...organizationGroups.values()].map((positions, index) => {
                const organization = positions[0].organization;
                return (
                  <section key={organization.id} className="grid gap-7 border-b border-border py-12 md:grid-cols-[4rem_.75fr_1.25fr] md:gap-12 md:py-16">
                    <span className="font-mono text-xs text-primary">{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="text-2xl font-medium tracking-[-.03em]">{organization.name}</h3>
                      {organization.location && <p className="mt-2 text-muted-foreground">{organization.location}</p>}
                    </div>
                    <div className="space-y-10">
                      {positions.map((position) => (
                        <section key={position.id}>
                          <p className="font-mono text-[10px] uppercase tracking-[.16em] text-primary">{position.kind}</p>
                          <h4 className="mt-3 text-xl font-medium tracking-[-.02em]">{position.title}</h4>
                          <p className="mt-2 font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">{formatDatePeriod(position.startDate, position.endDate)}</p>
                          <p className="mt-5 text-lg leading-8 text-muted-foreground">{position.summary}</p>
                          {position.accomplishments.length > 0 && (
                            <ul className="mt-7 space-y-4">
                              {position.accomplishments.map((item) => <li key={item.id} className="grid grid-cols-[1rem_1fr] gap-3 leading-7 text-foreground"><span className="mt-3 size-1 bg-primary" />{item.statement}</li>)}
                            </ul>
                          )}
                        </section>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </section>

        {resume.skills.length > 0 && (
          <section className="section-block border-y border-border bg-card/30">
            <div className="site-shell">
              <div className="section-heading"><p className="eyebrow mb-7">Capabilities</p><h2>Depth across the system.</h2></div>
              <div className="mt-16 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {[...skillGroups.entries()].map(([category, skills]) => (
                  <section key={category} className="bg-background p-7 sm:p-9">
                    <h3 className="font-mono text-xs uppercase tracking-[.17em] text-primary">{category}</h3>
                    <ul className="mt-8 space-y-5">{skills.map((skill) => <li key={skill.id}><p className="font-medium">{skill.name}</p>{skill.summary && <p className="mt-1 text-sm leading-6 text-muted-foreground">{skill.summary}</p>}</li>)}</ul>
                  </section>
                ))}
              </div>
            </div>
          </section>
        )}

        {resume.projects.length > 0 && (
          <section className="section-block">
            <div className="site-shell">
              <div className="section-heading"><p className="eyebrow mb-7">Selected implementation</p><h2>Systems in practice.</h2></div>
              <div className="mt-16 grid gap-4 md:grid-cols-2">
                {resume.projects.map(({ project, note }) => (
                  <Link href={`/projects/${project.id}`} key={project.id} className="group border border-border bg-card/40 p-7 hover:border-primary/50">
                    <div className="flex items-start justify-between gap-5"><h3 className="text-2xl font-medium tracking-tight">{project.title}</h3><ArrowUpRight className="size-5 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
                    <p className="mt-5 line-clamp-3 leading-7 text-muted-foreground">{note || project.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section-block border-t border-border">
          <div className="site-shell grid gap-14 md:grid-cols-2">
            <div><p className="eyebrow mb-8">Education</p><div className="space-y-8">{resume.education.map((item) => <div key={item.id}><h3 className="text-lg font-medium">{item.credential} · {item.field}</h3><p className="mt-2 text-muted-foreground">{item.institution}{item.completedAt ? ` · ${item.completedAt.getUTCFullYear()}` : ""}</p></div>)}</div></div>
            <div><p className="eyebrow mb-8">Credentials</p><div className="space-y-5">{resume.credentials.map((item) => <div key={item.id} className="flex items-start justify-between gap-5 border-b border-border pb-5"><div><h3 className="font-medium">{item.name}</h3><p className="mt-1 text-sm text-muted-foreground">{item.issuer}</p></div>{item.url && <a href={item.url} target="_blank" rel="noreferrer" aria-label={`Verify ${item.name}`}><ArrowUpRight className="size-4 text-primary" /></a>}</div>)}</div></div>
          </div>
        </section>
      </article>
    </>
  );
}
