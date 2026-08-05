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
 *   4 the replies gather and the answer forms
 *   5 hold, clear, repeat
 *
 * There is no return pass. Reverse-drawing a path needs a negative
 * stroke-dashoffset, which SVG 1.1 treats as an error and browsers handle
 * inconsistently, so the citation could never be relied on to travel right to
 * left. The reason line simply stays on the answer card instead.
 *
 * Note there is no `vectorEffect="non-scaling-stroke"` on these paths: it makes
 * stroke-dasharray resolve in screen space while getTotalLength() returns user
 * units, so every drawn beam stopped short of its endpoint by the stage's scale
 * factor.
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
      const glows = q("[data-glow]");
      const verdict = q("[data-verdict]");
      if (ask.length === 0) return; // stacked layout: no stage to run

      const len = (el: Element) =>
        (el as unknown as SVGPathElement).getTotalLength();

      // Hidden, ready to draw from the start. Set at runtime only, so with JS
      // unavailable nothing is left stranded invisible.
      for (const p of [...ask, ...out, ...join, ...verdictBeam]) {
        gsap.set(p, {
          strokeDasharray: len(p),
          strokeDashoffset: len(p),
          opacity: 0,
        });
      }

      const draw = { strokeDashoffset: 0, opacity: 1 };
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.9 });

      tl.set(glows, { opacity: 0 })
        .set(verdict, { opacity: 0.3 })

        .to(ask, { ...draw, duration: 0.45, ease: "power2.inOut" })
        .to(out, { ...draw, duration: 0.55, ease: "power2.out" })
        .to(glows, { opacity: 1, duration: 0.35, ease: "power2.out" }, "-=0.15")
        .to(join, { ...draw, duration: 0.6, ease: "power2.inOut" }, "-=0.1")
        .to(verdictBeam, { ...draw, duration: 0.3 }, "-=0.1")
        .to(verdict, { opacity: 1, duration: 0.35, ease: "power3.out" }, "-=0.1")

        .to({}, { duration: 1.6 })
        .to([ask, out, join, verdictBeam], { opacity: 0, duration: 0.55 })
        .to(glows, { opacity: 0, duration: 0.55 }, "<")
        .to(verdict, { opacity: 0.3, duration: 0.55 }, "<");

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
