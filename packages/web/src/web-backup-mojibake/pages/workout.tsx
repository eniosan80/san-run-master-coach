import { useLocation } from "wouter";
import { loadSession, WorkoutBlock } from "../lib/store";
import { BottomNav } from "../components/BottomNav";

/* ─── RPE helpers ──────────────────────────────────────── */
const rpeColor = (rpe: number) => {
  if (rpe <= 3) return "#4A9AAD";
  if (rpe <= 5) return "#C4A032";
  if (rpe <= 7) return "#C4622D";
  return "#C4322D";
};
const rpeLabel = (rpe: number) => {
  if (rpe <= 2) return "Muito Leve";
  if (rpe <= 4) return "Leve";
  if (rpe <= 6) return "Moderado";
  if (rpe <= 8) return "Intenso";
  return "Máximo";
};

/* ─── Duration format ─────────────────────────────────── */
function fmtMin(min: number): string {
  if (min <= 0) return "—";
  if (min < 1) {
    const s = Math.round(min * 60);
    return `${s}s`;
  }
  if (min >= 60) {
    const h = Math.floor(min / 60);
    const m = Math.round(min % 60);
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
  // show as mm:ss when < 1min is false, but show as Xmin normally
  // for interval display: 1.0 → "1:00", 1.5 → "1:30"
  if (Number.isInteger(min)) return `${min}min`;
  const wholeMins = Math.floor(min);
  const secs = Math.round((min - wholeMins) * 60);
  return secs > 0 ? `${wholeMins}:${String(secs).padStart(2, "0")}` : `${wholeMins}min`;
}

function parseDurationToMin(d: string): number {
  const hMatch = d.match(/(\d+)\s*h/);
  const mMatch = d.match(/(\d+)\s*min/);
  const h = hMatch ? parseInt(hMatch[1]) : 0;
  const m = mMatch ? parseInt(mMatch[1]) : parseInt(d) || 0;
  return h * 60 + m;
}

/* ─── Block label display helpers ─────────────────────── */
function intensityBadge(rpe: number): string {
  if (rpe <= 2) return "LE";   // leve
  if (rpe <= 4) return "LE";
  if (rpe <= 6) return "MO";   // moderado
  if (rpe <= 8) return "FO";   // forte
  return "MF";                  // muito forte
}

/* ─── Icons ───────────────────────────────────────────── */
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconBar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M18 20V10M12 20V4M6 20v-6"/>
  </svg>
);
const IconInfo = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
  </svg>
);
const IconCheck = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconPlay = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconTarget = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconRepeat = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

/* ─────────────────────────────────────────────────────── */
/* CAMADA 1 — RESUMO DO ATLETA                            */
/* ─────────────────────────────────────────────────────── */

/** Extrai um "preview rápido" tipo "FARTLEK: 10 x 1'/2'" a partir dos blocks */
function buildQuickPreview(blocks: WorkoutBlock[], title: string): string {
  // encontra o bloco principal de série
  const mainSeries = blocks.find(b => b.type === "series");
  if (mainSeries && mainSeries.reps && mainSeries.workDurationMin) {
    const workFmt = fmtMin(mainSeries.workDurationMin);
    const restFmt = mainSeries.restDurationMin ? fmtMin(mainSeries.restDurationMin) : null;
    const rep = mainSeries.reps;
    return restFmt
      ? `${rep}x ${workFmt}/${restFmt}`
      : `${rep}x ${workFmt}`;
  }
  // continuous principal
  const mainCont = blocks.find(b => b.type === "continuous");
  if (mainCont) return fmtMin(mainCont.durationMin ?? 0);
  return "";
}

function getTotalMinFromBlocks(blocks: WorkoutBlock[]): number {
  let total = 0;
  for (const b of blocks) {
    if (b.type === "series") {
      total += ((b.workDurationMin ?? 0) + (b.restDurationMin ?? 0)) * (b.reps ?? 1);
    } else {
      total += b.durationMin ?? 0;
    }
  }
  return total;
}

/* ─────────────────────────────────────────────────────── */
/* CAMADA 2 — ESTRUTURA EXECUTÁVEL                        */
/* ─────────────────────────────────────────────────────── */

type BlockSection =
  | { kind: "warmup";   label: string; durationMin: number; rpe: number }
  | { kind: "cooldown"; label: string; durationMin: number; rpe: number }
  | { kind: "continuous"; label: string; durationMin: number; rpe: number }
  | { kind: "series"; label: string; reps: number; workDurationMin: number; workRpe: number; restDurationMin: number; restRpe: number; restLabel: string };

