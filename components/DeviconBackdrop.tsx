"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";

const devicons = [
  { name: "TypeScript", icon: "typescript/typescript-original.svg", duration: "17s" },
  { name: "React", icon: "react/react-original.svg", duration: "20s" },
  { name: "Next.js", icon: "nextjs/nextjs-original.svg", duration: "23s" },
  { name: "Node.js", icon: "nodejs/nodejs-original.svg", duration: "19s" },
  { name: "C Sharp", icon: "csharp/csharp-original.svg", duration: "25s" },
  { name: ".NET Core", icon: "dotnetcore/dotnetcore-original.svg", duration: "21s" },
  { name: "PHP", icon: "php/php-original.svg", duration: "24s" },
  { name: "WordPress", icon: "wordpress/wordpress-plain.svg", duration: "18s" },
  { name: "MySQL", icon: "mysql/mysql-original.svg", duration: "22s" },
  { name: "PostgreSQL", icon: "postgresql/postgresql-original.svg", duration: "26s" },
  { name: "Tailwind CSS", icon: "tailwindcss/tailwindcss-original.svg", duration: "20s" },
  { name: "HTML5", icon: "html5/html5-original.svg", duration: "23s" },
] as const;

type DeviconStyle = CSSProperties & {
  "--icon-delay": string;
  "--icon-duration": string;
};

export function DeviconBackdrop() {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const items = backdropRef.current?.querySelectorAll<HTMLElement>(".devicon-backdrop-item");
    if (!items) return;

    const slots = Array.from({ length: items.length }, (_, index) => index);
    slots.sort(() => Math.random() - 0.5);

    items.forEach((item, index) => {
      const slot = slots[index];
      const column = slot % 4;
      const row = Math.floor(slot / 4);
      item.style.left = `${2 + column * 25 + Math.random() * 13}%`;
      item.style.top = `${4 + row * 31 + Math.random() * 15}%`;
      item.style.animationDelay = `${Math.random() * -24}s`;
    });
  }, []);

  return (
    <div className="devicon-backdrop" aria-hidden="true" ref={backdropRef}>
      {devicons.map((devicon, index) => (
        <div
          className="devicon-backdrop-item"
          key={devicon.name}
          style={{
            "--icon-delay": `${index * -2.1}s`,
            "--icon-duration": devicon.duration,
          } as DeviconStyle}
        >
          {/* Decorative technology marks; the surrounding page content names the skills. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://cdn.jsdelivr.net/gh/devicons/devicon@v2.17.0/icons/${devicon.icon}`}
            alt=""
            width="72"
            height="72"
          />
        </div>
      ))}
    </div>
  );
}
