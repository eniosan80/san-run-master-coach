interface LevelBadgeProps {
  level: number;
  levelName: string;
  size?: "sm" | "md" | "lg";
}

const levelConfig = [
  {},
  { color: "#A0A0A0", bg: "rgba(160,160,160,0.12)", label: "NV.1" },
  { color: "#3A5F6F", bg: "rgba(58,95,111,0.2)", label: "NV.2" },
  { color: "#E36B3B", bg: "rgba(227,107,59,0.15)", label: "NV.3" },
  { color: "#00FF88", bg: "rgba(0,255,136,0.12)", label: "NV.4" },
  { color: "#FFD700", bg: "rgba(255,215,0,0.12)", label: "NV.5" },
];

export function LevelBadge({ level, levelName, size = "md" }: LevelBadgeProps) {
  const config = levelConfig[level] || levelConfig[1];

  const sizes = {
    sm: "text-xs px-3 py-1",
    md: "text-sm px-4 py-1.5",
    lg: "text-base px-5 py-2",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ${sizes[size]}`}
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.color}30` }}
    >
      <span className="text-xs opacity-80">{config.label}</span>
      {levelName}
    </span>
  );
}
