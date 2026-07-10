import { useId, type ComponentProps, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Field — the tokenized form-field atom: a label (fluid `.type-label` type token),
// an optional help line, the control (shadcn Input), and an optional error line,
// with the a11y wiring done once — htmlFor/id, aria-invalid, aria-describedby, and
// role="alert" on the error. States: default · focus (ring-ring) · error
// (border-destructive + ring-destructive) · disabled. Tokens + type scale only, no
// raw color, no new lib. Multi-field form LAYOUT is the later form pattern; this is
// one field. Forwards every native input prop through to the control.
type FieldProps = Omit<ComponentProps<"input">, "id"> & {
  label: ReactNode;
  help?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  id?: string;
  fieldClassName?: string;
};

export function Field({
  label,
  help,
  error,
  required = false,
  id,
  fieldClassName,
  className,
  disabled,
  ...inputProps
}: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const helpId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;
  const invalid = error != null && error !== "";
  const describedBy =
    [help ? helpId : null, invalid ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className={cn("w-full", fieldClassName)}>
      <label
        htmlFor={fieldId}
        className={cn("type-label mb-1.5 block text-foreground", disabled && "opacity-70")}
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {help && !invalid ? (
        <p id={helpId} className="mb-1.5 text-xs text-muted-foreground">
          {help}
        </p>
      ) : null}
      <Input
        id={fieldId}
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        disabled={disabled}
        className={cn(
          invalid && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...inputProps}
      />
      {invalid ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
