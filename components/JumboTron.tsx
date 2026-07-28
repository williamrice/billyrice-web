import Image from 'next/image';
import Link from 'next/link';
import { ArrowDownRight, ArrowUpRight, Braces } from 'lucide-react';
import { Reveal, SystemPortrait } from './PortfolioMotion';
import BrandIcon from './BrandIcon';
import { DeviconBackdrop } from './DeviconBackdrop';
import { getProjectsSetting } from '@/features/settings/queries/settings';

const pillars = [
  'Production engineering',
  'Software architecture',
  'Technical leadership',
];

export default async function JumboTron() {
  const projectsSetting = await getProjectsSetting();

  return (
    <section className="relative flex w-full items-center overflow-hidden border-b border-border pt-16 lg:min-h-[94svh] lg:pt-24">
      <DeviconBackdrop />
      <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
      <div className="site-shell relative z-10 grid items-center gap-16 py-16 sm:py-20 lg:grid-cols-[1.12fr_.88fr] lg:gap-14 lg:py-24">
        <div className="text-left">
          <Reveal>
            <p className="eyebrow mb-8">
              <span className="status-dot" />
              Software engineer · architect · leader
            </p>
            <h1 className="display-title max-w-5xl">
              <span className="block whitespace-nowrap">I write code.</span>
              <span className="block whitespace-nowrap">I shape systems.</span>
              <span className="block whitespace-nowrap text-primary">
                I lead teams.
              </span>
            </h1>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mt-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8 md:text-xl">
              A hands-on software engineer and technical leader focused on
              dependable implementation, thoughtful architecture, and practical
              AI.
            </p>
          </Reveal>
          <Reveal delay={0.14} className="pillar-list mt-10">
            {pillars.map((pillar, index) => (
              <span className="signal-chip" key={pillar}>
                <span className="pillar-number">0{index + 1}</span>
                <span className="pillar-label">{pillar}</span>
                <span className="pillar-mark" aria-hidden="true" />
              </span>
            ))}
          </Reveal>
          <Reveal
            delay={0.2}
            className="mt-10 grid grid-cols-1 gap-4 min-[430px]:grid-cols-2 sm:flex sm:flex-wrap sm:items-center"
          >
            <Link
              className="button-primary group w-full sm:w-auto"
              href="/resume"
            >
              Resume
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <Link className="button-quiet w-full sm:w-auto" href="/contact">
              Start a conversation
            </Link>
          </Reveal>
        </div>

        <SystemPortrait>
          <div className="relative mx-auto w-[calc(100%-1rem)] max-w-[520px] sm:w-full">
            <div className="system-shadow" aria-hidden="true" />
            <div className="system-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-3 sm:px-5 sm:py-4">
                <span className="truncate font-mono text-[9px] uppercase tracking-[.16em] text-muted-foreground sm:text-[11px] sm:tracking-[.2em]">
                  Home / Billy Rice
                </span>
                <span className="flex shrink-0 items-center gap-2 font-mono text-[9px] uppercase text-primary sm:text-[10px]">
                  <span className="status-dot" /> Available
                </span>
              </div>
              <div className="relative aspect-[4/4.6] overflow-hidden">
                <Image
                  src="/images/william_headshot_500x500.jpg"
                  alt="Billy Rice"
                  fill
                  priority
                  sizes="(max-width: 1024px) 85vw, 42vw"
                  className="object-cover grayscale-[35%] contrast-[1.04]"
                />
                <div className="portrait-wash" aria-hidden="true" />
                <div className="absolute inset-x-3 bottom-3 grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-white/10 bg-black/30 backdrop-blur-md sm:inset-x-5 sm:bottom-5">
                  {['Build', 'Design', 'Lead'].map((label) => (
                    <div
                      className="px-1 py-2.5 text-center font-mono text-[9px] uppercase tracking-[.12em] text-white/75 sm:px-3 sm:py-3 sm:text-[10px] sm:tracking-[.18em]"
                      key={label}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="system-code" aria-hidden="true">
              <Braces className="size-4" />
              <span>clarity → leverage</span>
            </div>
          </div>
        </SystemPortrait>

        <div className="flex items-center justify-between border-t border-border pt-7 lg:col-span-2">
          <div className="flex gap-3">
            <a
              className="icon-link"
              href="https://github.com/williamrice"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
            >
              <BrandIcon brand="github" className="size-4" />
            </a>
            <a
              className="icon-link"
              href="https://www.linkedin.com/in/billy-rice/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <BrandIcon brand="linkedin" className="size-4" />
            </a>
          </div>
          <a
            className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground hover:text-foreground sm:text-[10px] sm:tracking-[.2em]"
            href="#expertise"
          >
            <span className="hidden min-[390px]:inline">Scroll to examine</span>
            <span className="min-[390px]:hidden">Explore</span>
            <ArrowDownRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
