"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { NoraiMark } from "@/components/NoraiMark";
import { postJson } from "@/lib/api/client";
import { validateProjectName } from "@/lib/projects";
import type { CreatedApiKey } from "@/lib/api/types";

/**
 * First-run setup, in the order the backend needs things: a project, then its
 * keys, then what to send. Config upload happens on the Configuration screen
 * afterwards; starters are provided there so nothing here blocks on YAML.
 */
export function Wizard({ firstProject, gatewayUrl }: { firstProject: boolean; gatewayUrl: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [pub, setPub] = useState<CreatedApiKey | null>(null);
  const [sec, setSec] = useState<CreatedApiKey | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    const invalid = validateProjectName(name);
    if (invalid) {
      setError(invalid);
      return;
    }
    setPending(true);
    setError(null);
    const res = await postJson<undefined>("/api/projects", { name });
    if (res.status !== "success") {
      setPending(false);
      setError(res.message);
      return;
    }
    const id = (res as { projectId?: string }).projectId ?? null;
    const [p, s] = await Promise.all([
      postJson<CreatedApiKey>("/api/keys", { key_type: "publishable" }),
      postJson<CreatedApiKey>("/api/keys", { key_type: "secret" }),
    ]);
    setPending(false);
    setProjectId(id);
    if (p.status === "success" && p.data) setPub(p.data);
    if (s.status === "success" && s.data) setSec(s.data);
  }

  const field =
    "w-full rounded-[9px] border border-[#2a2a2a] bg-[#161616] px-[13px] py-[11px] font-sans text-[14px] text-[#f2f2f2] outline-none placeholder:text-[#6e6e6e] focus:border-[#5c5c5c]";

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] text-[#f2f2f2]">
      <div className="mx-auto flex max-w-[760px] flex-col px-[24px] pb-[60px] pt-[48px]">
        <div className="flex items-center gap-[9px]">
          <NoraiMark size={20} />
          <span className="font-sans text-[15px] font-semibold tracking-[-0.02em]">norai</span>
          {!firstProject ? (
            <Link href="/app" className="ml-auto font-sans text-[12.5px] text-[#b4b4b4] hover:text-white">← Back to the dashboard</Link>
          ) : null}
        </div>

        {!projectId ? (
          <form onSubmit={create} className="mt-[56px]">
            <span className="eyebrow" style={{ letterSpacing: "0.14em" }}>Step 1 of 3</span>
            <h1 className="mt-[8px] font-sans text-[30px] font-semibold leading-[1.1] tracking-[-0.035em]">
              {firstProject ? "Name your first project." : "Name the new project."}
            </h1>
            <p className="mt-[10px] max-w-[540px] font-sans text-[14px] leading-[1.55] text-[#b4b4b4]">
              A project is one shop or app: its own catalog, events, configuration and keys. Everything norai
              stores is scoped to it, and its id is opaque, so name it for people.
            </p>
            <div className="mt-[22px] flex gap-[10px]">
              <input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Store" disabled={pending} className={field} />
              <button type="submit" disabled={pending} className="cta cta-accent cta-tall flex-none">
                {pending ? "Creating…" : "Create project"}
              </button>
            </div>
            {error ? <p className="mt-[8px] font-sans text-[12.5px] text-[#ff7a5c]">{error}</p> : null}
          </form>
        ) : (
          <div className="mt-[56px]">
            <span className="eyebrow" style={{ letterSpacing: "0.14em" }}>Step 2 of 3 · keys</span>
            <h1 className="mt-[8px] font-sans text-[30px] font-semibold leading-[1.1] tracking-[-0.035em]">
              {name} is registered as <span className="font-mono text-[24px] text-[#b4b4b4]">{projectId}</span>.
            </h1>
            <p className="mt-[10px] max-w-[560px] font-sans text-[14px] leading-[1.55] text-[#b4b4b4]">
              Two keys were issued. This is the only time they are shown in full; store them now. You can issue more or
              revoke these on the API keys screen.
            </p>
            <KeyCard
              title="Publishable key"
              what="For the browser or app. It may only send events."
              k={pub}
            />
            <KeyCard
              title="Secret key"
              what="For your server only. Items, users, recommend, explain and config."
              k={sec}
            />

            <span className="eyebrow mt-[40px] block" style={{ letterSpacing: "0.14em" }}>Step 3 of 3 · send something</span>
            <h2 className="mt-[8px] font-sans text-[20px] font-semibold tracking-[-0.03em]">Three calls and the dashboard fills in.</h2>
            <Snippet title="1. Register your configuration (or use the starters on the Configuration screen)">
{`curl -X PUT ${gatewayUrl}/v1/config/schema \\
  -H "Authorization: Bearer ${sec?.key ?? "nk_sec_…"}" \\
  -H "Content-Type: application/json" \\
  --data @semantic-mapping.json     # then taxonomy, surfaces, rules`}
            </Snippet>
            <Snippet title="2. Send your catalog">
{`curl -X PUT ${gatewayUrl}/v1/items \\
  -H "Authorization: Bearer ${sec?.key ?? "nk_sec_…"}" \\
  -H "Content-Type: application/json" \\
  -d '{"items":[{"item_id":"sku-1","updated_at":"2026-01-01T00:00:00Z",
       "fields":{"name":"Linen shirt","price":49,"currency":"EUR","category":"shirts","stock":12}}]}'`}
            </Snippet>
            <Snippet title="3. Track events with the web SDK">
{`import * as norai from "@norai/web";

norai.init({ key: "${pub?.key ?? "nk_pub_…"}", endpoint: "${gatewayUrl}" });
norai.track({ type: "view", item_id: "sku-1" });        // your names; the taxonomy maps them
norai.identify("user-42");`}
            </Snippet>

            <div className="mt-[28px] flex items-center gap-[12px]">
              <button type="button" onClick={() => { router.refresh(); router.push("/app/config"); }} className="cta cta-accent cta-tall">
                Continue to configuration
              </button>
              <button type="button" onClick={() => { router.refresh(); router.push("/app"); }} className="cta cta-ghost cta-tall">
                Open the dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function KeyCard({ title, what, k }: { title: string; what: string; k: CreatedApiKey | null }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!k) return;
    try {
      await navigator.clipboard.writeText(k.key);
      setCopied(true);
    } catch {}
  }
  return (
    <div className="mt-[14px] rounded-[12px] border border-[#2a2a2a] bg-[#141414] px-[16px] py-[14px]">
      <div className="flex items-baseline justify-between">
        <span className="font-sans text-[13.5px] font-semibold">{title}</span>
        <span className="font-sans text-[12px] text-[#8a8a8a]">{what}</span>
      </div>
      <div className="mt-[10px] flex items-center gap-[8px]">
        <input readOnly value={k?.key ?? "could not be issued — create one on the API keys screen"} onFocus={(e) => e.currentTarget.select()} className="flex-1 rounded-[7px] border border-[#262626] bg-[#0e0e0e] px-[10px] py-[8px] font-mono text-[12px] text-[#f2f2f2] outline-none" />
        <button type="button" onClick={copy} disabled={!k} className="cta cta-primary cta-sm">{copied ? "Copied" : "Copy"}</button>
      </div>
    </div>
  );
}

function Snippet({ title, children }: { title: string; children: string }) {
  return (
    <div className="mt-[14px]">
      <div className="font-sans text-[12.5px] text-[#b4b4b4]">{title}</div>
      <pre className="no-scrollbar mt-[6px] overflow-x-auto rounded-[9px] border border-[#262626] bg-[#0e0e0e] px-[14px] py-[12px] font-mono text-[11.5px] leading-[1.6] text-[#cfcfcf]">{children}</pre>
    </div>
  );
}
