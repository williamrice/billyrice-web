import { CodeXml } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeMarkProps {
  className?: string;
}

export default function CodeMark({ className = "" }: CodeMarkProps) {
  return (
    <CodeXml
      aria-hidden="true"
      className={cn("size-5 text-primary", className)}
      strokeWidth={1.5}
    />
  );
}
