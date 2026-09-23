"use client";

import { useState } from "react";
import { postJson } from "@/lib/api/client";
import type { PlaygroundResult } from "@/app/api/playground/route";
import { Panel, Empty, mono, td, th } from "@/components/ui/PageHeader";

const REASON: Record<string, string> = {
  similar_to_viewed: "similar to something they viewed",
  bought_together: "bought together with the seed",
  similar_to_recent: "similar to their recent activity",
  popular_in_segment: "popular in their segment",
  new_arrival: "new arrival",
  pinned: "pinned by a rule",
  exploration: "exploration slot",
  bought_before: "bought before",
};

/**
 * A live /v1/recommend call followed by /v1/explain for the same
 * recommendation_id: the response as your server sees it, and the record that
 * says why every item is there.
 */
export function Playground({ surfaces }: { surfaces: string[] }) {
  const [surface, setSurface] = useState(surfaces[0] ?? "");
  const [who, setWho] = useState<"user_id" | "anonymous_id">("user_id");
  const [id, setId] = useState("");
  const [k, setK] = useState(10);
  const [basket, setBasket] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    setError(null);
    const body: Record<string, unknown> = { surface, k };
    if (id.trim()) body[who] = id.trim();
    const items = basket.split(/[,\s]+/).filter(Boolean);
    if (items.length) body.basket = items;
    const res = await postJson<PlaygroundResult>("/api/playground", body);
    setPending(false);
    if (res.status === "success" && res.data) {
      setResult(res.data);
      setSelected(res.data.response.items[0]?.item_id ?? null);
    } else {
      setError(res.message + (res.errors?.length ? ` — ${res.errors.map((x) => `${x.path}: ${x.message}`).join("; ")}` : ""));
    }
  }

  const explainFor = result?.explain?.items.find((i) => i.item_id === selected);
  const field = "w-full rounded-[7px] border border-line bg-shell px-[10px] py-[8px] font-mono text-[12px] text-ink outline-none focus:border-grey-70";

  return (
    <div className="mt-[22px] grid gap-[12px] lg:grid-cols-[320px_1fr]">
      <Panel title="Request">
        <form onSubmit={run} className="flex flex-col gap-[12px] px-[18px] py-[14px]">
          <label className="flex flex-col gap-[5px]">
            <span className="eyebrow">Surface</span>
            {surfaces.length ? (
              <select value={surface} onChange={(e) => setSurface(e.target.value)} className={field}>
                {surfaces.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            ) : (
              <input value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="no surfaces registered yet" className={field} />
            )}
          </label>
          <label className="flex flex-col gap-[5px]">
            <span className="eyebrow">
              <select value={who} onChange={(e) => setWho(e.target.value as "user_id")} className="bg-transparent font-mono text-[9.5px] uppercase tracking-[0.1em] text-grey-55 outline-none">
                <option value="user_id">user_id</option>
                <option value="anonymous_id">anonymous_id</option>
              </select>
            </span>
            <input value={id} onChange={(e) => setId(e.target.value)} placeholder="leave empty for a cold visitor" className={field} />
          </label>
          <label className="flex flex-col gap-[5px]">
            <span className="eyebrow">Basket (item ids, optional)</span>
            <input value={basket} onChange={(e) => setBasket(e.target.value)} placeholder="sku-1, sku-2" className={field} />
          </label>
          <label className="flex flex-col gap-[5px]">
            <span className="eyebrow">k</span>
            <input type="number" min={1} max={100} value={k} onChange={(e) => setK(Number(e.target.value) || 10)} className={field} />
          </label>
          <button type="submit" disabled={pending || !surface} className="cta cta-primary cta-sm mt-[4px] justify-center">
            {pending ? "Asking…" : "POST /v1/recommend"}
          </button>
          {error ? <p className="font-sans text-[12px] leading-[1.5] text-red-ink">{error}</p> : null}
        </form>
      </Panel>

      <div className="flex min-w-0 flex-col gap-[12px]">
        <Panel
          title="Response"
          aside={
            result ? (
              <span className={mono}>
                {result.latencyMs} ms · {result.response.items.length} items · ttl {result.response.ttl_seconds}s
              </span>
            ) : null
          }
        >
          {!result ? (
            <Empty>Send a request to see the ranked items, the reason codes on each one, and the explain record behind them.</Empty>
          ) : result.response.items.length === 0 ? (
            <Empty>
              The gateway answered with no items. Fallback level: <span className="font-mono">{result.explain?.fallback_level ?? "unknown"}</span>. The Readiness screen lists what is missing.
            </Empty>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-line-soft">
                  <th className={th}>#</th>
                  <th className={th}>Item</th>
                  <th className={th}>Score</th>
                  <th className={th}>Why</th>
                </tr>
              </thead>
              <tbody>
                {result.response.items.map((it) => (
                  <tr
                    key={it.item_id}
                    onClick={() => setSelected(it.item_id)}
                    className={`cursor-pointer border-b border-line-softest last:border-b-0 ${selected === it.item_id ? "bg-surface-3" : "hover:bg-surface-2"}`}
                  >
                    <td className={`${td} ${mono}`}>{it.position}</td>
                    <td className={`${td} font-mono text-ink`}>{it.item_id}</td>
                    <td className={`${td} ${mono}`}>{it.score.toFixed(4)}</td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-[4px]">
                        {it.reasons.length === 0 ? <span className="text-grey-55">—</span> : it.reasons.map((r) => (
                          <span key={r} className="why-chip" title={REASON[r] ?? r}>{r}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Panel>

        {result ? (
          <Panel
            title="Explain"
            aside={
              <span className={mono}>
                {result.response.recommendation_id} · fallback {result.explain?.fallback_level ?? "?"} · variant {JSON.stringify(result.response.variant)}
              </span>
            }
          >
            {result.explainError ? (
              <Empty>/v1/explain failed: {result.explainError}</Empty>
            ) : !explainFor ? (
              <Empty>Select an item above to see its sources, applied rules and attribution.</Empty>
            ) : (
              <div className="grid gap-[12px] px-[18px] py-[14px] md:grid-cols-3">
                <Json title={`sources · ${explainFor.item_id}`} value={explainFor.sources} />
                <Json title="applied rules" value={explainFor.applied_rules} />
                <Json title="attribution" value={explainFor.attribution ?? null} />
              </div>
            )}
            <div className="border-t border-line-softest px-[18px] py-[10px] font-mono text-[10.5px] text-grey-55">
              model versions {JSON.stringify(result.response.model_versions)}
            </div>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}

function Json({ title, value }: { title: string; value: unknown }) {
  return (
    <div className="min-w-0">
      <div className="eyebrow">{title}</div>
      <pre className="no-scrollbar mt-[6px] max-h-[320px] overflow-auto rounded-[7px] border border-line-soft bg-shell px-[10px] py-[8px] font-mono text-[11px] leading-[1.5] text-ink-2">
        {value === null || value === undefined || (Array.isArray(value) && value.length === 0) ? "—" : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
