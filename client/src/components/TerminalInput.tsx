import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TerminalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            {label}
          </label>
        )}
        <div className="relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-primary/50 font-bold select-none">
            {">"}
          </div>
          <input
            ref={ref}
            className={cn(
              "flex h-12 w-full bg-black/40 border border-border text-foreground px-8 py-2 font-mono text-sm",
              "focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 focus:shadow-[0_0_15px_rgba(34,197,94,0.15)]",
              "placeholder:text-muted-foreground/30",
              "transition-all duration-200",
              className
            )}
            autoComplete="off"
            spellCheck={false}
            {...props}
          />
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/30 group-focus-within:border-primary transition-colors" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30 group-focus-within:border-primary transition-colors" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/30 group-focus-within:border-primary transition-colors" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/30 group-focus-within:border-primary transition-colors" />
        </div>
      </div>
    );
  }
);

TerminalInput.displayName = "TerminalInput";

export { TerminalInput };
