import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CircleDot,
  GitHub,
  LogoMark,
  Star,
} from "./_landing/icons";
import {
  AdaptiveGrid,
  CountUp,
  HeroCard,
  LandingHeader,
  LiquidReveal,
  PageLoader,
  Reveal,
} from "./_landing/client";
import "./_landing/landing.css";

const REPO = "https://github.com/arnavk-helios/monarch-system";

const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

function Pill({
  href,
  variant,
  arrow,
  external,
  children,
}: {
  href: string;
  variant: "dark" | "light" | "outline";
  arrow?: "right" | "up-right";
  external?: boolean;
  children: React.ReactNode;
}) {
  const inner = (
    <span className={`l-pill-in ${variant}${arrow ? " arrow" : ""}`}>
      {children}
      {arrow && (
        <span className="l-pill-badge">
          {arrow === "up-right" ? <ArrowUpRight /> : <ArrowRight />}
        </span>
      )}
    </span>
  );
  if (href.startsWith("/")) {
    return (
      <Link href={href} className="l-pill">
        {inner}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className="l-pill"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {inner}
    </a>
  );
}

function Eyebrow({
  children,
  light,
  boxed,
}: {
  children: React.ReactNode;
  light?: boolean;
  boxed?: boolean;
}) {
  return (
    <span className={`l-eyebrow${light ? " light" : ""}${boxed ? " boxed" : ""}`}>
      <i />
      {children}
    </span>
  );
}

function Words({ text, muted }: { text: string; muted?: boolean }) {
  return (
    <span className={muted ? "muted" : undefined}>
      {text.split(" ").map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="word" style={d(i * 35)}>
            {word}
          </span>{" "}
        </span>
      ))}
    </span>
  );
}

const QUEST_NAMES = ["Workout", "Water", "Reading", "Deep work", "Sleep", "Skincare", "Journal"];

const FEATURES = [
  {
    name: "Daily Quests",
    tag: "Core",
    text: "Fourteen quests a day, from morning sunlight to a proper night's sleep. Every tick earns real XP.",
    chips: ["Workout", "Reading", "Deep work"],
  },
  {
    name: "Never Miss Twice",
    tag: "Streaks",
    text: "Miss one day and your streak survives. Come back the next day and earn a recovery bonus.",
    chips: ["Streaks", "Recovery bonus"],
  },
  {
    name: "Ranks & Titles",
    tag: "Progress",
    text: "Climb nine ranks from Mortal to Olympian, with a laurel medallion and a rank-up moment each time.",
    chips: ["XP", "Rank-ups", "Achievements"],
  },
  {
    name: "Community",
    tag: "Friends",
    text: "Add friends by email, compare weekly XP side by side, and congratulate each other's rank-ups.",
    chips: ["Friends", "Leaderboard", "Cheers"],
  },
];

const STEPS = [
  { title: "Log your quests", text: "Tick off what you really did today." },
  { title: "Earn XP and rank up", text: "Every habit adds XP. Cross a line, earn a title." },
  { title: "Keep the streak", text: "Miss one day, no problem. Miss two, start again." },
  { title: "Climb with friends", text: "See who is rising this week and send a congratulation." },
];

const STATS = [
  { value: 14, label: "Daily quests" },
  { value: 9, label: "Ranks to climb" },
  { value: 40, label: "Achievements" },
  { value: 365, label: "XP in a perfect day" },
];

