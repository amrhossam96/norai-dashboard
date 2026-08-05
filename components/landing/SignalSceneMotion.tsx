"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Choreography for SignalScene. One pass, left to right.
 *
 *   1 the request reaches the endpoint
 *   2 all four are asked at the same instant — no stagger, because they are
 *     queried in parallel; a stagger would read as a relay
 *   3 each signal lights
 *   4 the replies gather, the merchant's rules drop into the blend, the answer
 *     forms
 *   5 the return: answer -> blend -> all four, right to left
 *
 * The return does NOT use a negative stroke-dashoffset. SVG 1.1 defines that as
 * an error and some browsers clamp it to 0, rendering the path fully drawn rather
 * than reversed — which is why an earlier attempt looked like it was drawn
 * left-to-right. Instead SignalScene emits reversed path geometry and this draws
 * it forwards, so direction is a property of the data, not of dash arithmetic.
 *
 * Dash lengths come from getTotalLength(), which is only correct because these
 * paths carry no vectorEffect: non-scaling-stroke resolves dasharray in screen
 * space while lengths are reported in user units, so beams stopped short.
 */
export function SignalSceneMotion() {
  useEffect(() => {
    const scene = document.querySelector<HTMLElement>("[data-scene]");
    if (!scene) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(scene);
      const ask = q("[data-beam-ask]");
      const out = q("[data-beam-out]");
      const join = q("[data-beam-join]");
      const verdictBeam = q("[data-beam-verdict]");
      const rulesBeam = q("[data-beam-rules]");
      const glows = q("[data-glow]");
      const verdict = q("[data-verdict]");
      const backSpine = q("[data-beam-back-spine]");
      const back = q("[data-beam-back]");
      const strength = (el: Element) =>
        Number((el as HTMLElement).dataset.strength ?? 1);
      if (ask.length === 0) return; // stacked layout: no stage to run

      // Dash values come from each path's real length in user units.
      //
      // NOT pathLength={1}: browsers are unreliable about applying pathLength
      // scaling to stroke-dasharray, and when it is ignored `1` means one user
      // unit — roughly 75 tiny dashes across a 150-unit path, which appears fully
      // drawn instantly instead of flowing.
      //
      // getTotalLength() is safe here precisely because these paths carry no
      // vectorEffect: without non-scaling-stroke, dasharray is measured in the
      // same user units the length is reported in. The viewBox is fixed, so the
      // value never needs recomputing on resize.
      const arm = (paths: Element[]) =>
        paths.forEach((el) => {
          const L = (el as unknown as SVGPathElement).getTotalLength();
          gsap.set(el, { strokeDasharray: L, strokeDashoffset: L, opacity: 0 });
        });
      arm([...ask, ...out, ...join, ...rulesBeam, ...verdictBeam, ...backSpine, ...back]);

      const draw = { strokeDashoffset: 0, opacity: 1 };
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9 });

      tl.set(glows, { opacity: 0 })
        .set(verdict, { opacity: 0.3 })

        .to(ask, { ...draw, duration: 0.45, ease: "power2.inOut" })
        .to(out, { ...draw, duration: 0.55, ease: "power2.out" })
        .to(glows, { opacity: 1, duration: 0.35, ease: "power2.out" }, "-=0.15")
        .to(join, { ...draw, duration: 0.6, ease: "power2.inOut" }, "-=0.1")
        // The replies have landed, so the merchant's rules drop in on top of
        // them. Held to the same 257 u/s as every other beam — a 46-unit path,
        // so 0.18s rather than sharing a duration and appearing to crawl.
        .to(rulesBeam, { ...draw, duration: 0.18, ease: "power2.out" })
        .to(verdictBeam, { ...draw, duration: 0.3 }, "-=0.05")
        .to(verdict, { opacity: 1, duration: 0.35, ease: "power3.out" }, "-=0.1")

        // ---- the return: right to left, on reversed geometry ----
        // Forward beams go to exactly 0: the return shares their curves, and any
        // residual orange underneath tints the cream and fuzzes the edges.
        .to([ask, out, join, rulesBeam, verdictBeam], { opacity: 0, duration: 0.4 }, "+=0.35")
        .to(glows, { opacity: 0.1, duration: 0.4 }, "<")
        // The return mirrors the forward legs exactly — same durations, same
        // eases. It previously ran 0.22s/0.75s on a linear ease, which was both
        // 20% slower over the fan AND missing power2's initial kick, so it read
        // slower still than the numbers suggest.
        // answer -> blend  (mirrors the blend -> answer leg)
        .to(backSpine, { ...draw, duration: 0.3 })
        // blend -> all four at once  (mirrors the four -> blend leg)
        .to(back, {
          strokeDashoffset: 0,
          opacity: (_i: number, target: Element) =>
            0.24 + 0.76 * strength(target),
          duration: 0.6,
          ease: "power2.inOut",
        })
        .to(glows, { opacity: 0, duration: 0.5 }, "+=0.15")
        .to([backSpine, back], { opacity: 0, duration: 0.5 }, "<")
        .to(verdict, { opacity: 0.3, duration: 0.5 }, "<");

      ScrollTrigger.create({
        trigger: scene,
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => (isActive ? tl.play() : tl.pause()),
      });
    }, scene);

    return () => ctx.revert();
  }, []);

  return null;
}
