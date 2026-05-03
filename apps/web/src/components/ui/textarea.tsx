import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", invalid, showCount, maxLength, value, ...props }, ref) => {
    const currentLength = typeof value === "string" ? value.length : 0;
    return (
      <div className="space-y-1">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-body-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            invalid ? "border-danger" : "border-border",
            className,
          )}
          {...props}
        />
        {showCount && maxLength && (
          <div className="text-right text-caption text-muted-foreground">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export { Textarea, type TextareaProps };
