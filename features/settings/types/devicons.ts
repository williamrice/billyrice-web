export const availableDevicons = [
  { id: "typescript", label: "TypeScript", asset: "typescript/typescript-original.svg" },
  { id: "javascript", label: "JavaScript", asset: "javascript/javascript-original.svg" },
  { id: "react", label: "React", asset: "react/react-original.svg" },
  { id: "nextjs", label: "Next.js", asset: "nextjs/nextjs-original.svg" },
  { id: "nodejs", label: "Node.js", asset: "nodejs/nodejs-original.svg" },
  { id: "csharp", label: "C Sharp", asset: "csharp/csharp-original.svg" },
  { id: "dotnetcore", label: ".NET Core", asset: "dotnetcore/dotnetcore-original.svg" },
  { id: "php", label: "PHP", asset: "php/php-original.svg" },
  { id: "wordpress", label: "WordPress", asset: "wordpress/wordpress-plain.svg" },
  { id: "mysql", label: "MySQL", asset: "mysql/mysql-original.svg" },
  { id: "postgresql", label: "PostgreSQL", asset: "postgresql/postgresql-original.svg" },
  { id: "prisma", label: "Prisma", asset: "prisma/prisma-original.svg" },
  { id: "tailwindcss", label: "Tailwind CSS", asset: "tailwindcss/tailwindcss-original.svg" },
  { id: "html5", label: "HTML5", asset: "html5/html5-original.svg" },
  { id: "css3", label: "CSS3", asset: "css3/css3-original.svg" },
  { id: "docker", label: "Docker", asset: "docker/docker-original.svg" },
  { id: "amazonwebservices", label: "AWS", asset: "amazonwebservices/amazonwebservices-plain-wordmark.svg" },
] as const;

export type DeviconId = (typeof availableDevicons)[number]["id"];

export type DeviconSetting = {
  enabled: boolean;
  version: string;
  icons: DeviconId[];
  opacity: number;
  size: number;
  motionEnabled: boolean;
};