function blocksToSections(blocks: WorkoutBlock[]): BlockSection[] {
  return blocks.map(b => {
    if (b.type === "warmup") return { kind: "warmup",   label: b.label, durationMin: b.durationMin ?? 0, rpe: b.rpe ?? 3 };
    if (b.type === "cooldown") return { kind: "cooldown", label: b.label, durationMin: b.durationMin ?? 0, rpe: b.rpe ?? 3 };
    if (b.type === "continuous") return { kind: "continuous", label: b.label, durationMin: b.durationMin ?? 0, rpe: b.rpe ?? 5 };
    // series
    return {
      kind: "series",
      label: b.label,
      reps: b.reps ?? 1,
      workDurationMin: b.workDurationMin ?? 0,
      workRpe: b.workRpe ?? b.rpe ?? 6,
      restDurationMin: b.restDurationMin ?? 0,
      restRpe: b.restRpe ?? 2,
      restLabel: b.restLabel || "Recuperação",
    };
  });
}

/* ─── Section cards ───────────────────────────────────── */

function WarmupSection({ s }: { s: Extract<BlockSection, { kind: "warmup" | "cooldown" }> }) {
  const isWarmup = s.kind === "warmup";
  const accent = "#4A9AAD";
  const tag = isWarmup ? "AQUECIMENTO" : "DESAQUECIMENTO";

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${accent}30`,
      background: `linear-gradient(135deg, ${accent}0d 0%, rgba(11,11,15,0.95) 100%)`,
      overflow: "hidden",
    }}>
      {/* Tag bar */}
      <div style={{
        padding: "8px 16px",
        background: `${accent}18`,
        borderBottom: `1px solid ${accent}22`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", color: accent, textTransform: "uppercase" }}>{tag}</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: accent }}>{fmtMin(s.durationMin)}</span>
      </div>
      {/* Content */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--offwhite)" }}>{s.label}</span>
        <span style={{
          fontSize: "0.65rem", fontWeight: 700, color: accent,
          background: `${accent}15`, border: `1px solid ${accent}30`,
          borderRadius: 6, padding: "3px 8px",
        }}>RPE {s.rpe}</span>
      </div>
    </div>
  );
}

function ContinuousSection({ s }: { s: Extract<BlockSection, { kind: "continuous" }> }) {
  const rpe = s.rpe;
  const accent = rpeColor(rpe);

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${accent}30`,
      background: `linear-gradient(135deg, ${accent}0d 0%, rgba(11,11,15,0.95) 100%)`,
      overflow: "hidden",
    }}>
      <div style={{
        padding: "8px 16px",
        background: `${accent}18`,
        borderBottom: `1px solid ${accent}22`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", color: accent, textTransform: "uppercase" }}>BLOCO CONTÍNUO</span>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: accent }}>{fmtMin(s.durationMin)}</span>
      </div>
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--offwhite)" }}>{s.label}</span>
        <span style={{
          fontSize: "0.65rem", fontWeight: 700, color: accent,
          background: `${accent}15`, border: `1px solid ${accent}30`,
          borderRadius: 6, padding: "3px 8px",
        }}>RPE {rpe} · {rpeLabel(rpe)}</span>
      </div>
    </div>
  );
}

