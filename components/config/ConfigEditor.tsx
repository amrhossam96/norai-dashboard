"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { postJson } from "@/lib/api/client";
import type { ConfigKind, ConfigVersion } from "@/lib/api/types";
import { Panel, fmtTs, mono } from "@/components/ui/PageHeader";

export interface KindView {
  kind: ConfigKind;
  label: string;
  blurb: string;
  current: ConfigVersion | null;
  currentYaml: string;
  starter: string;
  history: { version: string; created_at: string }[];
}

/**
 * One tab per config object. The textarea holds the YAML that will be sent to
 * PUT /v1/config/{kind}; the gateway validates it and either registers the
 * version or returns field errors, shown inline. Same version with a different
 * payload is a 409: bump `version`.
 */
export function ConfigEditor({ kinds, initial }: { kinds: KindView[]; initial: ConfigKind }) {
  const router = useRouter();
  const [active, setActive] = useState<ConfigKind>(initial);
  const view = kinds.find((k) => k.kind === active)!;
  const [text, setText] = useState(view.currentYaml || view.starter);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; errors?: { path: string; code: string; message: string }[] } | null>(null);

  useEffect(() => {
    setText(view.currentYaml || view.starter);
    setMsg(null);
  }, [view]);

  async function submit() {
    if (pending) return;
    setPending(true);
    setMsg(null);
    const res = await postJson<{ version: string }>("/api/config", { kind: active, yaml: text }, "PUT");
    setPending(false);
    if (res.status === "success") {
      setMsg({ ok: true, text: res.message });
      router.refresh();
    } else {
      setMsg({ ok: false, text: res.message, errors: res.errors });
    }
  }

  return (
    <div className="mt-[22px] grid gap-[12px] lg:grid-cols-[220px_1fr]">
      <div className="flex flex-col gap-[2px]">
        {kinds.map((k) => (
          <button
            key={k.kind}
            type="button"
            onClick={() => setActive(k.kind)}
            className={`flex items-center gap-[8px] rounded-[6px] px-[10px] py-[8px] text-left font-sans text-[13px] transition-colors ${
              k.kind === active ? "bg-[#1f1f1f] font-semibold text-ink" : "text-ink-3 hover:bg-[#161616]"
            }`}
          >
            <span aria-hidden className="h-[6px] w-[6px] rounded-full" style={{ background: k.current ? "var(--color-grey-55)" : "var(--color-red-ink)" }} />
            {k.label}
            <span className="ml-auto font-mono text-[9.5px] text-grey-60">{k.current?.version ?? "—"}</span>
          </button>
        ))}
        <p className="mt-[12px] px-[10px] font-sans text-[12px] leading-[1.55] text-muted">{view.blurb}</p>
        {view.history.length > 0 ? (
          <div className="mt-[10px] px-[10px]">
            <div className="eyebrow">History</div>
            <ul className="mt-[5px] flex flex-col gap-[3px]">
              {view.history.map((h) => (
                <li key={h.version} className={mono}>{h.version} · {fmtTs(h.created_at)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>

      <Panel
        title={`${view.kind}.yaml`}
        aside={
          <div className="flex items-center gap-[8px]">
            {view.current ? <span className={mono}>registered {fmtTs(view.current.created_at)}</span> : <span className={mono}>not registered</span>}
            <button type="button" onClick={() => setText(view.starter)} className="cta cta-ghost cta-sm">Load starter</button>
            <button type="button" onClick={submit} disabled={pending} className="cta cta-primary cta-sm">
              {pending ? "Validating…" : `PUT /v1/config/${view.kind}`}
            </button>
          </div>
        }
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          rows={Math.max(18, text.split("\n").length + 2)}
          className="no-scrollbar block w-full resize-y bg-shell px-[18px] py-[14px] font-mono text-[12px] leading-[1.55] text-ink outline-none"
        />
        {msg ? (
          <div className={`border-t border-line-soft px-[18px] py-[12px] font-sans text-[12.5px] leading-[1.5] ${msg.ok ? "text-ink" : "text-red-ink"}`}>
            {msg.text}
            {msg.errors?.length ? (
              <ul className="mt-[6px] flex flex-col gap-[3px] font-mono text-[11.5px] text-ink-2">
                {msg.errors.map((e, i) => (
                  <li key={i}><span className="text-red-ink">{e.path}</span> {e.code}: {e.message}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