export default function Landing() {
  return (
    <div className="landing" data-ready="false">
      <AdaptiveGrid />
      <PageLoader />
      <a className="l-skip" href="#main">
        Skip to content
      </a>
      <LandingHeader />

      <main id="main">
        {/* ---------- Hero ---------- */}
        <section id="home" className="l-hero">
          <LiquidReveal beforeSrc="/hero/before.png" afterSrc="/hero/after.jpg" />
          <div className="l-hero-veil" />
          

          <div className="l-shell l-hero-grid">
            <div className="l-hero-left">
              <Reveal delay={200} y={10}>
                <Eyebrow>Honest by design</Eyebrow>
              </Reveal>

              <Reveal plain>
                <h1 className="l-h1 lines">
                  <span className="line">
                    <span className="line-in" style={d(250)}>
                      Level up
                    </span>
                  </span>
                  <span className="line">
                    <span className="line-in" style={d(370)}>
                      one honest day
                    </span>
                  </span>
                  <span className="line">
                    <span className="line-in" style={d(490)}>
                      at a time
                    </span>
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={650} y={10}>
                <div className="l-rating">
                  <span className="stars">
                    <Star />
                  </span>
                  <span>Free to join, no card needed</span>
                </div>
              </Reveal>

              <Reveal delay={750} y={10}>
                <div className="l-cta-row">
                  <Pill href="/login" variant="dark" arrow="right">
                    Start your climb
                  </Pill>
                  <Pill href="#how" variant="outline">
                    How it works
                  </Pill>
                </div>
              </Reveal>
            </div>

            <div className="l-hero-right">
              <Reveal delay={400} y={16}>
                <HeroCard />
              </Reveal>
              <Reveal delay={550} y={14}>
                <div className="l-partners">
                  <p className="label">Daily quests include</p>
                  <ul>
                    {QUEST_NAMES.map((name) => (
                      <li key={name}>
                        <CircleDot /> {name}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal delay={900} y={0}>
            <div className="l-shell l-statusbar">
              <span>Free to join</span>
              <span className="mid">Works on your phone</span>
              <span>Scroll to explore ↓</span>
            </div>
          </Reveal>
        </section>

        {/* ---------- About ---------- */}
        <section id="about" className="l-about">
          <div className="l-shell l-about-grid">
            <div className="l-about-left">
              <LogoMark className="l-bigmark" />
              <Eyebrow>The Game</Eyebrow>
              <Reveal y={12} className="l-about-note">
                <LogoMark className="small" />
                <span>A habit game where every point is real.</span>
              </Reveal>
            </div>

            <div className="l-about-right">
              <Reveal plain>
                <h2 className="l-statement">
                  <Words text="Ascend turns your daily discipline into a game. Earn XP for the habits you really kept," />
                  <Words
                    muted
                    text="hold your streak with the Never Miss Twice rule, and climb from Mortal to Olympian with friends cheering you on."
                  />
                </h2>
              </Reveal>
              <Reveal y={12} delay={200}>
                <div className="l-about-foot">
                  <div>
                    <p className="l-foot-label">Find us online</p>
                    <div className="l-socials">
                      <a
                        href={REPO}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="accent"
                        aria-label="Ascend on GitHub"
                      >
                        <GitHub />
                      </a>
                    </div>
                  </div>
                  <Pill href="#how" variant="outline" arrow="right">
                    How it works
                  </Pill>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ---------- Band ---------- */}
        <section className="l-band-wrap">
          <ul className="l-shell l-band">
            {[
              { text: "Log", cls: "light" },
              { text: "Level", cls: "accent" },
              { text: "", cls: "dark" },
              { text: "Repeat", cls: "ghost" },
            ].map((tile, i) => (
              <li key={i}>
                <Reveal delay={i * 120} y={28}>
                  <div className={`l-tile ${tile.cls}`}>
                    {tile.text || <ArrowRight />}
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Features ---------- */}
        <section id="features" className="l-features">
          <div className="l-shell">
            <Reveal className="l-center">
              <Eyebrow boxed>Features</Eyebrow>
            </Reveal>
            <Reveal plain>
              <h2 className="l-h2 l-center-h lines">
                <span className="line">
                  <span className="line-in" style={d(120)}>
                    What&apos;s inside
                  </span>
                </span>
              </h2>
            </Reveal>

            <ul className="l-cards">
              {FEATURES.map((f, i) => (
                <li key={f.name}>
                  <Reveal delay={i * 90} y={48}>
                    <Link href="/login" className="l-card">
                      <div className="l-card-meta">
                        <span>
                          {f.tag} — 0{i + 1}
                        </span>
                        <span className="badge">
                          <ArrowUpRight />
                        </span>
                      </div>
                      <div className="l-card-mark" aria-hidden="true">
                        <LogoMark />
                      </div>
                      <div className="l-card-body">
                        <h3>{f.name}</h3>
                        <p>{f.text}</p>
                        <div className="chips">
                          {f.chips.map((c) => (
                            <span key={c}>{c}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="how" className="l-how">
          <div className="l-shell">
            <Reveal>
              <Eyebrow>How it works</Eyebrow>
            </Reveal>
            <Reveal plain>
              <h2 className="l-h2 l-how-title lines">
                <span className="line">
                  <span className="line-in" style={d(120)}>
                    Four steps,
                  </span>
                </span>
                <span className="line">
                  <span className="line-in" style={d(220)}>
                    every day
                  </span>
                </span>
              </h2>
            </Reveal>
            <ul className="l-rows">
              {STEPS.map((s, i) => (
                <li key={s.title}>
                  <Reveal delay={i * 80} y={24}>
                    <Link href="/login" className="l-row">
                      <span className="idx">0{i + 1}</span>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                      <span className="badge">
                        <ArrowUpRight />
                      </span>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Stats ---------- */}
        <section className="l-stats-wrap">
          <div className="l-shell">
            <Reveal y={40}>
              <div className="l-stats">
                <Eyebrow light>By the numbers</Eyebrow>
                <Reveal plain>
                  <h2 className="l-stats-title lines">
                    <span className="line">
                      <span className="line-in" style={d(120)}>
                        The game, in numbers.
                      </span>
                    </span>
                  </h2>
                </Reveal>
                <ul className="l-stats-grid">
                  {STATS.map((s, i) => (
                    <li key={s.label}>
                      <Reveal delay={i * 90} y={20}>
                        <div className="num">
                          <CountUp value={s.value} />
                        </div>
                        <p>{s.label}</p>
                      </Reveal>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="l-footer">
        <div className="l-shell l-footer-in">
          <div className="l-footer-cta">
            <Reveal plain>
              <h2 className="l-footer-h lines">
                <span className="line">
                  <span className="line-in" style={d(0)}>
                    Ready to ascend?
                  </span>
                </span>
                <span className="line">
                  <span className="line-in" style={d(100)}>
                    Start your first quest.
                  </span>
                </span>
              </h2>
            </Reveal>
            <Pill href="/login" variant="light" arrow="up-right">
              Create your account
            </Pill>
          </div>

          <div className="l-footer-cols">
            <div>
              <div className="l-footer-brand">
                <LogoMark /> Ascend
              </div>
              <p className="l-footer-tag">
                A habit game where every point is earned honestly.
              </p>
            </div>
            <div>
              <h4>Play</h4>
              <ul>
                <li>
                  <Link href="/login">Sign in</Link>
                </li>
                <li>
                  <Link href="/login">Create account</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4>Learn</h4>
              <ul>
                <li>
                  <a href="#about">The game</a>
                </li>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#how">How it works</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>Project</h4>
              <ul>
                <li>
                  <a href={REPO} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="l-legal">
            <span>© 2026 Ascend. All rights reserved.</span>
            <span>Play honest.</span>
          </div>
        </div>
        <div className="l-footer-mark" aria-hidden="true">
          ASCEND
        </div>
      </footer>
    </div>
  );
}