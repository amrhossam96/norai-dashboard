"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Field } from "@/components/auth/Field";
import {
  AUTH_OFFLINE,
  hasErrors,
  validateLogin,
  type AuthResult,
  type FieldErrors,
} from "@/lib/auth";

/** Abort a hung request rather than leaving the button disabled forever. */
const TIMEOUT_MS = 15_000;

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  // Guards against a double submit without depending on a stale closure read.
  const inFlight = useRef(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    const form = new FormData(event.currentTarget);
    const input = {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
    };

    // Validate before the network so an empty field costs nothing.
    const found = validateLogin(input);
    setErrors(found);
    setFormError(null);
    if (hasErrors(found)) return;

    inFlight.current = true;
    setPending(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
        signal: controller.signal,
      });

      const result = (await res.json()) as AuthResult;

      if (res.ok && result.status === "success") {
        // The session cookie is set; refresh so server components re-read it,
        // then navigate. replace() keeps the login page out of history.
        router.replace(next);
        router.refresh();
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

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-[14px]">
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="Enter email address"
        error={errors.email}
        disabled={pending}
        autoFocus
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Enter password"
        error={errors.password}
        disabled={pending}
      />

      <button
        type="submit"
        disabled={pending}
        className="cta cta-accent mt-[4px] w-full justify-center"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>

      {/* Mounted at all times so the message is announced when it appears. */}
      <div role="status" aria-live="polite">
        {formError ? (
          <p className="text-[12.5px] text-[#ff6b52]">{formError}</p>
        ) : null}
      </div>
    </form>
  );
}
