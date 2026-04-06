import { forwardRef, type ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-white hover:bg-primary/90 shadow-sm",
  outline:
    "border border-border bg-transparent hover:bg-secondary text-foreground",
  ghost:
    "bg-transparent hover:bg-secondary text-foreground",
  destructive:
    "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs rounded-md",
  lg: "h-12 px-6 text-base rounded-lg",
  icon: "h-10 w-10",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, type ButtonProps };
