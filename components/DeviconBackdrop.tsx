"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import {
  availableDevicons,
} from "@/features/settings/types/devicons";
import { usePublicSettings } from "@/features/settings/components/PublicSettingsProvider";

type DeviconStyle = CSSProperties & {
  "--icon-delay": string;
  "--icon-duration": string;
  "--icon-opacity": number;
  "--icon-size": string;
};

export function DeviconBackdrop() {
  const backdropRef = useRef<HTMLDivElement>(null);
  const { devicons: setting } = usePublicSettings();
  const devicons = availableDevicons.filter((icon) => setting.icons.includes(icon.id));

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

  if (!setting.enabled) return null;

  return (
    <div
      className={`devicon-backdrop ${setting.motionEnabled ? "" : "devicon-backdrop-static"}`}
      aria-hidden="true"
      ref={backdropRef}
    >
      {devicons.map((devicon, index) => (
        <div
          className="devicon-backdrop-item"
          key={devicon.id}
          style={{
            "--icon-delay": `${index * -2.1}s`,
            "--icon-duration": `${17 + index % 9}s`,
            "--icon-opacity": setting.opacity,
            "--icon-size": `${setting.size}px`,
          } as DeviconStyle}
        >
          {/* Decorative technology marks; the surrounding page content names the skills. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://cdn.jsdelivr.net/gh/devicons/devicon@${setting.version}/icons/${devicon.asset}`}
            alt=""
            width="72"
            height="72"
          />
        </div>
      ))}
    </div>
  );
}
