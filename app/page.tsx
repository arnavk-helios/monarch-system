import Link from "next/link";
import { prisma } from "../lib/prisma";
import { getUserStats, todayIn } from "../lib/xp";
import { getTimeZone } from "../lib/timezone";
import { getStreakInfo } from "../lib/streak";
import { greekTitle } from "../lib/greek";
import RankEmblem from "./RankEmblem";
import { requireUser } from "../lib/session";
import { toggleQuest } from "./actions";
import TopBar from "./TopBar";
import "./streak.css";

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
  // Not signed in? This sends the visitor to /login.
  const user = await requireUser();
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

  return (
    <main className="shell">
      <TopBar active="quests" />

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
            <strong>{totalXp.toLocaleString()} XP total</strong>
            <span>
              {rank.next
                ? `${(rank.xpForNextRank - rank.xpIntoRank).toLocaleString()} XP to rank ${rank.next.name}`
                : "Top rank reached"}
            </span>
          </p>
        </div>
      </section>

      <section className={`streak ${streak.state}`} aria-label="Your streak">
        <div className="streak-count">
          <strong>{streak.streak}</strong>
          <span>day streak</span>
        </div>
        <p className="streak-text">{streakMessages[streak.state]}</p>
      </section>

      <header className="board-head">
        <h1>Quest board</h1>
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
          {dailyXp} of {dailyMax} XP earned today
        </p>
      </header>

      {Object.entries(groups).map(([category, items]) => (
        <section className="group" key={category}>
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
      ))}

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