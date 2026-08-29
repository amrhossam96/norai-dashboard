"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { suggestCategory } from "@/lib/eventTypes/suggest";
import type { EventCategory, EventType } from "@/lib/api/types";

/* Until a type is classified its events store with strength 0 and move nothing
   — no affinity, no similarity, no transitions, no outcomes. This screen is how
   that gets fixed, and it is the only thing that calls the classify endpoint. */

const ROLE_COLOR: Record<string, string> = {
  conversion: "var(--color-ink)",
  engagement: "var(--color-grey-55)",
  negative: "var(--color-red-ink)",
  ignored: "var(--color-grey-65)",
};

export function ClassifyTable({
  environmentId,
  pending,
  active,
  categories,
}: {
  environmentId: string;
  pending: EventType[];
  active: EventType[];
  categories: EventCategory[];
}) {
  const router = useRouter();
  const byName = useMemo(
    () => new Map(categories.map((c) => [c.name, c])),
    [categories],
  );

  const [choice, setChoice] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    for (const t of pending) {
      const s = suggestCategory(t.event_name);
      const c = s ? byName.get(s.category) : undefined;
      if (c) seed[t.id] = c.id;
    }
    return seed;
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<Record<string, string>>({});

  async function classify(typeId: string) {
    const categoryId = choice[typeId];
    if (!categoryId) return;
    setBusy(typeId);
    setFailed((f) => {
      const { [typeId]: _drop, ...rest } = f;
      return rest;
    });
    try {
      const res = await fetch("/api/event-types/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environmentId, eventTypeId: typeId, categoryId }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: res.statusText }));
        setFailed((f) => ({ ...f, [typeId]: error ?? "failed" }));
        return;
      }
      router.refresh();
    } catch (err) {
      setFailed((f) => ({
        ...f,
        [typeId]: err instanceof Error ? err.message : "failed",
      }));
    } finally {
      setBusy(null);
    }
  }

  async function classifyAllSuggested() {
    for (const t of pending) {
      if (choice[t.id]) await classify(t.id);
    }
  }

  const suggestedCount = pending.filter((t) => choice[t.id]).length;

  return (
    <>
      {pending.length === 0 ? (
        <div className="mt-[22px] max-w-[820px] rounded-[12px] border border-line bg-surface px-[18px] py-[16px]">
          <div className="font-sans text-[13.5px] font-medium text-ink">
            Every event type is classified
          </div>
          <div className="mt-[4px] font-sans text-[12.5px] text-muted">
            Nothing is scoring zero. New names appear here the first time they arrive.
          </div>
        </div>
      ) : (
        <>
          <div className="mt-[22px] flex max-w-[820px] items-center justify-between gap-[10px] rounded-[8px] border border-line bg-surface px-[14px] py-[11px]">
            <span className="font-sans text-[12px] text-grey-40">
              {pending.length} type{pending.length === 1 ? "" : "s"} scoring zero
              {suggestedCount > 0 ? ` · ${suggestedCount} pre-filled from the name` : ""}
            </span>
            {suggestedCount > 0 && (
              <button
                onClick={classifyAllSuggested}
                disabled={busy !== null}
                className="rounded-[6px] border border-line-2 px-[10px] py-[4px] font-sans text-[12px] font-medium text-ink disabled:opacity-50"
              >
                Accept all {suggestedCount}
              </button>
            )}
          </div>

          <div className="mt-[14px] max-w-[820px] overflow-hidden rounded-[12px] border border-line bg-surface">
            {pending.map((t) => {
              const s = suggestCategory(t.event_name);
              return (
                <div
                  key={t.id}
                  className="flex flex-wrap items-center gap-[10px] border-b border-line-soft px-[18px] py-[12px] last:border-b-0"
                >
                  <div className="min-w-[190px] flex-1">
                    <div className="font-mono text-[12.5px] text-ink">{t.event_name}</div>
                    <div className="mt-[2px] font-sans text-[11.5px] text-muted">
                      {t.entity_type === "unknown"
                        ? "no entity kind on the payload"
                        : t.entity_type}
                      {s ? ` · suggested from the ${s.basis === "exact" ? "name" : "word"}` : ""}
                    </div>
                  </div>
                  <select
                    value={choice[t.id] ?? ""}
                    onChange={(e) =>
                      setChoice((c) => ({ ...c, [t.id]: e.target.value }))
                    }
                    className="rounded-[6px] border border-line-2 bg-surface px-[8px] py-[5px] font-sans text-[12.5px] text-ink"
                  >
                    <option value="">Choose a category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.role} ({c.weight})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => classify(t.id)}
                    disabled={!choice[t.id] || busy !== null}
                    className="rounded-[6px] border border-line-2 px-[10px] py-[5px] font-sans text-[12px] font-medium text-ink disabled:opacity-40"
                  >
                    {busy === t.id ? "Saving…" : "Classify"}
                  </button>
                  {failed[t.id] && (
                    <div className="w-full font-mono text-[11.5px]" style={{ color: "var(--color-red-ink)" }}>
                      {failed[t.id]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {active.length > 0 && (
        <div className="mt-[26px] max-w-[820px]">
          <div className="eyebrow mb-[8px]" style={{ letterSpacing: "0.14em" }}>
            Classified
          </div>
          <div className="overflow-hidden rounded-[12px] border border-line bg-surface">
            {active.map((t) => {
              const cat = categories.find((c) => c.id === t.event_category_id);
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-[10px] border-b border-line-soft px-[18px] py-[10px] last:border-b-0"
                >
                  <span className="flex-1 font-mono text-[12.5px] text-ink">
                    {t.event_name}
                  </span>
                  <span className="font-sans text-[12px] text-muted">
                    {cat ? `${cat.name} · ${cat.weight}` : "—"}
                  </span>
                  {cat && (
                    <span
                      className="rounded-[5px] border border-line-2 px-[6px] py-[1px] font-mono text-[9px] tracking-[0.1em]"
                      style={{ color: ROLE_COLOR[cat.role] ?? "var(--color-grey-55)" }}
                    >
                      {cat.role.toUpperCase()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
