/**
 * TREINO GUIADO SAN RUN � Execu��o coaching
 * Motor intocado � visual identity v3, VOICE_HOOK comments, no emojis
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  loadSession,
  saveSession,
  addWorkoutRecord,
  expandBlocksToSteps,
  expandWorkoutBlocksToSteps,
  ExecStep,
} from "../lib/store";

// --- palette ------------------------------------------------------------------
const C = {
  bg:        "#0B0B0F",
  card:      "#141422",
  surface2:  "#1C1C28",
  terracota: "#C4622D",
  bluestone: "#3A5F6F",
  slate:     "#5A5A8A",
  offwhite:  "#F5F0EB",
  muted:     "#A0A0A0",
  border:    "#252530",
} as const;

// --- helpers ------------------------------------------------------------------

function pad(n: number) { return String(Math.floor(n)).padStart(2, "0"); }

function fmtTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

function phaseColor(phase: ExecStep["phase"] | "free"): string {
  switch (phase) {
    case "work":     return C.terracota;
    case "rest":     return C.bluestone;   // fix: era #3A7A5A (verde)
    case "warmup":   return C.bluestone;
    case "cooldown": return C.slate;
    case "free":     return C.bluestone;
    default:         return C.terracota;
  }
}

function phaseLabel(phase: ExecStep["phase"]): string {
  switch (phase) {
    case "work":     return "ESFOR�O";
    case "rest":     return "RECUPERA��O";
    case "warmup":   return "AQUECIMENTO";
    case "cooldown": return "DESAQUECIMENTO";
  }
}

function phaseObjective(step: ExecStep): string {
  // Usa notes reais do bloco se existir
  if (step.notes) return step.notes;
  if (step.phase === "warmup")   return "Ative o corpo. Construa o ritmo gradualmente.";
  if (step.phase === "cooldown") return "Reduza a intensidade. Permita a recupera��o.";
  if (step.phase === "rest")     return "Respire fundo. Prepare-se para o pr�ximo esfor�o.";
  const lbl = step.label.toLowerCase();
  if (lbl.includes("forte") || lbl.includes("tiro") || lbl.includes("r�pid"))
    return "D� o m�ximo. Este � o momento de evoluir.";
  if (lbl.includes("progressiv"))
    return "Aumente o ritmo gradualmente. Sinta a progress�o.";
  return "Mantenha o ritmo. Cada passada conta.";
}

function coachMessage(
  phase: ExecStep["phase"],
  progress: number,
  isFirst: boolean,
  isLast: boolean,
): string {
  if (isFirst && progress < 0.15) {
    if (phase === "warmup")   return "Controle o ritmo. O treino come�a agora.";
    if (phase === "work")     return "Foco total. Resultado vem do processo.";
    if (phase === "rest")     return "Respire. Voc� est� no caminho certo.";
    if (phase === "cooldown") return "Quase l�. Deixe o corpo desacelerar.";
  }
  if (progress >= 0.45 && progress <= 0.55) {
    if (phase === "work") return "Mantenha a estrat�gia. Voc� est� no ritmo.";
    if (phase === "rest") return "Aproveite a recupera��o. O pr�ximo bloco espera.";
    return "Metade do caminho. Continue constante.";
  }
  if (progress > 0.8) {
    if (isLast)           return "Mais um passo constru�do. Voc� chegou.";
    if (phase === "work") return "Quase l�. Segura o ritmo at� o fim.";
    if (phase === "rest") return "Prepare-se. O pr�ximo bloco come�a em breve.";
    return "Finalizando esta etapa. Mente San, Corpo Run.";
  }
  if (phase === "work")     return "Cada passo faz parte do plano.";
  if (phase === "rest")     return "Recupera��o � parte do treino.";
  if (phase === "warmup")   return "Corpo aquecendo. Ritmo se formando.";
  if (phase === "cooldown") return "Const�ncia em movimento.";
  return "Voc� est� sendo guiado pelo SAN RUN.";
}

// --- SVG icons ----------------------------------------------------------------

const IconPlay = ({ color = "#fff", size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <polygon points="5,2 17,10 5,18" fill={color} />
  </svg>
);
const IconPause = ({ color = C.offwhite, size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <rect x="4" y="2" width="4.5" height="16" rx="2" fill={color} />
    <rect x="11.5" y="2" width="4.5" height="16" rx="2" fill={color} />
  </svg>
);
const IconSkip = ({ color = C.muted, size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <polygon points="3,2 14,10 3,18" fill={color} />
    <rect x="15" y="2" width="3" height="16" rx="1.5" fill={color} />
  </svg>
);
const IconStop = ({ color = C.terracota, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="2.5" fill={color} />
  </svg>
);
const IconChev = ({ color = C.muted, size = 14 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
    <path d="M5 3L9 7L5 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconPulse = ({ color = C.muted, size = 16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <polyline points="1,8 4,8 6,3 8,13 10,5.5 12,10.5 14,8 15,8"
      stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);
const IconCheck = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
    <circle cx="26" cy="26" r="24" stroke={C.terracota} strokeWidth="1.5" />
    <path d="M14 26L23 35L38 19" stroke={C.terracota} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconArrowRight = ({ color = "#fff", size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
    <path d="M3 9H15M15 9L10 4M15 9L10 14" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- anel de progresso --------------------------------------------------------

function Ring({
  size, stroke, progress, color, bg = C.surface2, children,
}: {
  size: number; stroke: number; progress: number; color: string;
  bg?: string; children?: React.ReactNode;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const off = circ * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={off}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.35s ease" }} />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>{children}</div>
    </div>
  );
}

// --- tela de finaliza��o ------------------------------------------------------

function FinishScreen({
  elapsed, rpe, obs, workoutName, stepsCompleted, totalSteps,
  onRpeChange, onObsChange, onSave,
}: {
  elapsed: number; rpe: number; obs: string;
  workoutName: string; stepsCompleted: number; totalSteps?: number;
  onRpeChange: (v: number) => void;
  onObsChange: (v: string) => void;
  onSave: () => void;
}) {
  const rpeLabels: Record<number, string> = {
    1: "Muito leve", 2: "Leve", 3: "Moderado", 4: "Moderado forte",
    5: "Forte", 6: "Forte+", 7: "Muito forte", 8: "Intenso",
    9: "Muito intenso", 10: "M�ximo absoluto",
  };
  // Milestone labels para mostrar inline no grid RPE
  const rpeMilestone: Record<number, string> = { 1: "Leve", 5: "Forte", 8: "Intenso", 10: "M�ximo" };

  const canSave = rpe > 0;

  return (
    <div style={{ height: "100dvh", background: C.bg, color: C.offwhite, display: "flex", flexDirection: "column", overflow: "hidden" }}>

      {/* -- hero -- */}
      <div style={{
        background: `linear-gradient(180deg, #141422 0%, ${C.bg} 100%)`,
        padding: "36px 24px 24px", textAlign: "center",
        borderBottom: `1px solid ${C.surface2}`,
        flexShrink: 0,
      }}>
        <div style={{ marginBottom: 12 }}><IconCheck /></div>
        <div style={{
          fontSize: 9, letterSpacing: 4, color: C.terracota,
          textTransform: "uppercase", fontWeight: 700, marginBottom: 6,
        }}>
          TREINO CONCLU�DO
        </div>
        {/* workout name */}
        <div style={{
          fontSize: 18, fontWeight: 800, color: C.offwhite,
          marginBottom: 14, lineHeight: 1.2,
          maxWidth: 280, margin: "0 auto 14px",
        }}>
          {workoutName}
        </div>

        {/* stats row */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          {/* tempo */}
          <div style={{
            flex: 1, background: C.card, borderRadius: 14,
            padding: "12px 8px", border: `1px solid ${C.surface2}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -1, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
              {fmtTime(elapsed)}
            </div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>
              Tempo total
            </div>
          </div>
          {/* etapas */}
          {totalSteps && totalSteps > 1 && (
            <div style={{
              flex: 1, background: C.card, borderRadius: 14,
              padding: "12px 8px", border: `1px solid ${C.surface2}`,
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                {stepsCompleted}<span style={{ fontSize: 16, color: C.muted, fontWeight: 500 }}>/{totalSteps}</span>
              </div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                Etapas
              </div>
            </div>
          )}
          {/* badge consist�ncia */}
          <div style={{
            flex: 1, background: C.terracota + "12", borderRadius: 14,
            padding: "12px 8px", border: `1px solid ${C.terracota}28`,
            textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 2 }}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 2L17.09 8.26L24 9.27L19 14.14L20.18 21.02L14 17.77L7.82 21.02L9 14.14L4 9.27L10.91 8.26L14 2Z"
                  fill={C.terracota} stroke={C.terracota} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{ fontSize: 10, color: C.terracota, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Const�ncia
            </div>
          </div>
        </div>
      </div>

      {/* -- conte�do scroll�vel -- */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 0", minHeight: 0 }}>

        {/* RPE section */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.offwhite }}>Como foi o esfor�o?</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Selecione o RPE para salvar</div>
            </div>
            {rpe > 0 && (
              <div style={{
                background: C.terracota + "18", border: `1px solid ${C.terracota}44`,
                borderRadius: 20, padding: "3px 10px",
                fontSize: 12, color: C.terracota, fontWeight: 700,
              }}>
                {rpeLabels[rpe]}
              </div>
            )}
          </div>

          <div style={{ background: C.card, borderRadius: 16, padding: "16px 12px", border: `1px solid ${C.surface2}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <button onClick={() => onRpeChange(n)} style={{
                    width: "100%", height: 46, borderRadius: 10,
                    background: rpe === n ? C.terracota : C.bg,
                    border: rpe === n ? `2px solid ${C.terracota}` : `1px solid ${C.border}`,
                    color: rpe === n ? "#fff" : C.muted,
                    fontSize: 17, fontWeight: rpe === n ? 800 : 500,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>{n}</button>
                  {rpeMilestone[n] && (
                    <span style={{ fontSize: 9, color: rpe === n ? C.terracota : "#444", fontWeight: 600, textAlign: "center", lineHeight: 1 }}>
                      {rpeMilestone[n]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* gate hint */}
          {!canSave && (
            <div style={{
              marginTop: 8, textAlign: "center",
              fontSize: 11, color: C.muted, fontStyle: "italic",
            }}>
              Selecione o RPE acima para liberar o salvamento
            </div>
          )}
        </div>

        {/* obs */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>
            Observa��o <span style={{ fontSize: 10, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(opcional)</span>
          </div>
          <textarea
            value={obs} onChange={e => onObsChange(e.target.value)}
            rows={3}
            placeholder="Como se sentiu? Algum destaque do treino?"
            style={{
              width: "100%", background: C.card,
              border: `1px solid ${C.surface2}`, borderRadius: 12,
              padding: "14px 16px", color: C.offwhite, fontSize: 14,
              resize: "none", boxSizing: "border-box", lineHeight: 1.6, outline: "none",
            }}
          />
        </div>
      </div>

      {/* -- CTA -- */}
      <div style={{ padding: "12px 20px", paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))", borderTop: `1px solid ${C.surface2}`, background: C.bg, flexShrink: 0 }}>
        {/* motivational quote above CTA */}
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "#444", fontStyle: "italic" }}>
            "Resultado vem do processo." � SAN RUN
          </span>
        </div>
        <button
          onClick={canSave ? onSave : undefined}
          style={{
            width: "100%", height: 60, borderRadius: 18,
            background: canSave
              ? `linear-gradient(135deg, ${C.terracota} 0%, #D97240 100%)`
              : C.surface2,
            border: canSave ? "none" : `1px solid ${C.border}`,
            color: canSave ? "#fff" : C.muted,
            fontSize: 16, fontWeight: 800,
            cursor: canSave ? "pointer" : "not-allowed",
            opacity: canSave ? 1 : 0.5,
            boxShadow: canSave ? `0 6px 24px ${C.terracota}44` : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            transition: "all 0.2s",
          }}>
          Ver meu painel <IconArrowRight color={canSave ? "#fff" : C.muted} />
        </button>
      </div>
    </div>
  );
}

// --- BuilderTimer -------------------------------------------------------------

function BuilderTimer({ steps, workoutName }: { steps: ExecStep[]; workoutName: string }) {
  const [, navigate] = useLocation();

  // -- estado (motor intocado) --
  const [stepIdx, setStepIdx]           = useState(0);
  const [remaining, setRemaining]       = useState(steps[0]?.durationSec ?? 0);
  const [running, setRunning]           = useState(false);
  const [started, setStarted]           = useState(false);
  const [finished, setFinished]         = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [rpeActual, setRpeActual]       = useState(0);
  const [obs, setObs]                   = useState("");
  const [showConfirm, setShowConfirm]   = useState(false);

  const stepIdxRef   = useRef(stepIdx);
  const remainingRef = useRef(remaining);
  stepIdxRef.current   = stepIdx;
  remainingRef.current = remaining;

  // -- Web Audio: bipes de contagem regressiva + aviso de nova etapa --
  const audioCtxRef = useRef<AudioContext | null>(null);

  function getAudioCtx(): AudioContext {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  // Bipe simples: freq Hz, dura��o ms, volume 0�1
  function beep(freq: number, durationMs: number, vol = 0.35, delayMs = 0) {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + delayMs / 1000;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + durationMs / 1000);
      osc.start(t);
      osc.stop(t + durationMs / 1000 + 0.05);
    } catch (_) {}
  }

  // Aviso de nova etapa: 2 bipes curtos ascendentes
  function playNewStepAlert() {
    beep(660, 90, 0.3, 0);
    beep(880, 120, 0.35, 140);
  }

  // Bipes de contagem regressiva (3, 2, 1 ? + bipe final)
  function playCountdown(remaining: number) {
    if (remaining === 3) beep(880, 80, 0.25);
    if (remaining === 2) beep(880, 80, 0.25);
    if (remaining === 1) beep(880, 80, 0.25);
    if (remaining === 0) beep(1100, 160, 0.4); // bipe conclus�o
  }

  const advanceStep = useCallback(() => {
    const next = stepIdxRef.current + 1;
    if (next >= steps.length) {
      // VOICE_HOOK: TTS "Treino conclu�do! Parab�ns, atleta SAN RUN."
      beep(880, 100, 0.35, 0);
      beep(1100, 100, 0.35, 150);
      beep(1320, 200, 0.4, 300);
      setFinished(true);
      setRunning(false);
    } else {
      // VOICE_HOOK: TTS phaseLabel(steps[next].phase) + steps[next].label
      playNewStepAlert();
      setStepIdx(next);
      setRemaining(steps[next].durationSec);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  useEffect(() => {
    if (!running || finished) return;
    const id = setInterval(() => {
      setTotalElapsed(t => t + 1);
      setRemaining(r => {
        const next = r <= 1 ? 0 : r - 1;
        playCountdown(next);
        if (r <= 1) { advanceStep(); return 0; }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, finished, advanceStep]);

  function handleStart() {
    // VOICE_HOOK: TTS "Iniciando " + workoutName + ". " + phaseLabel(steps[0].phase)
    playNewStepAlert();
    setStarted(true);
    setRunning(true);
  }
  function handlePause()  {
    // VOICE_HOOK: TTS "Treino pausado."
    setRunning(false);
  }
  function handleResume() {
    // VOICE_HOOK: TTS "Retomando."
    setRunning(true);
  }
  function handleSkip()   { advanceStep(); }
  function handleFinish() { setShowConfirm(true); }
  function handleConfirmFinish() {
    // VOICE_HOOK: TTS "Encerrando treino."
    setShowConfirm(false);
    setRunning(false);
    setFinished(true);
  }

  function handleSaveAndExit() {
    const s = loadSession();
    if (s) {
      addWorkoutRecord({
        date: new Date().toISOString(), title: workoutName,
        duration: fmtTime(totalElapsed), completed: true,
        rpe: rpeActual, elapsedSeconds: totalElapsed,
      });
      s.activeBuilderSession = undefined as any;
      saveSession(s);
    }
    navigate("/dashboard");
  }

  const step         = steps[stepIdx] ?? steps[steps.length - 1];
  const nextStep     = steps[stepIdx + 1];
  const stepProgress = step ? (step.durationSec - remaining) / step.durationSec : 0;
  const overallPct   = Math.round(((stepIdx + stepProgress) / steps.length) * 100);
  const color        = phaseColor(step?.phase ?? "work");
  const isLastStep   = stepIdx === steps.length - 1;
  const coach        = started
    ? coachMessage(step?.phase ?? "work", stepProgress, stepIdx === 0, isLastStep)
    : "Pronto para come�ar. Aperte INICIAR quando quiser.";

  // -- finaliza��o --
  if (finished) {
    return (
      <FinishScreen
        elapsed={totalElapsed} rpe={rpeActual} obs={obs}
        workoutName={workoutName}
        stepsCompleted={Math.min(stepIdx + 1, steps.length)}
        totalSteps={steps.length}
        onRpeChange={setRpeActual} onObsChange={setObs}
        onSave={handleSaveAndExit}
      />
    );
  }

  return (
    <div style={{
      height: "100dvh", background: C.bg, color: C.offwhite,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>

      {/* --- TOPO ---------------------------------------------------------- */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: `1px solid ${C.surface2}`,
        background: "#0D0D15",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 10, color: C.terracota, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 2 }}>
              TREINO DE HOJE
            </div>
            <div style={{
              fontSize: 17, fontWeight: 800, color: C.offwhite,
              maxWidth: 210, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {workoutName}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.muted, letterSpacing: 1, marginBottom: 2 }}>DECORRIDO</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.offwhite, fontVariantNumeric: "tabular-nums" }}>
              {fmtTime(totalElapsed)}
            </div>
          </div>
        </div>

        {/* barra progresso geral */}
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 3, background: C.surface2, borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              background: `linear-gradient(90deg, ${color}88, ${color})`,
              width: `${overallPct}%`, transition: "width 0.6s linear",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
            <span style={{ fontSize: 10, color: "#444" }}>Etapa {stepIdx + 1} / {steps.length}</span>
            <span style={{ fontSize: 10, color, fontWeight: 700 }}>{overallPct}%</span>
          </div>
        </div>
      </div>

      {/* --- FASE ATUAL ---------------------------------------------------- */}
      <div style={{
        margin: "8px 20px 0",
        background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        borderRadius: 14, padding: "10px 14px",
        border: `1px solid ${color}28`,
        flexShrink: 0,
      }}>
        {/* linha 1: badge fase + badge s�rie + label tudo inline */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: color + "1E", border: `1px solid ${color}44`,
            borderRadius: 20, padding: "3px 10px",
            flexShrink: 0,
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%", background: color,
              boxShadow: running ? `0 0 5px ${color}` : "none",
              animation: running ? "blink 1.4s ease-in-out infinite" : "none",
            }} />
            <span style={{ fontSize: 10, fontWeight: 800, color, letterSpacing: 1.5 }}>
              {step ? phaseLabel(step.phase) : ""}
            </span>
          </div>
          {step?.totalReps && step.currentRep && (
            <div style={{
              fontSize: 10, fontWeight: 700, color: C.offwhite,
              background: C.surface2, borderRadius: 20, padding: "3px 10px",
              border: `1px solid ${C.border}`, flexShrink: 0,
            }}>
              S�rie {step.currentRep} / {step.totalReps}
            </div>
          )}
          {/* blockName inline quando s�rie */}
          {step?.totalReps && step.blockName && step.blockName !== step.label && (
            <span style={{ fontSize: 10, color: color, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
              {step.blockName}
            </span>
          )}
        </div>

        {/* label da etapa + objetivo + RPE � tudo numa linha ou duas */}
        <div style={{ marginTop: 6, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.offwhite, lineHeight: 1.2, flex: 1, minWidth: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {step?.label ?? ""}
          </div>
          {step?.rpe && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
              <IconPulse color={C.muted} />
              <span style={{ fontSize: 11, color: C.muted }}>
                RPE <span style={{ color: C.offwhite, fontWeight: 700 }}>{step.rpe}</span>
              </span>
            </div>
          )}
        </div>

        {/* descri��o � 1 linha com ellipsis */}
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.4, marginTop: 3,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {step ? phaseObjective(step) : ""}
        </div>
      </div>

      {/* --- CRON�METRO ---------------------------------------------------- */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "0 20px", minHeight: 0, overflow: "hidden",
      }}>
        <Ring size={190} stroke={11} progress={stepProgress} color={color}>
          <div style={{
            fontSize: 52, fontWeight: 800, letterSpacing: -3, lineHeight: 1,
            color: C.offwhite, fontVariantNumeric: "tabular-nums",
          }}>
            {fmtTime(remaining)}
          </div>
          <div style={{
            fontSize: 10, color: C.muted, letterSpacing: 2, marginTop: 4,
            textTransform: "uppercase",
          }}>
            {running ? "restante" : started ? "pausado" : "aguardando"}
          </div>
        </Ring>

        {/* coach message � linha �nica compacta */}
        <div style={{
          marginTop: 10, paddingTop: 8,
          maxWidth: 300, textAlign: "center",
        }}>
          <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", lineHeight: 1.4,
            overflow: "hidden", textOverflow: "ellipsis",
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
            "{coach}"
          </div>
        </div>
      </div>

      {/* --- PR�XIMA ETAPA ------------------------------------------------ */}
      <div style={{ padding: "6px 20px 0", flexShrink: 0 }}>
        {nextStep ? (
          <div style={{
            background: C.card, borderRadius: 10, padding: "8px 12px",
            border: `1px solid ${C.surface2}`,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: 3, height: 28, borderRadius: 2,
              background: phaseColor(nextStep.phase), flexShrink: 0,
            }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 1 }}>
                A seguir
              </div>
              <div style={{
                fontSize: 13, fontWeight: 700, color: C.offwhite,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {nextStep.label}
              </div>
              {nextStep.totalReps && nextStep.currentRep && (
                <div style={{ fontSize: 10, color: C.muted }}>
                  S�rie {nextStep.currentRep}/{nextStep.totalReps}{nextStep.rpe ? ` � RPE ${nextStep.rpe}` : ""}
                </div>
              )}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: phaseColor(nextStep.phase), flexShrink: 0 }}>
              {fmtTime(nextStep.durationSec)}
            </div>
            <IconChev />
          </div>
        ) : (
          <div style={{
            background: C.terracota + "0A", borderRadius: 10, padding: "8px 12px",
            border: `1px solid ${C.terracota}28`, textAlign: "center",
          }}>
            <div style={{ fontSize: 12, color: C.terracota, fontWeight: 700 }}>
              �ltima etapa � d� o seu melhor
            </div>
          </div>
        )}
      </div>

      {/* --- CONTROLES ---------------------------------------------------- */}
      <div style={{ padding: "8px 20px", paddingBottom: "max(20px, env(safe-area-inset-bottom, 20px))", flexShrink: 0 }}>
        {!started ? (
          <button onClick={handleStart} style={{
            width: "100%", height: 60, borderRadius: 18,
            background: `linear-gradient(135deg, ${C.terracota} 0%, #D97240 100%)`,
            border: "none", color: "#fff", fontSize: 17, fontWeight: 800,
            cursor: "pointer", letterSpacing: 1.5,
            boxShadow: `0 6px 24px ${C.terracota}55`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}>
            <IconPlay size={20} /> INICIAR TREINO
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {running ? (
                <button onClick={handlePause} style={{
                  flex: 3, height: 56, borderRadius: 14,
                  background: C.card, border: `1px solid ${C.border}`,
                  color: C.offwhite, fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <IconPause size={16} /> PAUSAR
                </button>
              ) : (
                <button onClick={handleResume} style={{
                  flex: 3, height: 56, borderRadius: 14,
                  background: `linear-gradient(135deg, ${C.bluestone}, #4A7A8A)`,
                  border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: `0 4px 18px ${C.bluestone}44`,
                }}>
                  <IconPlay size={16} /> RETOMAR
                </button>
              )}
              {stepIdx < steps.length - 1 && (
                <button onClick={handleSkip} style={{
                  flex: 1, height: 56, borderRadius: 14,
                  background: C.card, border: `1px solid ${C.border}`,
                  color: C.muted, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3,
                }}>
                  <IconSkip size={15} color={C.muted} />
                  <span style={{ fontSize: 9 }}>PULAR</span>
                </button>
              )}
            </div>
            <button onClick={handleFinish} style={{
              width: "100%", height: 40, borderRadius: 12,
              background: "transparent", border: `1px solid ${C.terracota}33`,
              color: C.terracota, fontSize: 12, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <IconStop size={13} /> FINALIZAR TREINO
            </button>
          </div>
        )}
      </div>

      {/* --- MODAL ENCERRAR ----------------------------------------------- */}
      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)",
          display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 300,
        }}>
          <div style={{
            background: C.card, borderRadius: "24px 24px 0 0",
            padding: "8px 20px 48px", border: `1px solid ${C.surface2}`,
          }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "12px auto 24px" }} />
            <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Encerrar treino?</div>
            <div style={{ fontSize: 14, color: C.muted, marginBottom: 6, lineHeight: 1.6 }}>
              {steps.length - stepIdx - 1 > 0
                ? `Ainda restam ${steps.length - stepIdx - 1} etapa(s). O treino ser� salvo at� aqui.`
                : "Esta � a �ltima etapa."}
            </div>
            <div style={{ fontSize: 13, color: C.terracota, fontStyle: "italic", marginBottom: 26 }}>
              "Cada passo faz parte do plano."
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowConfirm(false)} style={{
                flex: 1, height: 56, borderRadius: 14,
                background: C.bg, border: `1px solid ${C.border}`,
                color: C.muted, fontSize: 16, cursor: "pointer", fontWeight: 600,
              }}>Continuar</button>
              <button onClick={handleConfirmFinish} style={{
                flex: 1, height: 56, borderRadius: 14,
                background: C.terracota, border: "none",
                color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer",
              }}>Encerrar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}

// --- FreeRunTimer -------------------------------------------------------------

function FreeRunTimer({ title, rpe: suggestedRpe }: { title: string; rpe: number }) {
  const [, navigate] = useLocation();

  const [elapsed, setElapsed]     = useState(0);
  const [running, setRunning]     = useState(false);
  const [started, setStarted]     = useState(false);
  const [finished, setFinished]   = useState(false);
  const [rpeActual, setRpeActual] = useState(suggestedRpe || 6);
  const [obs, setObs]             = useState("");

  useEffect(() => {
    if (!running || finished) return;
    const id = setInterval(() => setElapsed(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [running, finished]);

  function handleStart()  {
    // VOICE_HOOK: TTS "Iniciando corrida livre. Mente San, Corpo Run."
    setStarted(true);
    setRunning(true);
  }
  function handlePause()  { setRunning(false); }
  function handleResume() { setRunning(true); }
  function handleFinish() { setRunning(false); setFinished(true); }

  function handleSaveAndExit() {
    addWorkoutRecord({
      date: new Date().toISOString(), title,
      duration: fmtTime(elapsed), completed: true,
      rpe: rpeActual, elapsedSeconds: elapsed,
    });
    navigate("/dashboard");
  }

  if (finished) {
    return (
      <FinishScreen
        elapsed={elapsed} rpe={rpeActual} obs={obs}
        workoutName={title} stepsCompleted={1}
        onRpeChange={setRpeActual} onObsChange={setObs}
        onSave={handleSaveAndExit}
      />
    );
  }

  const coach = !started
    ? "Pronto. Aperte INICIAR quando quiser come�ar."
    : running
      ? "Cada passo faz parte do plano."
      : "Pausado. Retome quando estiver pronto.";

  return (
    <div style={{
      height: "100dvh", background: C.bg, color: C.offwhite,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>

      {/* topo */}
      <div style={{
        padding: "16px 20px 14px",
        borderBottom: `1px solid ${C.surface2}`,
        background: "#0D0D15",
      }}>
        <div style={{ fontSize: 10, color: C.terracota, textTransform: "uppercase", letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>
          TREINO DE HOJE
        </div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>{title}</div>
      </div>

      {/* fase card */}
      <div style={{
        margin: "12px 20px 0",
        background: `${C.bluestone}10`,
        borderRadius: 18, padding: "14px 16px",
        border: `1px solid ${C.bluestone}28`,
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${C.bluestone}20`, border: `1px solid ${C.bluestone}44`,
          borderRadius: 20, padding: "4px 12px", marginBottom: 8,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: C.bluestone,
            animation: running ? "blink 1.4s ease-in-out infinite" : "none",
          }} />
          <span style={{ fontSize: 11, fontWeight: 800, color: C.bluestone, letterSpacing: 2 }}>
            CORRIDA LIVRE
          </span>
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, marginBottom: suggestedRpe > 0 ? 8 : 0 }}>
          Mantenha o ritmo. Voc� est� sendo guiado pelo SAN RUN.
        </div>
        {suggestedRpe > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <IconPulse color={C.muted} />
            <span style={{ fontSize: 12, color: C.muted }}>
              RPE alvo: <span style={{ color: C.offwhite, fontWeight: 700 }}>{suggestedRpe} / 10</span>
            </span>
          </div>
        )}
      </div>

      {/* cron�metro */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", padding: "6px 20px 0", minHeight: 0,
      }}>
        <Ring size={208} stroke={12} progress={(elapsed % 3600) / 3600} color={C.bluestone}>
          <div style={{
            fontSize: 58, fontWeight: 800, letterSpacing: -3, lineHeight: 1,
            color: C.offwhite, fontVariantNumeric: "tabular-nums",
          }}>
            {fmtTime(elapsed)}
          </div>
          <div style={{ fontSize: 10, color: C.muted, letterSpacing: 2, marginTop: 6, textTransform: "uppercase" }}>
            {running ? "em andamento" : started ? "pausado" : "pronto"}
          </div>
        </Ring>

        <div style={{
          marginTop: 14, padding: "10px 18px",
          background: C.card, borderRadius: 12, border: `1px solid ${C.surface2}`,
          maxWidth: 320, textAlign: "center",
        }}>
          <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic", lineHeight: 1.5 }}>
            "{coach}"
          </div>
        </div>
      </div>

      {/* controles */}
      <div style={{ padding: "10px 20px 36px" }}>
        {!started ? (
          <button onClick={handleStart} style={{
            width: "100%", height: 68, borderRadius: 20,
            background: `linear-gradient(135deg, ${C.terracota}, #D97240)`,
            border: "none", color: "#fff", fontSize: 19, fontWeight: 800,
            cursor: "pointer", letterSpacing: 1.5,
            boxShadow: `0 8px 28px ${C.terracota}55`,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          }}>
            <IconPlay size={22} /> INICIAR TREINO
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {running ? (
              <button onClick={handlePause} style={{
                width: "100%", height: 62, borderRadius: 16,
                background: C.card, border: `1px solid ${C.border}`,
                color: C.offwhite, fontSize: 15, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <IconPause size={18} /> PAUSAR
              </button>
            ) : (
              <button onClick={handleResume} style={{
                width: "100%", height: 62, borderRadius: 16,
                background: `linear-gradient(135deg, ${C.bluestone}, #4A7A8A)`,
                border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: `0 4px 20px ${C.bluestone}44`,
              }}>
                <IconPlay size={18} /> RETOMAR
              </button>
            )}
            <button onClick={handleFinish} style={{
              width: "100%", height: 46, borderRadius: 14,
              background: "transparent", border: `1px solid ${C.terracota}33`,
              color: C.terracota, fontSize: 13, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
              <IconStop size={14} /> FINALIZAR TREINO
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}

// --- roteador -----------------------------------------------------------------
// Fonte �nica de dados: activeBuilderSession (montador) ou workout.blocks (plano semanal).
// FreeRunTimer s� � usado quando n�o h� estrutura de blocos em nenhuma das fontes.

export default function TimerPage() {
  const s = loadSession();

  // 1. Montador de treino � prioridade m�xima
  if (s?.activeBuilderSession && s.activeBuilderSession.blocks.length > 0) {
    const steps = expandBlocksToSteps(s.activeBuilderSession.blocks);
    if (steps.length > 0) {
      return <BuilderTimer steps={steps} workoutName={s.activeBuilderSession.name} />;
    }
  }

  // 2. Treino do plano semanal com blocos estruturados
  const workout = s?.workout;
  if (workout?.blocks && workout.blocks.length > 0) {
    const steps = expandWorkoutBlocksToSteps(workout.blocks);
    if (steps.length > 0) {
      return <BuilderTimer steps={steps} workoutName={workout.title} />;
    }
  }

  // 3. Fallback: cron�metro livre (sem estrutura de blocos)
  return (
    <FreeRunTimer
      title={workout?.title ?? "Treino Livre"}
      rpe={workout?.rpe ?? 6}
    />
  );
}
