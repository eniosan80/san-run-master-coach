import { useLocation } from "wouter";
import { loadSession, saveSession, generateDefaultWeeklyPlan, WeeklyWorkout } from "../lib/store";
import { BottomNav } from "../components/BottomNav";

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconRun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="14" cy="3.5" r="1.5"/>
    <path d="M9 18l2.5-5.5L14 15l2-3.5 2.5 4.5"/>
    <path d="M6.5 11l2.5-4.5 4 1.5 3-3"/>
  </svg>
);
const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);
const IconChevron = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

function statusConfig(status: WeeklyWorkout["status"]) {
  switch (status) {
    case "done":
      return { color: "var(--terra)", bg: "rgba(196,98,45,0.1)", border: "rgba(196,98,45,0.35)", label: "Concluído", icon: <IconCheck /> };
    case "active":
      return { color: "var(--stone-lite)", bg: "rgba(58,95,111,0.18)", border: "rgba(58,95,111,0.45)", label: "Hoje", icon: <IconRun /> };
    case "next":
      return { color: "var(--fg)", bg: "var(--surface)", border: "var(--border)", label: "Próximo", icon: <IconRun /> };
    case "locked":
      return { color: "var(--muted)", bg: "var(--surface)", border: "var(--border)", label: "Bloqueado", icon: <IconLock /> };
    case "rest":
      return { color: "var(--muted)", bg: "var(--surface)", border: "var(--border)", label: "Descanso", icon: <IconMoon /> };
  }
}

const DAY_NAMES: Record<string, string> = {
  SEG: "Segunda", TER: "Terça", QUA: "Quarta",
  QUI: "Quinta", SEX: "Sexta", SÁB: "Sábado", DOM: "Domingo",
};

// Mapeamento label → índice JS (0=Dom…6=Sáb)
const DAY_LABEL_TO_INDEX: Record<string, number> = {
  DOM: 0, SEG: 1, TER: 2, QUA: 3, QUI: 4, SEX: 5, SÁB: 6,
};

