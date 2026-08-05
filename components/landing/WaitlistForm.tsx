"use client";

import { useId, useState } from "react";
import {
  WAITLIST_OFFLINE_MESSAGE,
  WAITLIST_TRAP_FIELD,
  type WaitlistResult,
  type WaitlistState,
} from "@/lib/waitlist";

/** The hero sits on a slightly darker panel than the closing CTA. */
const SURFACE = {
  hero: "bg-[#151515]",
  cta: "bg-[#161616]",
} as const;

interface WaitlistFormProps {
  variant?: keyof typeof SURFACE;
  /** Rendered next to the field, e.g. the secondary "Talk to us" link. */
  children?: React.ReactNode;
}

export function WaitlistForm({ variant = "hero", children }: WaitlistFormProps) {
  const [state, setState] = useState<WaitlistState>({ status: "idle" });
  const [pending, setPending] = useState(false);
  const inputId = useId();
  const statusId = useId();

  const failed = state.status === "error";

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    // Keep the submit local: no navigation, no RSC refresh, nothing outside
    // this component re-renders.
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    setPending(true);

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          [WAITLIST_TRAP_FIELD]: form.get(WAITLIST_TRAP_FIELD),
        }),
      });
      // The handler reports outcomes in the body for both 2xx and 4xx.
      setState((await res.json()) as WaitlistResult);
    } catch {
      // Only fires when the request never completed (offline, DNS, abort).
      setState({ status: "error", message: WAITLIST_OFFLINE_MESSAGE });
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-[10px] sm:flex-row sm:flex-wrap">
        {state.status === "success" ? (
          <div
            role="status"
            className={`flex items-center gap-[10px] rounded-[12px] border border-[#2a2a2a] ${SURFACE[variant]} px-[14px] py-[11px]`}
          >
            <span
              aria-hidden
              className="h-[6px] w-[6px] shrink-0 rounded-full bg-red"
            />
            <span className="text-[13.5px] text-[#f2f2f2]">
              {state.message}
            </span>
          </div>
        ) : (
          // noValidate: the handler validates and reports every case itself, so
          // the browser's own bubble would duplicate it in a different voice.
          <form
            onSubmit={onSubmit}
            noValidate
            className={`cta-field relative flex items-center gap-[8px] rounded-[12px] border ${
              failed ? "border-[#5c2018]" : "border-[#2a2a2a]"
            } ${SURFACE[variant]} py-[4px] pl-[14px] pr-[4px]`}
          >
            <label htmlFor={inputId} className="sr-only">
              Work email
            </label>
            <input
              id={inputId}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@company.com"
              disabled={pending}
              aria-invalid={failed}
              aria-describedby={failed ? statusId : undefined}
              className="min-w-0 flex-1 bg-transparent sm:w-[168px] sm:flex-none text-[13.5px] text-[#f2f2f2] caret-[#ec3013] outline-none placeholder:text-[#7a7a7a] disabled:opacity-60"
            />

            {/* Honeypot: off-screen rather than hidden, so bots still fill it. */}
            <input
              type="text"
              name={WAITLIST_TRAP_FIELD}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="pointer-events-none absolute left-[-9999px] h-px w-px opacity-0"
            />

            <button
              type="submit"
              disabled={pending}
              className="cta cta-accent"
            >
              {pending ? "Joining…" : "Join the waitlist"}
            </button>
          </form>
        )}

        {children}
      </div>

      {/* Always mounted so screen readers pick up the change, but contributes no
          height while empty — the surrounding spacing is design-critical. */}
      <div role="status" aria-live="polite">
        {failed ? (
          <p id={statusId} className="mt-[10px] text-[12.5px] text-[#ff6b52]">
            {state.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
