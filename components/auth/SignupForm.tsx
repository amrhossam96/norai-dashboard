"use client";

import { useRef, useState } from "react";
import { Field } from "@/components/auth/Field";
import {
  AUTH_OFFLINE,
  PASSWORD_MIN,
  hasErrors,
  validateSignup,
  type AuthResult,
  type FieldErrors,
} from "@/lib/auth";

const TIMEOUT_MS = 15_000;

export function SignupForm() {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const form = new FormData(event.currentTarget);
    const input = {
      first_name: String(form.get("first_name") ?? ""),
      last_name: String(form.get("last_name") ?? ""),
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    const found = validateSignup(input);
    setErrors(found);
    setFormError(null);
    if (hasErrors(found)) return;

    inFlight.current = true;
    setPending(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      const result = (await res.json()) as AuthResult;

      if (res.ok && result.status === "success") {
        setDone(result.message);
        return;
      }
      setFormError(result.message);
    } catch {
      setFormError(AUTH_OFFLINE);
    } finally {
      clearTimeout(timer);
      inFlight.current = false;
      setPending(false);
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className="rounded-[12px] border border-[#2a2a2a] bg-[#161616] px-[14px] py-[12px]"
      >
        <p className="text-[13.5px] leading-[1.55] text-[#f2f2f2]">{done}</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[14px]">
      <div className="flex gap-[10px]">
        <div className="flex-1">
          <Field
            label="First name"
            name="first_name"
            autoComplete="given-name"
            placeholder="Enter first name"
            error={errors.first_name}
            disabled={pending}
            autoFocus
          />
        </div>
        <div className="flex-1">
          <Field
            label="Last name"
            name="last_name"
            autoComplete="family-name"
            placeholder="Enter last name"
            error={errors.last_name}
            disabled={pending}
          />
        </div>
      </div>

      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Enter email address"
        error={errors.email}
        disabled={pending}
      />
      <Field
        label={`Password (${PASSWORD_MIN}+ characters)`}
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="Enter password"
        error={errors.password}
        disabled={pending}
      />

      <button
        type="submit"
        disabled={pending}
        className="cta cta-accent mt-[4px] w-full justify-center"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>

      <div role="status" aria-live="polite">
        {formError ? (
          <p className="text-[12.5px] text-[#ff6b52]">{formError}</p>
        ) : null}
      </div>
    </form>
  );
}
