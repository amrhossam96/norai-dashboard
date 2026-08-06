"use client";

import { useId } from "react";

/**
 * Labelled text input with inline error text.
 *
 * The label is visible rather than a placeholder-as-label: placeholders vanish
 * on focus, which strands anyone who forgets what a field was for, and they are
 * not reliably announced.
 */
export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  error,
  disabled,
  defaultValue,
  autoFocus,
}: {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  /** An example, never the label — the visible <label> above carries that. */
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-[6px] block text-[12.5px] font-medium text-[#b4b4b4]"
      >
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        defaultValue={defaultValue}
        autoFocus={autoFocus}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-[10px] border ${
          error ? "border-[#5c2018]" : "border-[#2a2a2a]"
        } bg-[#161616] px-[12px] py-[9px] text-[13.5px] text-[#f2f2f2] caret-[#ec3013] outline-none transition-colors placeholder:text-[#8a8a8a] focus:border-[#4a4a4a] disabled:opacity-60`}
      />
      {error ? (
        <p id={errorId} className="mt-[6px] text-[12.5px] text-[#ff6b52]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
