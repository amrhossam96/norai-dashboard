"use client";

import { NameField } from "@/components/onboarding/NameField";
import {
  DOMAINS,
  PLATFORMS,
  TIER,
  type Domain,
  type PlatformId,
} from "@/lib/onboarding/presets";
import type { OnboardingSuccess } from "@/lib/onboarding/contract";

/** Ordered; the index is the step number the belt travels between. */
export const STEPS = [
  "name",
  "domain",
  "preset",
  "plat",
  "install",
  "first",
  "done",
] as const;

export type StepId = (typeof STEPS)[number];

/**
 * How many steps the progress counter admits to.
 *
 * The last two are not questions — one waits on the customer's own app and one
 * is the receipt — so counting them would show "6 of 7" on a screen where there
 * is nothing left to answer.
 */
export const ASKED = 5;

export interface StepProps {
  name: string;
  setName: (value: string) => void;
  domain: string | null;
  pickDomain: (id: string) => void;
  preset: Domain;
  offEvents: ReadonlySet<string>;
  toggleEvent: (name: string) => void;
  platform: PlatformId | null;
  pickPlatform: (id: PlatformId) => void;
  /** Filled in once /api/onboarding answers; null while it is still in flight. */
  result: OnboardingSuccess | null;
  commitError: string | null;
  firstEvent: { eventType: string; entityType: string } | null;
  submit: () => void;
}

export function StepPanel({ step, ...p }: StepProps & { step: StepId }) {
  switch (step) {
    case "name":
      return <NameStep {...p} />;
    case "domain":
      return <DomainStep {...p} />;
    case "preset":
      return <PresetStep {...p} />;
    case "plat":
      return <PlatformStep {...p} />;
    case "install":
      return <InstallStep {...p} />;
    case "first":
      return <FirstEventStep {...p} />;
    case "done":
      return <DoneStep {...p} />;
  }
}

/** The install step carries a list, so its hero shrinks rather than clipping. */
export function isDense(step: StepId): boolean {
  return step === "install";
}

function NameStep({ name, setName, submit }: StepProps) {
  return (
    <>
      <div className="ob-eyebrow">Getting started</div>
      <h1 className="ob-h1">
        What are you <i>building?</i>
      </h1>
      <p className="ob-lede">
        Just a name for your first project. Nothing depends on it — you can
        change it whenever.
      </p>
      <div className="ob-answers">
        <NameField value={name} onChange={setName} onSubmit={submit} />
      </div>
    </>
  );
}

