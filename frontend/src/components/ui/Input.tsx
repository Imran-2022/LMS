/**
 * Form controls.
 *
 * Each control pairs a label, the input, an optional hint and an error slot, because
 * a bare `<input>` plus a separately-positioned `<label>` is how forms end up with
 * labels that are not actually associated with their field. Passing `label` here
 * generates the `id`/`htmlFor` link, so clicking the label focuses the input and a
 * screen reader announces it — for free, at every call site.
 *
 * All of these are uncontrolled (`defaultValue`, not `value`). The forms in this app
 * submit to Server Actions via `FormData`, so React does not need to hold the value
 * in state — which keeps most forms in Server Components with no `"use client"`.
 */
import type { ComponentProps, ReactNode } from "react";

import { cx } from "@/lib/format";

const CONTROL =
  "w-full rounded border bg-white px-3.5 py-2.5 text-sm text-ink-800 transition-colors " +
  "placeholder:text-ink-400 focus:outline-none disabled:bg-ink-50 disabled:text-ink-500";

const OK = "border-ink-200 focus:border-brand-500";
const BAD = "border-danger-500/60 focus:border-danger-500";

function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("w-full", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-semibold text-ink-700">
          {label}
          {required ? <span className="ml-0.5 text-danger-500">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="mt-1.5 text-[12px] font-medium text-danger-600">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-ink-400">{hint}</p>
      ) : null}
    </div>
  );
}

type FieldExtras = {
  label?: string;
  hint?: ReactNode;
  error?: string | null;
  wrapperClassName?: string;
  suffix?: ReactNode;
};

export function Input({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  id,
  name,
  suffix,
  ...rest
}: FieldExtras & ComponentProps<"input">) {
  const fieldId = id ?? name;
  return (
    <Field
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={rest.required}
      className={wrapperClassName}
    >
      <div className="relative">
        <input
          id={fieldId}
          name={name}
          className={cx(CONTROL, suffix ? "pr-11" : undefined, error ? BAD : OK, className)}
          aria-invalid={error ? true : undefined}
          {...rest}
        />
        {suffix ? <div className="absolute inset-y-0 right-0 flex items-center pr-2">{suffix}</div> : null}
      </div>
    </Field>
  );
}

export function Textarea({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  id,
  name,
  rows = 5,
  ...rest
}: FieldExtras & ComponentProps<"textarea">) {
  const fieldId = id ?? name;
  return (
    <Field
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={rest.required}
      className={wrapperClassName}
    >
      <textarea
        id={fieldId}
        name={name}
        rows={rows}
        className={cx(CONTROL, "resize-y leading-relaxed", error ? BAD : OK, className)}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
    </Field>
  );
}

export function Select({
  label,
  hint,
  error,
  wrapperClassName,
  className,
  id,
  name,
  children,
  ...rest
}: FieldExtras & ComponentProps<"select">) {
  const fieldId = id ?? name;
  return (
    <Field
      label={label}
      htmlFor={fieldId}
      hint={hint}
      error={error}
      required={rest.required}
      className={wrapperClassName}
    >
      <select
        id={fieldId}
        name={name}
        className={cx(CONTROL, "cursor-pointer pr-9", error ? BAD : OK, className)}
        {...rest}
      >
        {children}
      </select>
    </Field>
  );
}

/** A styled checkbox row, for things like "publish immediately". */
export function Checkbox({
  label,
  hint,
  className,
  id,
  name,
  ...rest
}: { label: string; hint?: string } & ComponentProps<"input">) {
  const fieldId = id ?? name;
  return (
    <label
      htmlFor={fieldId}
      className={cx(
        "flex cursor-pointer items-start gap-3 rounded border border-ink-200 bg-white p-3.5 transition-colors hover:bg-brand-50/40",
        className,
      )}
    >
      <input
        id={fieldId}
        name={name}
        type="checkbox"
        className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-500"
        {...rest}
      />
      <span>
        <span className="block text-[13.5px] font-semibold text-ink-800">{label}</span>
        {hint ? <span className="mt-0.5 block text-[12px] text-ink-500">{hint}</span> : null}
      </span>
    </label>
  );
}

/**
 * The red box above a form after a failed submit.
 *
 * Errors surface in one predictable place rather than as an alert, so a failed
 * login reads as part of the page instead of interrupting it. `role="alert"` makes
 * a screen reader announce it when it appears.
 */
export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div
      role="alert"
      className="rounded border border-danger-500/25 bg-danger-50 px-4 py-3 text-[13px] font-medium text-danger-600"
    >
      {children}
    </div>
  );
}

export function FormSuccess({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <div className="rounded border border-success-500/25 bg-success-50 px-4 py-3 text-[13px] font-medium text-success-600">
      {children}
    </div>
  );
}
