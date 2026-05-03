"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

interface RadioGroupContextValue {
  name: string;
  value: string | undefined;
  onValueChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

interface RadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  name?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className = "", name, value, onValueChange, children, ...props }, ref) => {
    const generatedName = useId();
    return (
      <RadioGroupContext.Provider
        value={{
          name: name ?? generatedName,
          value,
          onValueChange: onValueChange ?? (() => {}),
        }}
      >
        <div
          ref={ref}
          role="radiogroup"
          className={cn("space-y-2", className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);

RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "name" | "value" | "onChange"> {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  trailing?: ReactNode;
}

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className = "", id, value, label, description, trailing, disabled, ...props }, ref) => {
    const ctx = useContext(RadioGroupContext);
    if (!ctx) throw new Error("RadioGroupItem must be used within RadioGroup");
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const checked = ctx.value === value;

    return (
      <label
        htmlFor={inputId}
        className={cn(
          "flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-3 transition-colors",
          checked ? "border-primary bg-primary/5" : "border-border hover:bg-secondary",
          disabled && "cursor-not-allowed opacity-50",
          className,
        )}
      >
        <span className="relative mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center">
          <input
            ref={ref}
            id={inputId}
            type="radio"
            name={ctx.name}
            value={value}
            checked={checked}
            disabled={disabled}
            onChange={() => ctx.onValueChange(value)}
            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-border bg-background checked:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed"
            {...props}
          />
          <span className="pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-primary opacity-0 peer-checked:opacity-100" />
        </span>
        <span className="flex-1 text-body-sm">
          <span className="block font-medium text-foreground">{label}</span>
          {description && (
            <span className="mt-0.5 block text-caption text-muted-foreground">
              {description}
            </span>
          )}
        </span>
        {trailing && <span className="shrink-0 text-body-sm text-foreground">{trailing}</span>}
      </label>
    );
  },
);

RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
