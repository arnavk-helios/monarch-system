// The rank medallion: a round badge inside a laurel wreath.

type Props = { name: string; size?: number };

// Leaf positions: angles run from the bottom of the circle up the left side.
// The right side is the mirror image.
const ANGLES = Array.from({ length: 9 }, (_, i) => 100 + i * 18.75);

export default function RankEmblem({ name, size = 112 }: Props) {
  const leaves = ANGLES.flatMap((angle) =>
    [
      { radius: 50, tilt: 30 },
      { radius: 42, tilt: -30 },
    ].map(({ radius, tilt }) => {
      const rad = (angle * Math.PI) / 180;
      return {
        key: `${angle}-${radius}`,
        x: 60 + radius * Math.cos(rad),
        y: 60 + radius * Math.sin(rad),
        rotate: angle + tilt,
      };
    })
  );

  const longName = name.length > 2; // "Monarch" needs smaller letters

  return (
    <div
      className="emblem"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Rank ${name}`}
    >
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true">
        <g fill="currentColor" opacity="0.88">
          {leaves.map((leaf) => (
            <g key={leaf.key}>
              <ellipse
                rx="3"
                ry="8"
                transform={`translate(${leaf.x.toFixed(2)} ${leaf.y.toFixed(2)}) rotate(${leaf.rotate.toFixed(1)})`}
              />
              <ellipse
                rx="3"
                ry="8"
                transform={`translate(${(120 - leaf.x).toFixed(2)} ${leaf.y.toFixed(2)}) rotate(${(-leaf.rotate).toFixed(1)})`}
              />
            </g>
          ))}
        </g>
        <circle cx="60" cy="60" r="33" fill="var(--panel)" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="60" cy="60" r="28.5" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      </svg>
      <span
        className="emblem-letter"
        style={{ fontSize: `${(size * (longName ? 0.13 : 0.3)).toFixed(1)}px` }}
      >
        {name}
      </span>
    </div>
  );
}