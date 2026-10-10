import { useEffect, useRef } from "react";

// Decorative only: never captures clicks or follows touch input.
export default function FireflyCursor() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const layer = host.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let last = 0;
    const move = (event: PointerEvent) => {
      if (reduced.matches || event.pointerType === "touch" || performance.now() - last < 65) return;
      last = performance.now();
      const spark = document.createElement("span");
      spark.className = "cursor-firefly";
      spark.style.left = `${event.clientX}px`;
      spark.style.top = `${event.clientY}px`;
      spark.style.setProperty("--drift", `${Math.random() * 40 - 20}px`);
      spark.addEventListener("animationend", () => spark.remove(), { once: true });
      layer.append(spark);
      while (layer.children.length > 24) layer.firstElementChild?.remove();
    };
    const clear = () => layer.replaceChildren();
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("blur", clear);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("blur", clear); clear(); };
  }, []);
  return <div ref={host} className="firefly-cursor" aria-hidden="true" />;
}