export default function WeeklyPage() {
  const [, navigate] = useLocation();
  const session = loadSession();

  if (!session) { navigate("/"); return null; }

  if (!session.weeklyPlan) {
    session.weeklyPlan = generateDefaultWeeklyPlan(
      session.classification?.level ?? 1,
      session.athlete?.trainingDays,
    );
    saveSession(session);
  } else {
    // Regenerate if plan is stale (no blocks on training days)
    const hasBlocks = session.weeklyPlan.workouts.some(w => w.status !== "rest" && w.blocks && w.blocks.length > 0);
    if (!hasBlocks) {
      session.weeklyPlan = generateDefaultWeeklyPlan(
        session.classification?.level ?? 1,
        session.athlete?.trainingDays,
      );
      saveSession(session);
    }
  }

  const plan = session.weeklyPlan!;
  const canUnlockNext = plan.completedCount >= plan.requiredCount && !plan.unlocked;
  const progressPct = plan.requiredCount > 0
    ? Math.round((plan.completedCount / plan.requiredCount) * 100)
    : 0;

  return (
    <div className="shell screen-with-nav" style={{ overflow: "hidden" }}>
      {/* Ambient */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 160,
        background: "radial-gradient(ellipse 100% 100% at 50% 0%, rgba(45,74,86,0.18) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      <div className="screen" style={{ position: "relative", zIndex: 1 }}>
        <div className="page-content">

          {/* ── Header ── */}
          <div className="anim-up" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                background: "var(--surface2)", border: "1px solid var(--border2)",
                cursor: "pointer", color: "var(--muted)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <IconArrowLeft />
            </button>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 2 }}>
                Plano semanal
              </p>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--offwhite)", lineHeight: 1.1 }}>
                Semana {plan.weekNumber}
              </h2>
            </div>
            <img src="/logo-eagle.png" alt="" style={{ height: 36, objectFit: "contain", opacity: 0.6,
              filter: "drop-shadow(0 2px 8px rgba(196,98,45,0.2))" }} />
          </div>

          {/* ── Progress card ── */}
          <div className="card anim-up d1">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                Progresso semanal
              </p>
              <span style={{ fontSize: "0.85rem", color: "var(--terra)", fontWeight: 800 }}>
                {plan.completedCount}/{plan.requiredCount}
              </span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <p style={{
              fontSize: "0.75rem", marginTop: 10,
              color: plan.completedCount >= plan.requiredCount ? "var(--terra)" : "var(--muted)",
              fontWeight: plan.completedCount >= plan.requiredCount ? 700 : 400,
            }}>
              {plan.completedCount >= plan.requiredCount
                ? "Semana completa. Pronto para a próxima."
                : `Conclua ${plan.requiredCount} treinos para desbloquear a próxima semana.`
              }
            </p>
          </div>

          {/* ── Day cards ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {plan.workouts.map((w, i) => {
              const cfg = statusConfig(w.status);
              const isLocked = w.status === "locked";
              const isRest = w.status === "rest";
              // Força badge: verificar se esse dia está nos focusDays do plano de força
              const wDayIndex = DAY_LABEL_TO_INDEX[w.day] ?? -1;
              const isForcaDay = wDayIndex !== -1 && (session.forcaPlan?.focusDays ?? []).includes(wDayIndex);
              const isDone = w.status === "done";

              // Dia de força puro (descanso de corrida mas com treino de força)
              const isForcaOnly = isForcaDay && isRest;
              const forcaCfg = {
                color: "#5a8fa5",
                bg: "rgba(58,95,111,0.1)",
                border: "rgba(58,95,111,0.35)",
                label: "Força",
                icon: (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a8fa5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="6" y1="10" x2="4" y2="10"/><line x1="18" y1="10" x2="20" y2="10"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="9" y1="20" x2="15" y2="20"/>
                  </svg>
                ),
              };
              const displayCfg = isForcaOnly ? forcaCfg : cfg;

              return (
                <div
                  key={i}
                  className="anim-up"
                  style={{
                    animationDelay: `${0.04 + i * 0.06}s`,
                    background: displayCfg.bg,
                    border: `1px solid ${displayCfg.border}`,
                    borderRadius: 20,
                    padding: "16px",
                    opacity: isLocked ? 0.5 : 1,
                    cursor: isLocked ? "default" : (isRest && !isForcaOnly) ? "default" : "pointer",
                    boxShadow: isDone
                      ? "0 2px 16px rgba(196,98,45,0.08)"
                      : "0 2px 12px rgba(0,0,0,0.35)",
                    transition: "all 0.2s",
                  }}
                  onClick={() => {
                    if (isLocked) return;
                    if (isForcaOnly) {
                      navigate("/forca/sessao");
                      return;
                    }
                    if (!isRest) {
                      const s = loadSession();
                      if (s) {
                        s.workout = {
                          title: w.title,
                          duration: w.duration,
                          rpe: w.rpe,
                          instructions: w.instructions ?? "",
                          why: w.why ?? "",
                          successCriteria: w.successCriteria ?? "",
                          blocks: w.blocks,
                        };
                        saveSession(s);
                      }
                      navigate("/workout");
                    }
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Status circle */}
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                      background: "var(--surface2)", border: `1.5px solid ${displayCfg.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: displayCfg.color,
                      boxShadow: isDone ? "0 0 12px rgba(196,98,45,0.25)" : "none",
                    }}>
                      {displayCfg.icon}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: displayCfg.color }}>
                          {DAY_NAMES[w.day] ?? w.day}
                        </span>
                        <span style={{
                          fontSize: "0.6rem", padding: "2px 7px", borderRadius: 20,
                          border: `1px solid ${displayCfg.border}`, color: displayCfg.color, fontWeight: 700,
                          letterSpacing: "0.06em", textTransform: "uppercase",
                        }}>
                          {displayCfg.label}
                        </span>
                      </div>
                      <p style={{
                        color: isLocked ? "var(--muted)" : "var(--fg)",
                        fontWeight: 700, fontSize: "0.9rem", marginBottom: 5,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {isForcaOnly ? "Treino de Força" : w.title}
                      </p>
                      {isForcaOnly && (
                        <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8, lineHeight: 1.5 }}>
                          Mobilidade, ativação e força funcional
                        </p>
                      )}
                      {!isRest && !isLocked && (
                        <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 8, lineHeight: 1.5 }}>
                          {w.objective}
                        </p>
                      )}
                      {!isRest && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
                          {w.duration !== "—" && (
                            <span className="tag tag-muted" style={{ fontSize: "0.65rem" }}>{w.duration}</span>
                          )}
                          {w.rpe > 1 && !isLocked && (
                            <span className="tag tag-terra" style={{ fontSize: "0.65rem" }}>RPE {w.rpe}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {!isLocked && (!isRest || isForcaOnly) && (
                      <span style={{ color: "var(--muted)", flexShrink: 0 }}><IconChevron /></span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {canUnlockNext && (
            <div className="card-glow-terra anim-up" style={{ textAlign: "center", padding: "22px 20px" }}>
              <p style={{ fontWeight: 800, fontSize: "1rem", color: "var(--fg)", marginBottom: 6 }}>
                Semana completa
              </p>
              <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                Próxima semana disponível no painel.
              </p>
            </div>
          )}

        </div>
      </div>
      <BottomNav active="weekly" />
    </div>
  );
}
