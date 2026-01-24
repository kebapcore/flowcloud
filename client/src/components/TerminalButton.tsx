import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface TerminalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

const TerminalButton = forwardRef<HTMLButtonElement, TerminalButtonProps>(
  ({ className, children, isLoading, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "relative inline-flex items-center justify-center h-12 px-8 py-2 w-full sm:w-auto",
          "bg-primary/10 border border-primary/50 text-primary font-mono text-sm uppercase tracking-widest font-bold",
          "hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]",
          "active:translate-y-[1px]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/10 disabled:hover:text-primary disabled:hover:shadow-none",
          "transition-all duration-200 ease-out group overflow-hidden",
          className
        )}
        {...props}
      >
        {/* Scan effect on hover */}
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]" />
        
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <span className="relative z-10 flex items-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

TerminalButton.displayName = "TerminalButton";

export { TerminalButton };
