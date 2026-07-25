import BrandIcon, { type BrandName } from "./BrandIcon";

const links: ReadonlyArray<{
  label: string;
  href: string;
  brand: BrandName;
}> = [
  { label: "GitHub", href: "https://www.github.com/williamrice", brand: "github" },
  { label: "GitLab", href: "https://www.gitlab.com/williamrice", brand: "gitlab" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/billy-rice/", brand: "linkedin" },
  { label: "X", href: "https://www.x.com/warice_dev", brand: "x" },
];

export default function SocialLinks() {
  return (
    <nav aria-label="Social links" className="flex flex-wrap justify-center gap-3">
      {links.map(({ label, href, brand }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="icon-link"
        >
          <BrandIcon brand={brand} className="size-4" />
        </a>
      ))}
    </nav>
  );
}
