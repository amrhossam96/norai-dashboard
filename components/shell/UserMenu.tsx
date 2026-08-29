"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CurrentUser } from "@/lib/api/types";

/**
 * The signed-in account, and the way out of it.
 *
 * Sign-out is entirely a browser-side affair: the Go API is stateless, so there
 * is no server session to end. Clearing the httpOnly cookie is the whole
 * operation, and /api/auth/logout does it — a route handler rather than a fetch
 * from here, because the cookie is invisible to scripts by design.
 *
 * What that does NOT do is revoke the token. It stays valid until it expires,
 * so a copy taken elsewhere keeps working; see the note in the logout route.
 */
export function UserMenu({ user }: { user: CurrentUser | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Send focus back where it came from, or the next Tab starts from the
      // top of the document.
      buttonRef.current?.focus();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function signOut() {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // The cookie may already be gone, or the network dropped. Either way the
      // right move is the same — leave for the login screen, which re-checks.
    }
    // refresh() first: without it the cached server render of /app survives and
    // the signed-out user sees their old dashboard until something re-renders.
    router.refresh();
    router.push("/login");
  }

  const name = displayName(user);

  return (
    <div ref={rootRef} className="relative border-t border-line">
      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute bottom-[calc(100%+6px)] left-[10px] right-[10px] z-20 overflow-hidden rounded-[9px] border border-line-3 bg-surface-2"
        >
          {user ? (
            <div className="border-b border-line-softest px-[13px] py-[10px]">
              <div className="eyebrow">Signed in as</div>
              <div className="mt-[4px] truncate font-mono text-[11px] text-ink-3">
                {user.email}
              </div>
            </div>
          ) : null}
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={pending}
            className="block w-full cursor-pointer px-[13px] py-[10px] text-left font-sans text-[12.5px] text-ink transition-colors hover:bg-surface-3 disabled:opacity-55"
          >
            {pending ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-[9px] px-4 py-[12px] text-left transition-colors hover:bg-surface-3"
      >
        <span className="grid h-[24px] w-[24px] flex-none place-items-center rounded-full bg-line-2 font-mono text-[9.5px] font-medium text-ink-3">
          {initials(user)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-sans text-[12px] font-semibold text-ink">
            {name}
          </span>
          <span className="block truncate font-mono text-[9.5px] text-grey-60">
            {user?.email ?? "not signed in"}
          </span>
        </span>
        <span className="font-mono text-[11px] text-grey-65">⌄</span>
      </button>
    </div>
  );
}

/**
 * "Demo W." rather than the full name: the row is 236px wide with an avatar and
 * a chevron on it, and the email underneath is the part that actually
 * disambiguates one account from another.
 */
function displayName(user: CurrentUser | null): string {
  if (!user) return "Account";
  const first = user.first_name?.trim() ?? "";
  const lastInitial = user.last_name?.trim()?.[0];
  if (first && lastInitial) return `${first} ${lastInitial}.`;
  if (first) return first;
  return user.email.split("@")[0];
}

function initials(user: CurrentUser | null): string {
  if (!user) return "–";
  const letters = [user.first_name?.[0], user.last_name?.[0]]
    .filter(Boolean)
    .join("");
  return (letters || user.email[0] || "?").toUpperCase();
}