function SeriesSection({ s }: { s: Extract<BlockSection, { kind: "series" }> }) {
  const workAccent = rpeColor(s.workRpe);
  const restAccent = "#3A5F6F";

  return (
    <div style={{
      borderRadius: 16, border: `1px solid ${workAccent}35`,
      background: `linear-gradient(135deg, ${workAccent}0a 0%, rgba(11,11,15,0.98) 100%)`,
      overflow: "hidden",
    }}>
      {/* Header: BLOCO PRINCIPAL + reps badge */}
      <div style={{
        padding: "8px 16px",
        background: `${workAccent}18`,
        borderBottom: `1px solid ${workAccent}22`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", color: workAccent, textTransform: "uppercase" }}>BLOCO PRINCIPAL</span>
        {/* Reps pill — destaque visual forte */}
        <div style={{
          display: "flex", alignItems: "center", gap: 5,
          background: workAccent, borderRadius: 20, padding: "4px 10px",
        }}>
          <IconRepeat />
          <span style={{ fontSize: "0.72rem", fontWeight: 900, color: "#fff", letterSpacing: "0.04em" }}>{s.reps}×</span>
        </div>
      </div>

      {/* Work row */}
      <div style={{
        padding: "12px 16px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px dashed ${workAccent}20`,
        paddingBottom: 12,
      }}>
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: workAccent, marginBottom: 4 }}>
            CORRIDA {intensityBadge(s.workRpe)}
          </p>
          <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--offwhite)", lineHeight: 1.1 }}>{s.label}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: "1.1rem", fontWeight: 900, color: workAccent, letterSpacing: "-0.03em", lineHeight: 1 }}>{fmtMin(s.workDurationMin)}</p>
          <p style={{ fontSize: "0.6rem", fontWeight: 700, color: workAccent, opacity: 0.8, marginTop: 2 }}>RPE {s.workRpe}</p>
        </div>
      </div>

      {/* Rest row */}
      {s.restDurationMin > 0 && (
        <div style={{
          padding: "12px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: restAccent, marginBottom: 4 }}>
              RECUPERAÇÃO
            </p>
            <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--fg)", lineHeight: 1.1 }}>{s.restLabel}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "1.1rem", fontWeight: 900, color: "var(--stone-lite)", letterSpacing: "-0.03em", lineHeight: 1 }}>{fmtMin(s.restDurationMin)}</p>
            <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--stone-lite)", opacity: 0.8, marginTop: 2 }}>RPE {s.restRpe}</p>
          </div>
        </div>
      )}

      {/* Total do bloco */}
      <div style={{
        margin: "0 16px 12px",
        background: "var(--surface2)", borderRadius: 10,
        padding: "7px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Volume total do bloco</span>
        <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--offwhite)" }}>
          {fmtMin((s.workDurationMin + s.restDurationMin) * s.reps)}
        </span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────── */
/* PAGE                                                   */
/* ─────────────────────────────────────────────────────── */
export default function WorkoutPage() {
  const [, navigate] = useLocation();
  const session = loadSession();

  if (!session) { navigate("/"); return null; }

  const { workout, classification } = session;
  const rpe = workout.rpe;
  const color = rpeColor(rpe);

  // Blocks source of truth
  const blocks: WorkoutBlock[] = workout.blocks ?? [];
  const hasBlocks = blocks.length > 0;

  const totalMin = hasBlocks
    ? getTotalMinFromBlocks(blocks)
    : parseDurationToMin(workout.duration);

  const quickPreview = hasBlocks ? buildQuickPreview(blocks, workout.title) : "";
  const sections = hasBlocks ? blocksToSections(blocks) : [];

  return (
    <div className="shell">
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 240,
        background: `radial-gradient(ellipse 100% 100% at 50% 0%, ${color}16 0%, transparent 65%)`,
        pointerEvents: "none", zIndex: 0,
      }} />

      <div className="screen screen-with-nav" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* ── Header ── */}
          <div style={{ paddingTop: 52 }} className="anim-in">
            <button
              onClick={() => navigate("/weekly")}
              style={{
                width: 36, height: 36, borderRadius: 10,
                background: "var(--surface2)", border: "1px solid var(--border2)",
                cursor: "pointer", color: "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <IconArrowLeft />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span className="tag tag-stone">{classification.phase}</span>
              <span className="tag tag-muted">Semana 1</span>
            </div>
            <h1 className="t-h1" style={{ marginBottom: 6, lineHeight: 1.15, fontSize: "1.55rem" }}>{workout.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 24, height: 2, background: "var(--terra)", borderRadius: 2 }} />
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.14em", color: "var(--terra)", textTransform: "uppercase" }}>
                Treino de hoje
              </p>
            </div>
          </div>

          {/* ── Métricas rápidas ── */}
          <div className="anim-up d1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <div className="card" style={{ textAlign: "center", padding: "14px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <span style={{ color: "var(--stone-lite)" }}><IconClock /></span>
              <p style={{ fontWeight: 700, color: "var(--offwhite)", fontSize: "0.85rem", lineHeight: 1.2 }}>{workout.duration}</p>
              <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Duração</p>
            </div>
            <div style={{
              background: `linear-gradient(135deg, ${color}14 0%, rgba(15,15,21,0.9) 100%)`,
              border: `1px solid ${color}30`, borderRadius: 20,
              padding: "14px 6px", textAlign: "center",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            }}>
              <span style={{ color, fontWeight: 900, fontSize: "1.6rem", lineHeight: 1, letterSpacing: "-0.04em" }}>{rpe}</span>
              <p style={{ fontWeight: 700, fontSize: "0.62rem", color, letterSpacing: "0.04em" }}>{rpeLabel(rpe)}</p>
              <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>RPE alvo</p>
            </div>
            <div className="card" style={{ textAlign: "center", padding: "14px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
              <span style={{ color: "var(--terra)" }}><IconBar /></span>
              <p style={{ fontWeight: 700, color: "var(--offwhite)", fontSize: "0.85rem" }}>N{classification.level}</p>
              <p style={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>Nível</p>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              CAMADA 1 — RESUMO DO ATLETA
          ══════════════════════════════════════════════ */}
          <div className="anim-up d2" style={{
            borderRadius: 20,
            border: "1px solid var(--border2)",
            background: "var(--surface)",
            overflow: "hidden",
          }}>
            {/* Cabeçalho da seção */}
            <div style={{
              padding: "12px 18px",
              borderBottom: "1px solid var(--border2)",
              background: "var(--surface2)",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
                📋 PRÉVIA DO TREINO
              </span>
            </div>

            <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Nome e preview rápido */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--offwhite)", lineHeight: 1.2, marginBottom: 4 }}>
                    {workout.title.toUpperCase()}
                  </p>
                  {quickPreview && (
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: color, letterSpacing: "0.02em" }}>
                      {quickPreview}
                    </p>
                  )}
                </div>
                {/* RPE visual */}
                <div style={{ flexShrink: 0, textAlign: "center" }}>
                  <div style={{ display: "flex", gap: 2 }}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} style={{
                        width: 5, height: 16, borderRadius: 2,
                        background: i < rpe ? color : "var(--border2)",
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: "0.58rem", fontWeight: 700, color: "var(--muted)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    RPE {rpe}
                  </p>
                </div>
              </div>

              {/* Instruções de execução */}
              <div>
                <p style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8 }}>
                  Como executar
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--fg)", lineHeight: 1.75 }}>
                  {workout.instructions}
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════
              CAMADA 2 — ESTRUTURA EXECUTÁVEL
          ══════════════════════════════════════════════ */}
          {hasBlocks && (
            <div className="anim-up d3">
              {/* Cabeçalho da seção */}
              <div style={{
                padding: "12px 18px",
                borderRadius: "16px 16px 0 0",
                border: "1px solid var(--border2)",
                borderBottom: "none",
                background: "var(--surface2)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
                  ESTRUTURA DO TREINO
                </span>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--muted)" }}>
                  {fmtMin(totalMin)} total
                </span>
              </div>

              {/* Sections */}
              <div style={{
                border: "1px solid var(--border2)",
                borderRadius: "0 0 20px 20px",
                overflow: "hidden",
                display: "flex", flexDirection: "column", gap: 1,
                background: "var(--border2)",
              }}>
                {sections.map((s, i) => (
                  <div key={i} style={{ background: "var(--bg)" }}>
                    {s.kind === "warmup" || s.kind === "cooldown"
                      ? <WarmupSection s={s as Extract<BlockSection, { kind: "warmup" | "cooldown" }>} />
                      : s.kind === "continuous"
                      ? <ContinuousSection s={s as Extract<BlockSection, { kind: "continuous" }>} />
                      : <SeriesSection s={s as Extract<BlockSection, { kind: "series" }>} />
                    }
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Critério de Sucesso ── */}
          <div className="anim-up d4" style={{
            background: `linear-gradient(135deg, rgba(196,98,45,0.08) 0%, rgba(15,15,21,0.95) 100%)`,
            border: "1px solid rgba(196,98,45,0.22)",
            borderRadius: 20, padding: "18px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: "var(--terra)" }}><IconTarget /></span>
              <p style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--terra)" }}>
                Critério de Sucesso
              </p>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--offwhite)", lineHeight: 1.7 }}>
              {workout.successCriteria}
            </p>
          </div>

          {/* ── Objetivo ── */}
          <div className="card-stone anim-up d5">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span style={{ color: "var(--stone-lite)" }}><IconInfo /></span>
              <p style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--stone-lite)" }}>
                Objetivo deste treino
              </p>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--fg)", lineHeight: 1.75 }}>
              {workout.why}
            </p>
          </div>

          {/* Motto */}
          <div style={{ textAlign: "center", padding: "4px 0 20px" }}>
            <p style={{ color: "var(--muted)", fontSize: "0.75rem", fontStyle: "italic" }}>
              "Resultado vem do processo. Constância em movimento."
            </p>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding: "10px 20px 0", background: "var(--bg)", position: "relative", zIndex: 1 }}>
        <button className="btn btn-primary" onClick={() => navigate("/timer")}>
          <IconPlay />
          Iniciar Treino
        </button>
      </div>

      <BottomNav active="workout" />
    </div>
  );
}
