"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Scroll-reveal controller for the landing page.
 *
 * Every element carrying `data-reveal` rises, sharpens and settles the first time
 * it enters the viewport. Direct children of a revealed container stagger, which
 * is what turns a row of cards from "three things appeared" into a sequence.
 *
 * Progressive enhancement matters here: nothing in CSS hides these elements, so
 * with JS unavailable the page is simply fully visible. `gsap.from` sets the
 * start state at runtime, so we never risk content stranded at opacity 0.
 *
 * Renders nothing — it wires behaviour onto server-rendered markup, keeping the
 * page a static Server Component with one small island of motion.
 */
export function LandingMotion() {
  useEffect(() => {
    const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
    if (targets.length === 0) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Everything already renders visible; just make sure nothing animates.
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // One context so a single revert() undoes every tween and trigger on unmount
    // — Strict Mode mounts effects twice in development.
    const ctx = gsap.context(() => {
      for (const el of targets) {
        // Stagger a container's own children rather than the container itself,
        // so grids resolve card by card.
        const kids = Array.from(el.children) as HTMLElement[];
        const animate = kids.length > 1 && kids.length <= 6 ? kids : [el];

        gsap.from(animate, {
          opacity: 0,
          y: 34,
          scale: 0.985,
          filter: "blur(7px)",
          duration: 0.85,
          ease: "power3.out",
          stagger: animate.length > 1 ? 0.09 : 0,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        });
      }
    });

    // Fonts and images landing late shift layout under already-computed triggers.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh).catch(() => {});
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
  }, []);

  return null;
}
