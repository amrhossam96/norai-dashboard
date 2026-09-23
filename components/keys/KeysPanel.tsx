"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/api/client";
import type { ApiKeyRow, CreatedApiKey } from "@/lib/api/types";
import { Empty, fmtTs, mono, Panel, td, th } from "@/components/ui/PageHeader";

export function KeysPanel({ keys }: { keys: ApiKeyRow[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [fresh, setFresh] = useState<CreatedApiKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function create(type: "publishable" | "secret") {
    if (pending) return;
    setPending(type);
    setError(null);
    const res = await postJson<CreatedApiKey>("/api/keys", { key_type: type });
    setPending(null);
    if (res.status === "success" && res.data) {
      setFresh(res.data);
      setCopied(false);
      router.refresh();
    } else setError(res.message);
  }

  async function revoke(key: ApiKeyRow) {
    if (pending) return;
    if (!window.confirm(`Revoke ${key.display}? It keeps working for 24 hours so you can rotate, then stops.`)) return;
    setPending(key.key_id);
    const res = await postJson("/api/keys", { key_id: key.key_id }, "DELETE");
    setPending(null);
    if (res.status !== "success") setError(res.message);
    router.refresh();
  }

  async function copy() {
    if (!fresh) return;
    try {
      await navigator.clipboard.writeText(fresh.key);
      setCopied(true);
    } catch {
      /* the field is selectable */
    }
  }

  return (
    <div className="mt-[22px] flex max-w-[900px] flex-col gap-[12px]">
      {fresh ? (
        <div className="rounded-[12px] border border-why-border bg-why-bg px-[18px] py-[14px]">
          <div className="flex items-center justify-between">
            <div className="font-sans text-[13.5px] font-semibold text-ink">
              New {fresh.key_type} key — copy it now
            </div>
            <button type="button" onClick={() => setFresh(null)} className="font-sans text-[12px] text-ink-3 hover:text-ink">Dismiss</button>
          </div>
          <p className="mt-[3px] font-sans text-[12.5px] text-ink-2">
            This is the only time the full key is shown. Afterwards only <span className="font-mono">{fresh.display}</span> is.
          </p>
          <div className="mt-[10px] flex items-center gap-[8px]">
            <input readOnly value={fresh.key} onFocus={(e) => e.currentTarget.select()} className="flex-1 rounded-[7px] border border-line bg-shell px-[10px] py-[8px] font-mono text-[12px] text-ink outline-none" />
            <button type="button" onClick={copy} className="cta cta-primary cta-sm">{copied ? "Copied" : "Copy"}</button>
          </div>
        </div>
      ) : null}

      <Panel
        title="Keys"
        aside={
          <div className="flex gap-[8px]">
            <button type="button" onClick={() => create("publishable")} disabled={pending !== null} className="cta cta-ghost cta-sm">
              {pending === "publishable" ? "Creating…" : "New publishable key"}
            </button>
            <button type="button" onClick={() => create("secret")} disabled={pending !== null} className="cta cta-primary cta-sm">
              {pending === "secret" ? "Creating…" : "New secret key"}
            </button>
          </div>
        }
      >
        {error ? <div className="border-b border-line-soft px-[18px] py-[10px] font-sans text-[12.5px] text-red-ink">{error}</div> : null}
        {keys.length === 0 ? (
          <Empty>
            No keys yet. A <b>publishable</b> key goes in the browser or app and may only send events. A <b>secret</b> key
            stays on your server and can do everything else: items, users, recommend, explain, config.
          </Empty>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line-soft">
                <th className={th}>Key</th>
                <th className={th}>Type</th>
                <th className={th}>Created</th>
                <th className={th}>Status</th>
                <th className={th}></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => {
                const revoked = Boolean(k.revoked_at);
                const graceOver = k.grace_until ? new Date(k.grace_until).getTime() < Date.now() : false;
                return (
                  <tr key={k.key_id} className={`border-b border-line-softest last:border-b-0 ${revoked ? "opacity-60" : ""}`}>
                    <td className={`${td} font-mono text-ink`}>{k.display}<div className={mono}>{k.key_id}</div></td>
                    <td className={td}><span className="chip">{k.key_type}</span></td>
                    <td className={`${td} ${mono}`}>{fmtTs(k.created_at)}</td>
                    <td className={td}>
                      {!revoked ? "active" : graceOver ? <span className="text-red-ink">revoked</span> : <span className="text-red-ink">revoked · valid until {fmtTs(k.grace_until)}</span>}
                    </td>
                    <td className={`${td} text-right`}>
                      {!revoked ? (
                        <button type="button" onClick={() => revoke(k)} disabled={pending !== null} className="font-sans text-[12px] text-ink-3 hover:text-red-ink">
                          {pending === k.key_id ? "Revoking…" : "Revoke"}
                        </button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
    </div>
  );
}
