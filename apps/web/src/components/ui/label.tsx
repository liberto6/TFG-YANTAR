import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "block text-body-sm font-medium text-foreground",
        props["aria-disabled"] && "opacity-60",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="ml-0.5 text-danger" aria-hidden="true">*</span>}
    </label>
  ),
);

Label.displayName = "Label";

export { Label, type LabelProps };
