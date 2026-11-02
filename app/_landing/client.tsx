"use client";

// The parts of the landing page that move or react to you.
// Everything here runs in the browser.

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, CloseIcon, LogoMark, MenuIcon } from "./icons";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/* ---------- Adaptive grid: the whole layout scales with the screen ---------- */

export function AdaptiveGrid() {
  useEffect(() => {
    const apply = () => {
      const FONT_BASE = 16;
      const baseWidth = 1920;
      const coef = 0.6666;
      const reduction = ((baseWidth - window.innerWidth) / baseWidth) * 100;
      const size = FONT_BASE - (FONT_BASE * (reduction * coef)) / 100;
      if (size > FONT_BASE) document.documentElement.style.fontSize = `${size}px`;
      else document.documentElement.style.removeProperty("font-size");
    };
    apply();
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("resize", apply);
      document.documentElement.style.removeProperty("font-size");
    };
  }, []);
  return null;
}

/* ---------- Intro loader: counts 000 to 100, then slides up ---------- */

export function PageLoader() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"count" | "exit" | "gone">("count");

  const open = () => {
    document.querySelector(".landing")?.setAttribute("data-ready", "true");
    document.documentElement.style.overflow = "";
  };

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("ascend-intro") === "1";
    } catch {}

    // Already seen it this visit? Skip straight to the page.
    if (seen) {
      open();
      setPhase("gone");
      return;
    }

    document.documentElement.style.overflow = "hidden";
    const FILL_MS = 1300;
    const start = performance.now();
    const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min((now - start) / FILL_MS, 1);
      setProgress(Math.round(ease(t) * 100));
      if (t < 1) raf = requestAnimationFrame(step);
      else setPhase("exit");
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.style.overflow = "";
    };
  }, []);

  // After the slide-up finishes, reveal the page and remove the loader.
  useEffect(() => {
    if (phase !== "exit") return;
    const id = setTimeout(() => {
      open();
      try {
        sessionStorage.setItem("ascend-intro", "1");
      } catch {}
      setPhase("gone");
    }, 800);
    return () => clearTimeout(id);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div className={`l-loader${phase === "exit" ? " exit" : ""}`} role="status" aria-label="Loading">
      <div className="l-loader-center">
        <div className="l-loader-brand">
          <LogoMark /> Ascend
        </div>
        <p>Small habits, honestly kept.</p>
      </div>
      <div className="l-loader-progress">
        <div className="track">
          <div className="fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="row">
          <span>Loading</span>
          <span className="count">{String(progress).padStart(3, "0")}</span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Header: logo, nav, live clock, and the full-screen menu ---------- */

const NAV = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Sign in", href: "/login" },
];

export function LandingHeader() {
  const [open, setOpen] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const time = now
    ? `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")}${now.getHours() < 12 ? "am" : "pm"}`
    : "\u00a0";
  const date = now ? `${now.getDate()} ${MONTHS[now.getMonth()]}, ${now.getFullYear()}` : "\u00a0";

  const go = (e: React.MouseEvent, href: string) => {
    setOpen(false);
    if (href.startsWith("#")) {
      e.preventDefault();
      setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 60);
    }
  };

  return (
    <>
      <header className="l-header">
        <div className="l-shell l-header-row">
          <a href="#home" className="l-logo">
            <LogoMark className="mark" /> Ascend
          </a>

          <nav className="l-nav" aria-label="Primary">
            <ul>
              {NAV.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("/") ? (
                    <Link href={item.href}>{item.label}</Link>
                  ) : (
                    <a href={item.href}>{item.label}</a>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="l-header-right">
            <div className="l-clock">
              <span className="muted">Local time</span>
              <span className="time">{time}</span>
              <span className="sep">•</span>
              <span className="date">{date}</span>
            </div>
            <button
              type="button"
              className="l-menu-btn"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={open}
            >
              <MenuIcon /> <span className="word">Menu</span>
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div className="l-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="l-shell l-menu-top">
            <span className="l-menu-brand">
              <LogoMark /> Ascend
            </span>
            <button type="button" className="l-menu-close" onClick={() => setOpen(false)}>
              <CloseIcon /> Close
            </button>
          </div>
          <nav className="l-shell l-menu-nav" aria-label="Menu">
            <ul>
              {NAV.map((item, i) => (
                <li key={item.label} style={{ "--i": i } as React.CSSProperties}>
                  {item.href.startsWith("/") ? (
                    <Link href={item.href} onClick={(e) => go(e, item.href)}>
                      <span className="n">0{i + 1}</span>
                      <span className="t">{item.label}</span>
                    </Link>
                  ) : (
                    <a href={item.href} onClick={(e) => go(e, item.href)}>
                      <span className="n">0{i + 1}</span>
                      <span className="t">{item.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <div className="l-shell l-menu-bottom">
            <span>Local time — {time}</span>
            <Link href="/login" onClick={() => setOpen(false)}>
              Start your climb →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ---------- Hero background: move the cursor to paint the second image ---------- */

export function LiquidReveal({ beforeSrc, afterSrc }: { beforeSrc: string; afterSrc: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [baseMissing, setBaseMissing] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const brushRadius = 143;
    const decay = 0.016;
    let radius = brushRadius * dpr;
    let w = 0;
    let h = 0;
    let loaded = false;
    let points: { x: number; y: number }[] = [];
    let last: { x: number; y: number } | null = null;
    let idle = 999;
    let raf = 0;
    let running = false;

    const cover = document.createElement("canvas");
    const brush = document.createElement("canvas");
    const image = new Image();

    const drawCover = () => {
      cover.width = w;
      cover.height = h;
      if (!loaded || !w || !h) return;
      const c = cover.getContext("2d");
      if (!c) return;
      const scale = Math.max(w / image.naturalWidth, h / image.naturalHeight);
      const iw = image.naturalWidth * scale;
      const ih = image.naturalHeight * scale;
      c.drawImage(image, (w - iw) / 2, (h - ih) / 2, iw, ih);
    };

    const resize = () => {
      const r = box.getBoundingClientRect();
      w = Math.round(r.width * dpr);
      h = Math.round(r.height * dpr);
      canvas.width = w;
      canvas.height = h;
      radius = brushRadius * dpr;
      const d = Math.ceil(radius * 2);
      brush.width = d;
      brush.height = d;
      drawCover();
    };

    const stamp = (x: number, y: number) => {
      const b = brush.getContext("2d");
      if (!b) return;
      const d = brush.width;
      const c = d / 2;
      b.globalCompositeOperation = "source-over";
      b.clearRect(0, 0, d, d);
      const g = b.createRadialGradient(c, c, 0, c, c, c);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.55, "rgba(255,255,255,0.82)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      b.fillStyle = g;
      b.fillRect(0, 0, d, d);
      b.globalCompositeOperation = "source-in";
      b.drawImage(cover, x - c, y - c, d, d, 0, 0, d, d);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(brush, x - c, y - c);
    };

    const tick = () => {
      const drawing = points.length > 0;
      idle = drawing ? 0 : idle + 1;
      if (idle > 120) {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, w, h);
        running = false;
        return;
      }
      const fade = drawing ? decay : Math.min(decay + idle * 0.004, 0.5);
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0,0,0,${fade})`;
      ctx.fillRect(0, 0, w, h);
      if (drawing) {
        for (const p of points) stamp(p.x, p.y);
        points = [];
      }
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = box.getBoundingClientRect();
      const x = (e.clientX - r.left) * dpr;
      const y = (e.clientY - r.top) * dpr;
      if (x < -radius || y < -radius || x > w + radius || y > h + radius) {
        last = null;
        return;
      }
      if (last) {
        const dist = Math.hypot(x - last.x, y - last.y);
        const step = Math.max(radius * 0.3, 1);
        const n = Math.min(Math.ceil(dist / step), 60);
        for (let i = 1; i <= n; i++) {
          points.push({ x: last.x + ((x - last.x) * i) / n, y: last.y + ((y - last.y) * i) / n });
        }
      } else {
        points.push({ x, y });
      }
      last = { x, y };
      if (!running) {
        running = true;
        idle = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    image.onload = () => {
      loaded = true;
      drawCover();
    };
    image.src = afterSrc;

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(box);
    window.addEventListener("pointermove", onMove);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [afterSrc]);

  return (
    <div ref={boxRef} className="l-liquid">
      {!baseMissing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={beforeSrc} alt="" onError={() => setBaseMissing(true)} />
      )}
      <canvas ref={canvasRef} aria-hidden="true" />
    </div>
  );
}

/* ---------- Hero card: a small carousel ---------- */

const CARD_ITEMS = [
  { caption: "Daily quests", title: "Turn habits into XP." },
  { caption: "Never miss twice", title: "One slip is forgiven." },
  { caption: "Community", title: "Rise with friends." },
];

export function HeroCard() {
  const [i, setI] = useState(0);
  const go = (step: number) => setI((v) => (v + step + CARD_ITEMS.length) % CARD_ITEMS.length);
  const item = CARD_ITEMS[i];

  return (
    <div className="l-hcard">
      <div className="l-hcard-row" onClick={() => go(1)}>
        <div className="l-hcard-tile">
          <LogoMark />
        </div>
        <div className="l-hcard-panel">
          <div className="l-hcard-slot" key={i} aria-live="polite">
            <p className="cap">{item.caption}</p>
            <p className="ttl">{item.title}</p>
          </div>
          <div className="l-hcard-foot">
            <div className="dots" aria-hidden="true">
              {CARD_ITEMS.map((_, n) => (
                <span key={n} className={n === i ? "on" : ""} />
              ))}
            </div>
            <div className="btns">
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
              >
                <ArrowRight className="flip" />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
              >
                <ArrowRight />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Scroll reveal: slides in the first time it comes into view ---------- */

export function Reveal({
  children,
  delay = 0,
  y = 20,
  plain = false,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  plain?: boolean; // only flags "in view"; children animate themselves
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal${plain ? " plain" : ""} ${className}`}
      style={{ "--d": `${delay}ms`, "--y": `${y}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

/* ---------- Count-up driven by scroll position ---------- */

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(value);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      // 0 when the number's top reaches the bottom of the screen,
      // 1 when its centre reaches the middle of the screen.
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh / 2 + r.height / 2)));
      setShown(Math.round(p * value));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}