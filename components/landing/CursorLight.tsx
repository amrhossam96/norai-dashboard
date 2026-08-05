"use client";

import { useEffect } from "react";

/**
 * Per-component cursor reactions: a surface highlight, an edge-light on the
 * border, and a small 3D tilt on whichever `.nr-lit` card is under the pointer.
 *
 * There is deliberately no page-level glow. A torch trailing the cursor across
 * the whole page was noise and stole attention from the scene, which is the only
 * thing that should be drawing the eye.
 *
 * Nothing routes through React state — values go straight to CSS custom
 * properties, so a 144Hz pointer costs zero re-renders.
 */
export function CursorLight() {
  useEffect(() => {
    // Coarse pointers have no hover to react to; reduced-motion opts out of
    // ambient movement entirely. Either way: attach nothing.
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!fine || reduced) return;

    let lit: HTMLElement | null = null;

    const release = () => {
      if (!lit) return;
      for (const prop of ["--nr-cx", "--nr-cy", "--nr-tx", "--nr-ty", "--nr-on"])
        lit.style.removeProperty(prop);
      lit = null;
    };

    const onMove = (event: PointerEvent) => {

      // One rect measurement, only for the card actually under the pointer.
      const card = (event.target as Element | null)?.closest?.(
        ".nr-lit",
      ) as HTMLElement | null;
      if (card !== lit) release();
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const lx = event.clientX - rect.left;
      const ly = event.clientY - rect.top;

      card.style.setProperty("--nr-cx", `${lx}px`);
      card.style.setProperty("--nr-cy", `${ly}px`);
      // Normalised to -1..1 from the centre, for the tilt.
      card.style.setProperty("--nr-tx", ((lx / rect.width) * 2 - 1).toFixed(3));
      card.style.setProperty("--nr-ty", ((ly / rect.height) * 2 - 1).toFixed(3));
      card.style.setProperty("--nr-on", "1");
      lit = card;
    };


    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", release);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", release);
      release();
    };
  }, []);

  return null;
}
