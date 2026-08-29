"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PROJECT_NAME_MAX } from "@/lib/projects";

/**
 * The project name, set in the display serif rather than in a boxed input.
 *
 * The native caret is 1px and blinks on a hard square wave, which reads as an
 * OS artefact sitting on top of the type. This one is drawn: 3px, rounded,
 * breathing on a sine, and easing to its new position as you type. Its x is
 * measured from a hidden mirror span because the field is centre-aligned, so
 * the text end moves by half a character on every keystroke.
 */
export function NameField({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<HTMLSpanElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const input = inputRef.current;
    const caret = caretRef.current;
    const mirror = mirrorRef.current;
    if (!wrap || !input || !caret || !mirror) return;

    const place = () => {
      mirror.textContent = input.value;
      const textWidth = mirror.getBoundingClientRect().width;
      const box = input.getBoundingClientRect();
      const wrapBox = wrap.getBoundingClientRect();
      const height = parseFloat(getComputedStyle(input).fontSize) * 0.92;
      gsap.to(caret, {
        x: box.left - wrapBox.left + box.width / 2 + textWidth / 2 + 4,
        y: box.top - wrapBox.top + box.height / 2 - height / 2,
        height,
        duration: 0.24,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const show = () => {
      place();
      gsap.to(caret, { opacity: 1, duration: 0.25 });
    };
    const hide = () => gsap.to(caret, { opacity: 0, duration: 0.25 });

    gsap.set(caret, {
      height: parseFloat(getComputedStyle(input).fontSize) * 0.92,
    });
    place();

    input.addEventListener("input", place);
    input.addEventListener("focus", show);
    input.addEventListener("blur", hide);
    window.addEventListener("resize", place);

    // The panel is still travelling when this mounts; focusing immediately
    // scrolls the moving deck. Waiting out the belt keeps the field still.
    // On a timer rather than gsap.delayedCall — a hidden tab stops the ticker,
    // and a field that never takes focus is a broken screen, not a missing
    // flourish.
    const focus = window.setTimeout(() => input.focus(), 620);
    const breathe = gsap.to(caret, {
      opacity: 0.14,
      duration: 0.68,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.5,
    });

    return () => {
      input.removeEventListener("input", place);
      input.removeEventListener("focus", show);
      input.removeEventListener("blur", hide);
      window.removeEventListener("resize", place);
      window.clearTimeout(focus);
      breathe.kill();
      gsap.killTweensOf(caret);
    };
  }, []);

  return (
    <div className="ob-namewrap" ref={wrapRef}>
      <input
        ref={inputRef}
        className="ob-name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSubmit();
        }}
        placeholder="Acme Store"
        maxLength={PROJECT_NAME_MAX}
        autoComplete="off"
        spellCheck={false}
        aria-label="Project name"
      />
      <span className="ob-rule">
        <i />
      </span>
      <span className="ob-caret" ref={caretRef} aria-hidden />
      <span className="ob-mirror" ref={mirrorRef} aria-hidden />
    </div>
  );
}
