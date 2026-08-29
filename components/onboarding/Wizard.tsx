"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";

import { NoraiMark } from "@/components/NoraiMark";
import { ASKED, isDense, STEPS, StepPanel, type StepId } from "./Steps";
import {
  DOMAINS,
  findDomain,
  type Domain,
  type PlatformId,
} from "@/lib/onboarding/presets";
import {
  ONBOARDING_OFFLINE,
  type OnboardingAnswers,
  type OnboardingResult,
  type OnboardingSuccess,
} from "@/lib/onboarding/contract";
import { validateProjectName } from "@/lib/projects";

/* Motion vocabulary lifted from the landing page's LandingMotion: things rise,
   sharpen out of blur, and settle on power3.out. */
const IN = "power3.out";
const BLUR = "blur(7px)";
/** px the belt travels per step. */
const TRAVEL = 104;
/** The belt's own duration, plus the word stagger that trails it. */
const BELT_MS = 950;
/**
 * How long to let the belt run on its own before finishing it by hand.
 *
 * A hidden tab freezes requestAnimationFrame and with it GSAP's ticker, so a
 * transition started just before someone switches away stops mid-travel and
 * stays there — the question stranded at a third of its opacity, behind blur,
 * with nothing in CSS to recover it. setTimeout still fires when rAF does not,
 * which makes this the one clock the wizard can trust for correctness.
 */
const BELT_WATCHDOG_MS = 2400;
/** Beat between choosing an option and the belt taking it away. */
const PICK_MS = 340;
const LAST = STEPS.length - 1;
const POLL_MS = 2500;

const index = (id: StepId) => STEPS.indexOf(id);

/**
 * Where the three ambient ramps sit on each step.
 *
 * They are the only thing on screen that remembers where you have been: the
 * light keeps sliding in one direction as you go forward, so the sequence reads
 * as one continuous move through a space rather than seven unrelated screens.
 */
const RAMPS: { x: number | string; y: number | string; scale: number }[][] = [
  [{ x: 0, y: 0, scale: 1 }, { x: 0, y: 0, scale: 1 }, { x: 0, y: 0, scale: 1 }],
  [
    { x: "8vw", y: "6vh", scale: 1.1 },
    { x: "6vw", y: "-8vh", scale: 1 },
    { x: "-8vw", y: "-4vh", scale: 1.1 },
  ],
  [
    { x: "-6vw", y: "12vh", scale: 1.05 },
    { x: "14vw", y: "-14vh", scale: 1.2 },
    { x: "-16vw", y: "6vh", scale: 0.9 },
  ],
  [
    { x: "4vw", y: "18vh", scale: 0.95 },
    { x: "-6vw", y: "-6vh", scale: 1.1 },
    { x: "-4vw", y: "-12vh", scale: 1.15 },
  ],
  [
    { x: 0, y: "26vh", scale: 1.3 },
    { x: "10vw", y: "6vh", scale: 0.85 },
    { x: "-20vw", y: "2vh", scale: 1 },
  ],
  [
    { x: 0, y: "8vh", scale: 1.55 },
    { x: 0, y: 0, scale: 0.7 },
    { x: 0, y: 0, scale: 0.7 },
  ],
  [
    { x: 0, y: "-8vh", scale: 1.7 },
    { x: "-10vw", y: "-10vh", scale: 1.1 },
    { x: "8vw", y: "-6vh", scale: 1.1 },
  ],
];

