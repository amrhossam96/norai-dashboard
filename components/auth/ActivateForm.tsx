"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { AUTH_OFFLINE, type AuthResult } from "@/lib/auth";

const TIMEOUT_MS = 15_000;

/**
 * Activation is behind an explicit button rather than firing on page load.
 *
 * The token is single-use, and corporate mail scanners routinely fetch every
 * link in an incoming message. If the page activated on render, the scanner
 * would consume the token and the actual recipient would land on "this link is
 * invalid". A button requires a real interaction.
 */
export function ActivateForm({ token }: { token: string }) {
  const [state, setState] = useState<AuthResult | null>(null);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);

  async function activate() {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const res = await fetch("/api/auth/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        signal: controller.signal,
      });
      setState((await res.json()) as AuthResult);
    } catch {
      setState({ status: "error", message: AUTH_OFFLINE });
    } finally {
      clearTimeout(timer);
      inFlight.current = false;
      setPending(false);
    }
  }

  if (state?.status === "success") {
    return (
      <div>
        <div
          role="status"
          className="rounded-[12px] border border-[#2a2a2a] bg-[#161616] px-[14px] py-[12px]"
        >
          <p className="text-[13.5px] text-[#f2f2f2]">{state.message}</p>
        </div>
        <Link href="/login" className="cta cta-accent mt-[14px] w-full justify-center">
          Continue to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={activate}
        disabled={pending}
        className="cta cta-accent w-full justify-center"
      >
        {pending ? "Activating…" : "Activate my account"}
      </button>

      <div role="status" aria-live="polite">
        {state?.status === "error" ? (
          <p className="mt-[10px] text-[12.5px] text-[#ff6b52]">{state.message}</p>
        ) : null}
      </div>
    </div>
  );
}
