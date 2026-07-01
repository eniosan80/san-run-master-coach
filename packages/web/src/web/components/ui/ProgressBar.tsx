interface ProgressBarProps {
  current: number;
  total: number;
  label?: string;
}

export function ProgressBar({ current, total, label }: ProgressBarProps) {
  const pct = Math.round((current / total) * 100);

  return (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-[#A0A0A0]">{label || `Etapa ${current} de ${total}`}</span>
        <span className="text-xs text-[#00FF88] font-semibold">{pct}%</span>
      </div>
      <div className="h-1 bg-[#1C1C24] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#00FF88] to-[#00CC6A] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