export function Wizard() {
  const router = useRouter();

  const [step, setStep] = useState(0);
  /** The step still on screen while the belt runs; null when nothing is moving. */
  const [outgoing, setOutgoing] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [domain, setDomain] = useState<string | null>(null);
  const [offEvents, setOffEvents] = useState<ReadonlySet<string>>(new Set());
  const [platform, setPlatform] = useState<PlatformId | null>(null);

  const [result, setResult] = useState<OnboardingSuccess | null>(null);
  const [commitError, setCommitError] = useState<string | null>(null);
  const [firstEvent, setFirstEvent] = useState<{
    eventType: string;
    entityType: string;
  } | null>(null);

  const deckRef = useRef<HTMLDivElement>(null);
  const inRef = useRef<HTMLDivElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const rampRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  const busyRef = useRef(false);
  const dirRef = useRef(1);
  const stepRef = useRef(0);
  /** Whether the automatic commit has fired. Never reset — see the effect. */
  const attemptedRef = useRef(false);
  const inFlightRef = useRef(false);
  const reduceRef = useRef(false);

  const preset: Domain = findDomain(domain) ?? DOMAINS[0];
  const keptEvents = preset.events.filter((e) => !offEvents.has(e.name));
  const stepId = STEPS[step];

  useEffect(() => {
    reduceRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  /* ---------------------------------------------------------------- *
   * The belt.
   *
   * One motion, not two. The outgoing screen keeps travelling the way it
   * was already going and leaves the frame; the incoming screen is already
   * rising behind it, on the SAME tween, started at the same instant.
   * Nothing stops in between, and the chrome never moves — only the
   * question travels through it.
   * ---------------------------------------------------------------- */
  const go = useCallback((target: number) => {
    if (busyRef.current) return;
    if (target < 0 || target > LAST || target === stepRef.current) return;
    dirRef.current = target < stepRef.current ? -1 : 1;
    busyRef.current = true;
    setOutgoing(stepRef.current);
    stepRef.current = target;
    setStep(target);
  }, []);

  useLayoutEffect(() => {
    if (outgoing === null) return;
    const incoming = inRef.current;
    const leaving = outRef.current;
    if (!incoming) return;

    const dir = dirRef.current;
    let restore = () => {};
    const settle = () => {
      if (leaving) gsap.set(leaving, { opacity: 0 });
      gsap.set(incoming, { y: 0, opacity: 1, filter: "none" });
      busyRef.current = false;
      setOutgoing(null);
    };

    if (reduceRef.current) {
      settle();
      return;
    }

    gsap.set(incoming, { y: TRAVEL * dir, opacity: 0, filter: BLUR });
    let watchdog = 0;
    const tl = gsap.timeline({
      onComplete: () => {
        window.clearTimeout(watchdog);
        settle();
      },
    });
    if (leaving) {
      tl.to(
        leaving,
        { y: -TRAVEL * dir, opacity: 0, filter: BLUR, duration: 0.95, ease: IN },
        0,
      );
    }
    tl.to(
      incoming,
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.95, ease: IN },
      0,
    );
    restore = texture(incoming, dir, tl);

    watchdog = window.setTimeout(() => {
      tl.progress(1);
      restore();
      settle();
    }, BELT_WATCHDOG_MS);

    return () => {
      window.clearTimeout(watchdog);
      tl.kill();
      // Never leave a screen stranded mid-tween. Strict Mode re-runs this
      // effect immediately in development, and an interrupted belt would
      // otherwise hold the incoming panel — and every word inside it — at
      // opacity 0 with nothing in CSS to bring it back.
      restore();
      gsap.set(incoming, { y: 0, opacity: 1, filter: "none" });
      busyRef.current = false;
    };
  }, [outgoing, step]);

  /** First paint: the opening screen rises in, with nothing to travel out. */
  useLayoutEffect(() => {
    const incoming = inRef.current;
    if (!incoming || reduceRef.current) return;
    const tl = gsap.timeline();
    tl.from(incoming, {
      y: TRAVEL,
      opacity: 0,
      filter: BLUR,
      duration: 0.95,
      ease: IN,
    });
    const restore = texture(incoming, 1, tl);
    const watchdog = window.setTimeout(() => {
      tl.progress(1);
      restore();
      gsap.set(incoming, { y: 0, opacity: 1, filter: "none" });
    }, BELT_WATCHDOG_MS);
    return () => {
      window.clearTimeout(watchdog);
      tl.kill();
      restore();
      gsap.set(incoming, { y: 0, opacity: 1, filter: "none" });
    };
    // Mount only — every later screen change is driven by the belt above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Ambient light and progress travel with the step, outside the deck. */
  useEffect(() => {
    const duration = reduceRef.current ? 0 : 1.5;
    rampRefs.forEach((ref, i) => {
      if (ref.current) {
        gsap.to(ref.current, {
          ...RAMPS[step][i],
          duration: duration + i * 0.1,
          ease: IN,
        });
      }
    });
    if (barRef.current) {
      gsap.to(barRef.current, {
        width: `${(Math.min(step, ASKED) / ASKED) * 100}%`,
        duration: reduceRef.current ? 0 : 0.9,
        ease: IN,
      });
    }
    // rampRefs is a stable array of refs; only the step drives this.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  /* ---------------------------------------------------------------- *
   * Provisioning.
   *
   * Fires once, on arrival at the install screen, so the round-trip is
   * spent inside a transition the user is already watching. From here on
   * the project exists, which is why Back disappears: going back to change
   * the domain would leave a real project configured for the old one.
   * ---------------------------------------------------------------- */
  const commit = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setCommitError(null);
    const answers: OnboardingAnswers = {
      projectName: name.trim(),
      domain: preset.id,
      events: keptEvents.map((e) => e.name),
      surfaces: preset.surfaces.map((s) => s.name),
      platform: platform ?? "ios",
    };
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const body = (await res.json()) as OnboardingResult;
      if (res.ok && body.status === "success") {
        setResult(body);
        return;
      }
      setCommitError(
        body.status === "error" ? body.message : ONBOARDING_OFFLINE,
      );
    } catch {
      setCommitError(ONBOARDING_OFFLINE);
    } finally {
      inFlightRef.current = false;
    }
  }, [name, preset, keptEvents, platform]);

  // `commit` closes over keptEvents, which is a fresh array on every render, so
  // it is a new function every render too. The effect below must therefore NOT
  // depend on it — reached through a ref instead, it always calls the current
  // version without the identity churn re-triggering the effect.
  const commitRef = useRef(commit);
  commitRef.current = commit;

  useEffect(() => {
    // attemptedRef is never cleared, not even after a failure. Re-arming it
    // there turned a failing commit into a hot loop: the failure set state, the
    // re-render produced a new `commit`, the effect fired again, and the API
    // took ~40 requests a second for as long as the screen was open. A retry is
    // the user pressing "Try again", never this effect running twice.
    if (stepId !== "install" || attemptedRef.current) return;
    attemptedRef.current = true;
    void commitRef.current();
  }, [stepId]);

  /* Waiting for the first event. A poll, not a stream — the backend has no
     SSE, and pretending otherwise would be a fake screen. */
  useEffect(() => {
    if (stepId !== "first") return;
    const environmentId = result?.environmentId;
    if (!environmentId) return;

    let alive = true;
    let timer = 0;
    const poll = async () => {
      try {
        const res = await fetch(
          `/api/onboarding/first-event?env=${environmentId}`,
          { cache: "no-store" },
        );
        if (!alive) return;
        if (res.ok) {
          const body = await res.json();
          if (body?.event) {
            setFirstEvent(body.event);
            return;
          }
        }
      } catch {
        // Offline or a blip. Keep listening; this screen has no deadline.
      }
      if (alive) timer = window.setTimeout(poll, POLL_MS);
    };
    void poll();

    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, [stepId, result?.environmentId]);

  /**
   * The listening pulse.
   *
   * Its own effect rather than part of the belt: these tweens repeat forever,
   * and the belt's cleanup fires the moment a transition settles, which would
   * stop the rings a second after they started.
   */
  useEffect(() => {
    if (stepId !== "first" || reduceRef.current) return;
    const panel = inRef.current;
    if (!panel) return;
    const rings = gsap.utils.toArray<HTMLElement>(
      panel.querySelectorAll(".ob-pulse-ring"),
    );
    const tweens = rings.map((ring, i) =>
      gsap.fromTo(
        ring,
        { scale: 1, opacity: 0.85 },
        {
          scale: 14,
          opacity: 0,
          duration: 2.6,
          ease: "power1.out",
          repeat: -1,
          delay: i * 0.87,
        },
      ),
    );
    return () => {
      tweens.forEach((t) => t.kill());
    };
  }, [stepId]);

  /** Let the arrival land before moving on, so it is legible. */
  useEffect(() => {
    if (!firstEvent || stepRef.current !== index("first")) return;
    const timer = window.setTimeout(() => go(index("done")), 2400);
    return () => {
      window.clearTimeout(timer);
    };
  }, [firstEvent, go]);

  // ---- footer ----

  const nameInvalid = validateProjectName(name);
  const canAdvance =
    (stepId === "name" && !nameInvalid) ||
    (stepId === "domain" && Boolean(domain)) ||
    (stepId === "preset" && keptEvents.length > 0) ||
    (stepId === "plat" && Boolean(platform)) ||
    // Provisioning has to have answered before this screen can be left. Leaving
    // early would strand someone on "listening…" for an environment that may
    // never have been created, with the failure showing on a screen they have
    // already walked past.
    (stepId === "install" && (Boolean(result) || Boolean(commitError))) ||
    stepId === "done";

  const primary = (() => {
    if (stepId === "first") return null;
    if (stepId === "done") return "Open dashboard →";
    if (stepId === "install") return commitError ? "Try again" : "I've installed it";
    return "Continue";
  })();

  const hint = (() => {
    if (stepId === "preset")
      return keptEvents.length
        ? `${keptEvents.length} events`
        : "keep at least one";
    if (stepId === "install") {
      if (commitError) return "";
      return result ? "then send one event" : "setting up…";
    }
    if (stepId === "first") return firstEvent ? "" : "listening…";
    return "";
  })();

  function advance() {
    if (stepId === "done") {
      // refresh() drops the cached server render of /app, which decided there
      // were no projects — without it the dashboard bounces straight back here.
      router.refresh();
      router.push("/app");
      return;
    }
    if (stepId === "install" && commitError) {
      void commit();
      return;
    }
    go(stepRef.current + 1);
  }

  function pickDomain(id: string) {
    if (busyRef.current) return;
    // A different domain means a different preset; carrying the old
    // deselections over would silently drop events from the new one.
    if (domain !== id) setOffEvents(new Set());
    setDomain(id);
    // setTimeout, not gsap.delayedCall: this is sequencing rather than motion,
    // and it has to happen even when the ticker is asleep.
    window.setTimeout(() => go(index("preset")), reduceRef.current ? 0 : PICK_MS);
  }

  function pickPlatform(id: PlatformId) {
    if (busyRef.current) return;
    setPlatform(id);
    window.setTimeout(() => go(index("install")), reduceRef.current ? 0 : PICK_MS);
  }

  function toggleEvent(eventName: string) {
    setOffEvents((current) => {
      const next = new Set(current);
      if (next.has(eventName)) next.delete(eventName);
      else next.add(eventName);
      return next;
    });
  }

  const stepProps = {
    name,
    setName,
    domain,
    pickDomain,
    preset,
    offEvents,
    toggleEvent,
    platform,
    pickPlatform,
    result,
    commitError,
    firstEvent,
    submit: advance,
  };

  return (
    <div className="ob">
      <i className="ob-track" />
      <i className="ob-bar" ref={barRef} />
      <div className="ob-ramp ob-ramp-1" ref={rampRefs[0]} />
      <div className="ob-ramp ob-ramp-2" ref={rampRefs[1]} />
      <div className="ob-ramp ob-ramp-3" ref={rampRefs[2]} />

      <div className="ob-wrap">
        <header className="ob-top">
          <div className="ob-brand">
            <span className="ob-brand-mark">
              <NoraiMark size={11} />
            </span>
            norai
          </div>
          <div className="ob-count">
            {step < ASKED ? (
              <>
                <b>{step + 1}</b> / {ASKED}
              </>
            ) : null}
          </div>
        </header>

        <div className="ob-stage">
          <div className="ob-deck" ref={deckRef}>
            {outgoing !== null && outgoing !== step ? (
              <div
                key={`out:${outgoing}`}
                ref={outRef}
                aria-hidden
                className={panelClass(STEPS[outgoing])}
              >
                <StepPanel step={STEPS[outgoing]} {...stepProps} />
              </div>
            ) : null}
            <div key={`in:${step}`} ref={inRef} className={panelClass(stepId)}>
              <StepPanel step={stepId} {...stepProps} />
            </div>
          </div>
        </div>

        <footer className="ob-foot">
          {canGoBack(stepId) ? (
            <button
              type="button"
              className="ob-btn ob-btn-quiet"
              onClick={() => go(stepRef.current - 1)}
            >
              ← Back
            </button>
          ) : (
            <span />
          )}
          <div className="ob-foot-right">
            <span className="ob-hint" role="status" aria-live="polite">
              {hint}
            </span>
            {stepId === "first" && !firstEvent ? (
              <button
                type="button"
                className="ob-btn ob-btn-quiet"
                onClick={() => go(index("done"))}
              >
                Skip for now
              </button>
            ) : null}
            {primary ? (
              <button
                type="button"
                className="ob-btn ob-btn-go"
                disabled={!canAdvance}
                onClick={advance}
              >
                {primary}
              </button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}

function panelClass(id: StepId): string {
  return `ob-panel${isDense(id) ? " ob-panel-dense" : ""}`;
}

/**
 * Back exists only while every answer is still reversible. From the install
 * step onward the project, its event types and its key are real, so an
 * arrow that appears to undo them would be lying.
 */
function canGoBack(id: StepId): boolean {
  return id === "domain" || id === "preset" || id === "plat";
}

/**
 * Internal life, layered ON the belt rather than replacing it: the hero
 * resolves word by word while the whole panel is still rising.
 *
 * Returns a restore. Every start state here is set by GSAP at runtime, which
 * means an interrupted timeline — Strict Mode remounting, a fast click, an
 * unmount mid-tween — leaves words and answers stranded at opacity 0 with
 * nothing in CSS to bring them back. The restore is what guarantees that
 * never outlives the animation.
 */
function texture(
  panel: HTMLElement,
  dir: number,
  tl: gsap.core.Timeline,
): () => void {
  const heading = panel.querySelector("h1");
  let split: SplitText | null = null;

  if (heading) {
    gsap.registerPlugin(SplitText);
    split = new SplitText(heading, { type: "words", wordsClass: "ob-word" });
    tl.from(
      split.words,
      { y: 24 * dir, opacity: 0, duration: 0.8, ease: IN, stagger: 0.045 },
      0.1,
    );
    // Put the original markup back once the words have landed, so React's view
    // of this subtree and the DOM agree again.
    tl.add(() => {
      split?.revert();
      split = null;
    });
  }

  const kids = panel.querySelectorAll<HTMLElement>(
    ".ob-answers > *, .ob-answers .ob-row > *",
  );
  if (kids.length) {
    tl.from(
      kids,
      { y: 20 * dir, opacity: 0, duration: 0.72, ease: IN, stagger: 0.05 },
      0.2,
    );
  }

  return () => {
    split?.revert();
    split = null;
    if (kids.length) {
      gsap.killTweensOf(kids);
      gsap.set(kids, { clearProps: "opacity,transform,filter" });
    }
  };
}
