import Link from "next/link";
import { prisma } from "../lib/prisma";
import { getUserStats, todayIn } from "../lib/xp";
import { getTimeZone } from "../lib/timezone";
import { getStreakInfo } from "../lib/streak";
import { greekTitle } from "../lib/greek";
import RankEmblem from "./RankEmblem";
import { getCurrentUser } from "../lib/session";
import Landing from "./Landing";
import { toggleQuest } from "./actions";
import TopBar from "./TopBar";
import { AnimatedNumber, LiquidReveal, Reveal } from "./_landing/client";

// Always fetch fresh numbers from the database.
export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  routine: "Routine",
  fitness: "Training",
  nutrition: "Fuel",
  mind: "Mind",
  looks: "Presence",
  recovery: "Recovery",
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ rankup?: string; welcome?: string }>;
}) {
  // Not signed in? Show the public landing page instead of the quest board.
  const user = await getCurrentUser();
  if (!user) return <Landing />;
  const timeZone = await getTimeZone();
  const today = todayIn(timeZone);
  const { rankup, welcome } = await searchParams;

  const [quests, logs, stats, streak] = await Promise.all([
    prisma.quest.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.questLog.findMany({ where: { userId: user.id, date: today } }),
    getUserStats(user.id),
    getStreakInfo(user.id, timeZone),
  ]);

  // Show the rank-up screen only if you really earned that rank in the last 10 minutes.
  let rankUp: { name: string; xp: number } | null = null;
  if (rankup && /^[A-Za-z]{1,7}$/.test(rankup)) {
    const earned = await prisma.userAchievement.findFirst({
      where: {
        userId: user.id,
        earnedAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
        achievement: { slug: `rank-up-${rankup.toLowerCase()}` },
      },
      include: { achievement: { select: { name: true, xp: true } } },
    });
    if (earned) {
      rankUp = {
        name: earned.achievement.name.replace("Rank Up: ", ""),
        xp: earned.achievement.xp,
      };
    }
  }

  const streakMessages = {
    none: "No streak yet. Finish a quest today to start one.",
    pending: "Finish any quest today to keep your streak going.",
    recovery: `You missed yesterday. Never miss twice: finish a quest today to keep your streak and earn +${streak.bonus} XP.`,
    extended: streak.recoveredToday
      ? `You came back after a missed day. +${streak.bonus} XP recovery bonus earned.`
      : "Streak extended for today. Come back tomorrow.",
  };

  const doneIds = new Set(logs.map((log) => log.questId));
  const dailyMax = quests.reduce((sum, q) => sum + q.xp, 0);
  const dailyXp = quests
    .filter((q) => doneIds.has(q.id))
    .reduce((sum, q) => sum + q.xp, 0);
  const dailyPercent = dailyMax > 0 ? Math.round((dailyXp / dailyMax) * 100) : 0;

  const { totalXp, rank } = stats;

  // Group quests by category, keeping the original order.
  const groups = quests.reduce<Record<string, typeof quests>>((acc, quest) => {
    (acc[quest.category] ??= []).push(quest);
    return acc;
  }, {});

  const delay = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

  return (
    <main className="dash">
      {/* ---------- Hero: the statue, with the cursor reveal ---------- */}
      <section className="dash-hero">
        <LiquidReveal beforeSrc="/hero/before.png" afterSrc="/hero/after.jpg" />
        <div className="dash-veil" />
       
        <div className="shell dash-hero-in">
          <TopBar active="quests" />

          <Reveal delay={100} y={10}>
            <p className="dash-kicker">Welcome back, {user.name}</p>
          </Reveal>

          <Reveal plain>
            <h1 className="dash-title lines">
              <span className="line">
                <span className="line-in" style={delay(150)}>
                  Quest
                </span>
              </span>
              <span className="line">
                <span className="line-in" style={delay(270)}>
                  board
                </span>
              </span>
            </h1>
          </Reveal>

          <Reveal delay={400} y={12}>
            <div className="dash-today">
              <div
                className="bar small"
                role="progressbar"
                aria-label="XP earned today"
                aria-valuenow={dailyPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="bar-fill" style={{ width: `${dailyPercent}%` }} />
              </div>
              <p className="today-line">
                <AnimatedNumber value={dailyXp} /> of {dailyMax} XP earned today
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- Everything below slides in as you scroll ---------- */}
      <div className="shell dash-body">
        {welcome && (
          <section className="honor" aria-label="A reminder">
            <p className="honor-text">
              Play honest. Log only what you truly did. Cheating the board only cheats you, so be
              real with yourself and the climb will be real too.
            </p>
            <Link href="/" className="honor-btn">
              I will
            </Link>
          </section>
        )}

        <Reveal delay={150} y={30}>
          <section className="status" aria-label="Your rank">
            <RankEmblem name={rank.current.name} size={116} />

            <div className="status-body">
              <p className="hunter">{user.name}</p>
              <p className="rank-title">{greekTitle(rank.current.name)}</p>
              <p className="rank-label">Rank {rank.current.name}</p>
              <div
                className="bar"
                role="progressbar"
                aria-label="Progress to next rank"
                aria-valuenow={rank.percent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="bar-fill" style={{ width: `${rank.percent}%` }} />
              </div>
              <p className="xp-line">
                <strong>
                  <AnimatedNumber value={totalXp} /> XP total
                </strong>
                <span>
                  {rank.next
                    ? `${(rank.xpForNextRank - rank.xpIntoRank).toLocaleString()} XP to rank ${rank.next.name}`
                    : "Top rank reached"}
                </span>
              </p>
            </div>
          </section>
        </Reveal>

        <Reveal delay={250} y={24}>
          <section className={`streak ${streak.state}`} aria-label="Your streak">
            <div className="streak-count">
              <strong>
                <AnimatedNumber value={streak.streak} />
              </strong>
              <span>day streak</span>
            </div>
            <p className="streak-text">{streakMessages[streak.state]}</p>
          </section>
        </Reveal>

        {Object.entries(groups).map(([category, items], index) => (
          <Reveal key={category} delay={index * 80} y={24}>
            <section className="group">
              <h2>{CATEGORY_LABELS[category] ?? category}</h2>
              <ul className="quests">
                {items.map((quest) => {
                  const done = doneIds.has(quest.id);
                  return (
                    <li key={quest.id}>
                      <form action={toggleQuest}>
                        <input type="hidden" name="questId" value={quest.id} />
                        <input type="hidden" name="done" value={String(done)} />
                        <button type="submit" className="quest" aria-pressed={done}>
                          <span className="check" aria-hidden="true">
                            <svg viewBox="0 0 16 16" width="14" height="14">
                              <path
                                d="M3 8.5l3 3 7-7"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span className="q-name">{quest.name}</span>
                          <span className="q-xp">+{quest.xp} XP</span>
                        </button>
                      </form>
                    </li>
                  );
                })}
              </ul>
            </section>
          </Reveal>
        ))}
      </div>

      {rankUp && (
        <div className="rankup" role="dialog" aria-modal="true" aria-labelledby="rankup-title">
          <div className="rankup-card">
            <div className="rankup-emblem">
              <RankEmblem name={rankUp.name} size={150} />
            </div>
            <p className="rankup-kicker">Rank up</p>
            <h2 id="rankup-title">{greekTitle(rankUp.name)}</h2>
            <p className="rankup-sub">Rank {rankUp.name} reached</p>
            <p className="rankup-bonus">+{rankUp.xp} XP bonus</p>
            <Link href="/" className="rankup-btn">
              Continue
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}