function DomainStep({ domain, pickDomain }: StepProps) {
  return (
    <>
      <div className="ob-eyebrow">Step 2</div>
      <h1 className="ob-h1">
        What kind of product <i>is it?</i>
      </h1>
      <p className="ob-lede">
        This is the only question that&rsquo;s hard to answer later. Everything
        else — what to track, how fast interest fades, which surfaces to serve —
        follows from it.
      </p>
      <div className="ob-answers">
        <div className="ob-row">
          {DOMAINS.map((d) => (
            <button
              key={d.id}
              type="button"
              className="ob-opt"
              aria-pressed={domain === d.id}
              onClick={() => pickDomain(d.id)}
            >
              <span className="ob-opt-t">{d.title}</span>
              <span className="ob-opt-s">{d.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function PresetStep({ preset, offEvents, toggleEvent }: StepProps) {
  return (
    <>
      <div className="ob-eyebrow">Step 3</div>
      <h1 className="ob-h1">
        Then we&rsquo;ll track <i>these.</i>
      </h1>
      <p className="ob-lede">
        Switched on already. Turn off anything you don&rsquo;t fire — nothing
        breaks, and unknown events are accepted anyway.
      </p>
      <div className="ob-answers">
        <div className="ob-row">
          {preset.events.map((e) => {
            const on = !offEvents.has(e.name);
            return (
              <button
                key={e.name}
                type="button"
                className="ob-chip"
                aria-pressed={on}
                onClick={() => toggleEvent(e.name)}
              >
                <span className={`ob-dot ob-dot-${TIER[e.category]}`} />
                {e.name}
              </button>
            );
          })}
        </div>
        <div className="ob-legend">
          <span>
            <i style={{ background: "#8a8a8a" }} />
            engagement
          </span>
          <span>
            <i style={{ background: "#f2f2f2" }} />
            conversion
          </span>
          <span>
            <i style={{ background: "#ec3013" }} />
            rejection
          </span>
        </div>
        <div className="ob-quiet">
          {preset.kind} · interest halves every {preset.halfLifeDays} days ·{" "}
          {preset.surfaces.length} surfaces created for you
        </div>
      </div>
    </>
  );
}

function PlatformStep({ platform, pickPlatform }: StepProps) {
  return (
    <>
      <div className="ob-eyebrow">Step 4</div>
      <h1 className="ob-h1">
        Where does it <i>run?</i>
      </h1>
      <p className="ob-lede">
        We&rsquo;ll hand you the right snippet. Add more platforms whenever —
        they all share this project.
      </p>
      <div className="ob-answers">
        <div className="ob-row">
          {PLATFORMS.map((pl) => (
            <button
              key={pl.id}
              type="button"
              className="ob-opt"
              aria-pressed={platform === pl.id}
              onClick={() => pickPlatform(pl.id)}
            >
              <span className="ob-opt-t">{pl.title}</span>
              <span className="ob-opt-s">{pl.subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function InstallStep({
  preset,
  offEvents,
  platform,
  result,
  commitError,
}: StepProps) {
  const key = result?.apiKey ?? null;
  const example =
    preset.events.find((e) => !offEvents.has(e.name))?.name ??
    preset.events[0].name;

  return (
    <>
      <div className="ob-eyebrow">Step 5</div>
      <h1 className="ob-h1">
        Drop this <i>in.</i>
      </h1>
      <p className="ob-lede">
        Your key is already in it. Publishable keys ship inside your app; the
        secret one never leaves your server.
      </p>
      <div className="ob-answers">
        {commitError ? (
          <p className="ob-error">{commitError}</p>
        ) : (
          <KeyRow apiKey={key} missing={Boolean(result && !result.apiKey)} />
        )}
        <Snippet
          platform={platform ?? "ios"}
          apiKey={key ?? "pk_…"}
          event={example}
          kind={preset.kind}
        />
      </div>
    </>
  );
}

function KeyRow({
  apiKey,
  missing,
}: {
  apiKey: string | null;
  missing: boolean;
}) {
  async function copy(e: React.MouseEvent<HTMLButtonElement>) {
    if (!apiKey) return;
    const button = e.currentTarget;
    try {
      await navigator.clipboard.writeText(apiKey);
      button.textContent = "Copied";
    } catch {
      // Clipboard access can be denied; the key is selectable either way.
      button.textContent = "Select it";
    }
    setTimeout(() => {
      button.textContent = "Copy";
    }, 1600);
  }

  return (
    <div className="ob-keyrow">
      <span className="ob-keyrow-l">publishable</span>
      <span className={`ob-keyrow-v${apiKey ? "" : " ob-keyrow-pending"}`}>
        {apiKey ?? (missing ? "no key issued" : " ")}
      </span>
      <button
        type="button"
        className="ob-mini"
        onClick={copy}
        disabled={!apiKey}
      >
        Copy
      </button>
    </div>
  );
}

/**
 * The snippet, per platform.
 *
 * Written as JSX rather than a highlighted HTML string: the project name and
 * the key are interpolated into it, and building markup from those by hand is
 * how an injection gets in.
 */
function Snippet({
  platform,
  apiKey,
  event,
  kind,
}: {
  platform: PlatformId;
  apiKey: string;
  event: string;
  kind: string;
}) {
  const k = (t: string) => <span className="ob-code-k">{t}</span>;
  const s = (t: string) => <span className="ob-code-s">{t}</span>;

  const body = {
    ios: (
      <>
        {k("import")} Norai{"\n\n"}
        Norai.configure(apiKey: {s(`"${apiKey}"`)}){"\n"}
        Norai.identify(user.id){"\n"}
        Norai.track({s(`"${event}"`)}, entity: {kind})
      </>
    ),
    android: (
      <>
        {k("import")} ai.norai.Norai{"\n\n"}
        Norai.configure(apiKey = {s(`"${apiKey}"`)}){"\n"}
        Norai.identify(user.id){"\n"}
        Norai.track({s(`"${event}"`)}, entity = {kind})
      </>
    ),
    web: (
      <>
        {k("import")} {"{ Norai } "}
        {k("from")} {s('"@norai/web"')}
        {"\n\n"}
        Norai.configure({"{ apiKey: "}
        {s(`"${apiKey}"`)}
        {" }"}){"\n"}
        Norai.identify(user.id){"\n"}
        Norai.track({s(`"${event}"`)}, {"{ entity: "}
        {kind}
        {" }"})
      </>
    ),
    server: (
      <>
        <span className="ob-code-c">
          {"// server side — use your secret key"}
        </span>
        {"\n"}
        norai.track({"{"}
        {"\n  "}event: {s(`"${event}"`)},{"\n  "}entity: {"{ type: "}
        {s(`"${kind}"`)}, id: {kind}.id {"}"}
        {"\n"}
        {"}"})
      </>
    ),
  }[platform];

  return <pre className="ob-code">{body}</pre>;
}

function FirstEventStep({ preset, firstEvent }: StepProps) {
  return (
    <>
      <div className="ob-eyebrow">Almost there</div>
      <h1 className="ob-h1">
        Waiting for your <i>first event.</i>
      </h1>
      <p className="ob-lede">
        Open your app and do the thing. This screen is watching{" "}
        {preset.kind} traffic in your Production environment.
      </p>
      <div className="ob-answers">
        <div className="ob-pulse">
          <span className="ob-pulse-ring" />
          <span className="ob-pulse-ring" />
          <span className="ob-pulse-ring" />
          <span className="ob-pulse-core" />
        </div>
        <div className="ob-evt">
          {firstEvent ? (
            <>
              <b>✓ received</b>
              {"  "}
              {firstEvent.eventType}
              {firstEvent.entityType ? ` · ${firstEvent.entityType}` : ""}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

function DoneStep({ name, preset, offEvents, platform, result }: StepProps) {
  const platformTitle =
    PLATFORMS.find((pl) => pl.id === platform)?.title ?? PLATFORMS[0].title;
  const kept = preset.events.filter((e) => !offEvents.has(e.name)).length;

  return (
    <>
      <div className="ob-eyebrow">You&rsquo;re set up</div>
      <h1 className="ob-h1">
        {name || "Your project"} is <i>learning.</i>
      </h1>
      <p className="ob-lede">
        It gets better as events arrive. Every night Norai rebuilds everything
        it knows from the raw log — you don&rsquo;t have to do anything.
      </p>
      <div className="ob-answers">
        <div className="ob-sum">
          <Row label="Domain" value={preset.title.toLowerCase()} />
          <Row
            label="Recommending"
            value={`${result?.entityType ?? preset.kind} · half-life ${
              result?.halfLifeDays ?? preset.halfLifeDays
            }d`}
          />
          <Row
            label="Tracking"
            value={`${result?.eventTypesCreated ?? kept} event types`}
          />
          <Row
            label="Surfaces"
            value={`${result?.surfacesCreated ?? preset.surfaces.length} created`}
          />
          <Row label="Environment" value={result?.environmentName ?? "Production"} />
          <Row label="Platform" value={platformTitle} />
        </div>
        {result && result.warnings.length > 0 ? (
          <div className="ob-warn">
            <ul>
              {result.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="ob-sum-row">
      <span className="ob-sum-l">{label}</span>
      <span className="ob-sum-r">{value}</span>
    </div>
  );
}
