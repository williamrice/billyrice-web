import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import BrandIcon, { type BrandName } from "./BrandIcon";

export default function Footer() {
  return (
    <footer className="w-full shrink-0 border-t border-border bg-background">
      <div className="site-shell pb-8 pt-10 sm:pb-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[.2em] text-primary">
              Billy Rice / Software engineer
            </p>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Implementation depth. Design judgment. Leadership with context.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {(
              [
                ["GitHub", "https://github.com/williamrice", "github"],
                [
                  "LinkedIn",
                  "https://www.linkedin.com/in/billy-rice/",
                  "linkedin",
                ],
                ["Contact", "/contact", null],
                ["Privacy", "/privacy-policy", null],
              ] as const
            ).map(([name, href, brand]) => (
              <Link
                key={name}
                href={href}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
              >
                {brand && (
                  <BrandIcon
                    brand={brand satisfies BrandName}
                    className="mr-1 size-3.5"
                  />
                )}
                {name}
                <ArrowUpRight className="size-3" />
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-5 font-mono text-[9px] uppercase tracking-[.16em] text-muted-foreground min-[390px]:flex-row min-[390px]:justify-between">
          <span>© {new Date().getFullYear()} William Rice</span>
          <span>Stanton, Kentucky</span>
        </div>
      </div>
    </footer>
  );
}
