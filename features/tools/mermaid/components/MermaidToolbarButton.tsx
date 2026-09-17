import type { ButtonHTMLAttributes, ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MermaidToolbarButton({
  label,
  children,
  className = "",
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        {...props}
        disabled={disabled}
        onClick={disabled ? undefined : props.onClick}
        render={(triggerProps) => (
          <button
            {...triggerProps}
            type="button"
            disabled={undefined}
            aria-disabled={disabled || undefined}
            tabIndex={disabled ? -1 : triggerProps.tabIndex}
            aria-label={label}
            className={`grid size-9 place-items-center border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-not-allowed aria-disabled:opacity-40 ${className}`}
          >
            {children}
          </button>
        )}
      />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
