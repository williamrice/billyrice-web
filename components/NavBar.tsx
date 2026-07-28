"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const links = [
  ["Projects", "/projects"],
  ["Expertise", "/#expertise"],
  ["About", "/#about-section"],
  ["Resume", "/resume"],
  ["Writing", "/blog"],
  ["Contact", "/contact"],
] as const;

export default function NavBar({ projectsEnabled }: { projectsEnabled: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const visibleLinks = projectsEnabled
    ? links
    : links.filter(([, href]) => href !== "/projects");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all ${
        scrolled ? "border-border bg-background/88 backdrop-blur-xl" : "border-transparent bg-transparent"
      }`}
    >
      <div className="site-shell flex h-16 items-center justify-between md:h-20">
        <Link href="/" className="group flex items-center gap-3" aria-label="Billy Rice, home">
          <span className="grid size-8 place-items-center border border-primary/50 font-mono text-[10px] text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">BR</span>
          <span className="text-sm font-medium tracking-tight">Billy Rice</span>
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          {visibleLinks.map(([name, href]) => (
            <Link key={name} href={href} className="font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground hover:text-primary">
              {name}
            </Link>
          ))}
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="size-11 md:hidden" aria-label="Open navigation" aria-expanded={open}>
                <Menu className="size-5" />
              </Button>
            }
          />
          <SheetContent side="right" className="w-full border-border bg-background p-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:w-[420px] sm:p-8">
            <SheetTitle className="sr-only">Main navigation</SheetTitle>
            <div className="mt-14 flex flex-col sm:mt-16">
              {visibleLinks.map(([name, href]) => (
                <Link key={name} href={href} onClick={() => setOpen(false)} className="flex min-h-16 items-center border-t border-border py-4 text-2xl font-medium tracking-tight hover:text-primary sm:py-6 sm:text-3xl">
                  {name}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
