import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { loadSession, saveSession, ForcaBlock } from "../lib/store";
import { TRACKS, useRitualPlayer, RI } from "../components/RitualPlayer";
import ExerciseDemo from "../components/ExerciseDemo";
import { getExerciseById } from "../lib/forca-data";

/* â”€â”€â”€ icons â”€â”€â”€ */
const IcBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IcPlay = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IcPause = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
  </svg>
);
const IcNext = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcCheck = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IcCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);

type Phase = "intro" | "session" | "done";

const TYPE_COLOR: Record<string, string> = {
  mobilidade: "#5a8fa5",
  ativacao: "#3A5F6F",
  forca: "#C4622D",
  educativo: "#7a6a5a",
};
const TYPE_LABEL: Record<string, string> = {
  mobilidade: "Mobilidade",
  ativacao: "AtivaÃ§Ã£o",
  forca: "ForÃ§a",
  educativo: "Educativo",
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* â”€â”€â”€ Bloco de exercÃ­cio â”€â”€â”€ */
function ExerciseCard({ block, index, total }: { block: ForcaBlock; index: number; total: number }) {
  const color = TYPE_COLOR[block.type] || "#C4622D";
  const exercise = block.exerciseId ? getExerciseById(block.exerciseId) : undefined;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0, overflow: "auto" }}>
      {/* Type badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{
          fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em",
          textTransform: "uppercase", color,
          background: `${color}18`, borderRadius: 100,
          padding: "4px 10px", border: `1px solid ${color}40`,
        }}>
          {TYPE_LABEL[block.type]}
        </span>
        <span style={{ fontSize: "0.65rem", color: "#A0A0A0" }}>
          {index + 1} de {total}
        </span>
      </div>

      {/* Name */}
      <h2 style={{
        fontFamily: "'Waffle Soft', sans-serif",
        fontSize: "1.55rem",
        color: "#F5F0EB",
        fontWeight: 800,
        lineHeight: 1.2,
        marginBottom: 8,
      }}>
        {block.name}
      </h2>

      {/* Demonstração visual San Run */}
      <div style={{ marginBottom: 16 }}>
        <ExerciseDemo
          media={exercise?.media}
          exerciseName={block.name}
          color={color}
        />
      </div>

      {/* Volume */}
      <p style={{ fontSize: "0.88rem", color, fontWeight: 800, marginBottom: 16 }}>
        {block.sets && block.reps
          ? `${block.sets} sÃ©ries Ã— ${block.reps} repetiÃ§Ãµes`
          : block.duration || ""}
      </p>

      {/* Why */}
      <div style={{
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        marginBottom: 16,
      }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A0A0A0", margin: "0 0 5px" }}>
          POR QUÃŠ ISSO?
        </p>
        <p style={{ fontSize: "0.78rem", color: "#C8C0B8", lineHeight: 1.55, margin: 0 }}>
          {block.why}
        </p>
      </div>

      {/* Steps */}
      <div>
        <p style={{ fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#A0A0A0", marginBottom: 10 }}>
          COMO FAZER
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {block.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: `${color}18`,
                border: `1px solid ${color}35`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.62rem", fontWeight: 800, color,
                marginTop: 1,
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: "0.78rem", color: "#C8C0B8", lineHeight: 1.5, margin: 0, flex: 1 }}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Timer ring â”€â”€â”€ */
function TimerRing({ elapsed, total }: { elapsed: number; total: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const progress = total > 0 ? Math.min(elapsed / total, 1) : 0;
  const offset = circ * (1 - progress);

  return (
    <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
      <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke="#C4622D" strokeWidth="6"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear" }}
        />
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexDirection: "column",
      }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "#F5F0EB", fontFamily: "monospace" }}>
          {formatTime(elapsed)}
        </span>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Tela de intro â€” TODOS os exercÃ­cios com scroll â”€â”€â”€ */
function IntroScreen({ blocks, onStart }: { blocks: ForcaBlock[]; onStart: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Ãrea com scroll */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 0" }}>
        {/* Hero */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(196,98,45,0.12)",
            border: "1.5px solid rgba(196,98,45,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#C4622D",
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="6" y1="10" x2="4" y2="10"/><line x1="18" y1="10" x2="20" y2="10"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="9" y1="20" x2="15" y2="20"/>
            </svg>
          </div>
          <div>
            <h2 style={{ fontFamily: "'Waffle Soft', sans-serif", fontSize: "1.4rem", color: "#F5F0EB", fontWeight: 800, marginBottom: 6 }}>
              SessÃ£o de ForÃ§a
            </h2>
            <p style={{ fontSize: "0.78rem", color: "#A0A0A0", lineHeight: 1.55, margin: 0 }}>
              {blocks.length} exercÃ­cios prescritos para vocÃª. Siga o ritmo, priorize a forma.
            </p>
          </div>
        </div>

        {/* TODOS os exercÃ­cios */}
        <p style={{
          fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "#A0A0A0", marginBottom: 10,
        }}>
          EXERCÃCIOS DO TREINO ({blocks.length})
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, paddingBottom: 4 }}>
          {blocks.map((b, i) => {
            const color = TYPE_COLOR[b.type] || "#C4622D";
            return (
              <div key={i} style={{
                display: "flex", gap: 10, alignItems: "center",
                padding: "11px 13px", borderRadius: 11,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                  background: `${color}18`,
                  border: `1px solid ${color}35`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", fontWeight: 800, color,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F5F0EB", margin: "0 0 1px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {b.name}
                  </p>
                  <p style={{ fontSize: "0.63rem", color: "#A0A0A0", margin: 0 }}>
                    {b.sets && b.reps ? `${b.sets} sÃ©ries Ã— ${b.reps} reps` : b.duration || ""}
                  </p>
                </div>
                <span style={{
                  fontSize: "0.57rem", fontWeight: 800,
                  color, textTransform: "uppercase", letterSpacing: "0.07em",
                  flexShrink: 0,
                }}>
                  {TYPE_LABEL[b.type] || b.type}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BotÃ£o fixo no bottom */}
      <div style={{ padding: "14px 24px 24px", flexShrink: 0 }}>
        <button
          onClick={onStart}
          style={{
            width: "100%", padding: "16px", borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #C4622D, #e07a45)",
            color: "#fff", fontSize: "0.9rem", fontWeight: 800,
            letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          }}
        >
          COMEÃ‡AR AGORA
          <IcNext />
        </button>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Tela de conclusÃ£o â”€â”€â”€ */
function DoneScreen({ totalTime, onFinish }: { totalTime: number; onFinish: () => void }) {
  const [, navigate] = useLocation();

  return (
    <div style={{
      flex: 1, display: "flex", flexDirection: "column",
      padding: "24px", alignItems: "center", justifyContent: "center",
      textAlign: "center", gap: 24,
    }}>
      <div style={{
        width: 90, height: 90, borderRadius: "50%",
        background: "rgba(196,98,45,0.12)",
        border: "2px solid rgba(196,98,45,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#C4622D",
      }}>
        <IcCheck />
      </div>

      <div>
        <h2 style={{ fontFamily: "'Waffle Soft', sans-serif", fontSize: "1.6rem", color: "#F5F0EB", fontWeight: 800, marginBottom: 8 }}>
          SessÃ£o Completa!
        </h2>
        <p style={{ fontSize: "0.82rem", color: "#A0A0A0", margin: 0 }}>
          {formatTime(totalTime)} de trabalho sÃ³lido
        </p>
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <div style={{ padding: "14px 20px", borderRadius: 14, background: "rgba(196,98,45,0.1)", border: "1px solid rgba(196,98,45,0.25)" }}>
          <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#F5F0EB", margin: "0 0 3px" }}>{formatTime(totalTime)}</p>
          <p style={{ fontSize: "0.6rem", color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>DuraÃ§Ã£o</p>
        </div>
      </div>

      <p style={{ fontSize: "0.82rem", color: "#C8C0B8", lineHeight: 1.6, margin: 0 }}>
        ConstÃ¢ncia em movimento. Cada sessÃ£o Ã© um tijolo na sua base de corrida.
      </p>

      {/* BotÃµes de navegaÃ§Ã£o pÃ³s-sessÃ£o */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={onFinish}
          style={{
            width: "100%", padding: "15px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #C4622D, #e07a45)",
            color: "#fff", fontSize: "0.88rem", fontWeight: 800,
            letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <IcHome />
          Painel de ForÃ§a
        </button>
        <button
          onClick={() => navigate("/weekly")}
          style={{
            width: "100%", padding: "14px", borderRadius: 14,
            border: "1px solid rgba(58,95,111,0.4)",
            background: "rgba(58,95,111,0.1)",
            color: "#5a8fa5", fontSize: "0.85rem", fontWeight: 800,
            letterSpacing: "0.06em", textTransform: "uppercase",
            cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <IcCalendar />
          Ver Semana
        </button>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Mini Music Bar â”€â”€â”€ */
function MiniMusicBar({
  playing, muted, trackIdx,
  onTogglePlay, onToggleMute, onPrev, onNext,
}: {
  playing: boolean; muted: boolean; trackIdx: number;
  onTogglePlay: () => void; onToggleMute: () => void; onPrev: () => void; onNext: () => void;
}) {
  const track = TRACKS[trackIdx];
  return (
    <div style={{
      margin: "0 20px 10px",
      padding: "8px 12px",
      borderRadius: 12,
      background: playing
        ? "linear-gradient(135deg,rgba(196,98,45,0.18) 0%,rgba(11,11,15,0.97) 100%)"
        : "rgba(255,255,255,0.04)",
      border: playing
        ? "1px solid rgba(196,98,45,0.4)"
        : "1px solid rgba(255,255,255,0.08)",
      display: "flex",
      alignItems: "center",
      gap: 8,
      transition: "all 0.3s",
      flexShrink: 0,
    }}>
      {/* Eagle icon + pulse */}
      <div style={{
        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg,#C4622D,#a04e22)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: playing ? "0 0 12px rgba(196,98,45,0.5)" : "none",
        animation: playing ? "albumPulse 0.9s ease-in-out infinite" : "none",
      }}>
        <img src="/logo-eagle-gold.png" alt="" style={{ height: 18, width: 18, objectFit: "contain", filter: "brightness(0) invert(1) opacity(0.9)" }}/>
      </div>

      {/* Track name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "0.65rem", fontWeight: 700, color: playing ? "#F5F0EB" : "#A0A0A0", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {track.label}
        </p>
        {playing && (
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 10, marginTop: 2 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} style={{
                width: 2, borderRadius: 1, minHeight: 2,
                background: i % 3 === 0 ? "#C4622D" : "rgba(196,98,45,0.35)",
                animation: `waveBarSm 0.${4 + (i % 4)}s ease-in-out ${i * 0.06}s infinite alternate`,
              }}/>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 4, alignItems: "center", flexShrink: 0 }}>
        <button onClick={onPrev} style={{ background: "none", border: "none", cursor: "pointer", color: "#A0A0A0", padding: "4px 5px", display: "flex", alignItems: "center" }}>
          <RI.prev />
        </button>
        <button
          onClick={onTogglePlay}
          style={{
            background: playing ? "linear-gradient(135deg,#C4622D,#a04e22)" : "rgba(196,98,45,0.18)",
            border: playing ? "none" : "1px solid rgba(196,98,45,0.35)",
            borderRadius: 8, padding: "6px 10px", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            color: "#F5F0EB",
          }}
        >
          {playing ? <RI.pause /> : <RI.play />}
          <span style={{ fontSize: "0.65rem", fontWeight: 700, color: playing ? "#fff" : "#C4622D" }}>
            {playing ? "Pausar" : "MÃºsica"}
          </span>
        </button>
        <button onClick={onNext} style={{ background: "none", border: "none", cursor: "pointer", color: "#A0A0A0", padding: "4px 5px", display: "flex", alignItems: "center" }}>
          <RI.next />
        </button>
        <button onClick={onToggleMute} style={{ background: "none", border: "none", cursor: "pointer", color: muted ? "#C4622D" : "#555", padding: "4px 5px", display: "flex", alignItems: "center" }}>
          {muted ? <RI.mute /> : <RI.volume />}
        </button>
      </div>
    </div>
  );
}

/* â”€â”€â”€ COMPONENTE PRINCIPAL â”€â”€â”€ */
export default function ForcaSessaoPage() {
  const [, navigate] = useLocation();
  const session = loadSession();
  const blocks = session?.forcaPlan?.blocks || [];

  const [phase, setPhase] = useState<Phase>("intro");
  const [blockIndex, setBlockIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Music player
  const { playing, muted, trackIdx, handleTogglePlay, handleToggleMute, handlePrev, handleNext } = useRitualPlayer();

  /* timer global de sessÃ£o */
  useEffect(() => {
    if (phase === "session" && running) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => e + 1);
        setTotalTime(t => t + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, running]);

  function startSession() {
    setPhase("session");
    setRunning(true);
    setElapsed(0);
  }

  function nextBlock() {
    if (blockIndex < blocks.length - 1) {
      setBlockIndex(i => i + 1);
      setElapsed(0);
    } else {
      setRunning(false);
      setPhase("done");
    }
  }

  function finishSession() {
    const s = loadSession();
    if (s?.forcaPlan) {
      s.forcaPlan.sessionsCompleted = (s.forcaPlan.sessionsCompleted || 0) + 1;
      s.forcaPlan.lastSessionDate = new Date().toISOString();
      saveSession(s);
    }
    navigate("/forca");
  }

  if (!blocks.length) {
    return (
      <div style={{ minHeight: "100dvh", background: "#0B0B0F", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24 }}>
        <p style={{ color: "#A0A0A0", textAlign: "center" }}>Nenhum plano de forÃ§a configurado.</p>
        <button onClick={() => navigate("/forca/avaliacao")} style={{ background: "#C4622D", border: "none", borderRadius: 12, padding: "12px 24px", color: "#fff", fontWeight: 800, cursor: "pointer" }}>
          Configurar Plano
        </button>
      </div>
    );
  }

  const currentBlock = blocks[blockIndex];
  const blockEstSec = currentBlock
    ? (currentBlock.sets && currentBlock.reps
      ? currentBlock.sets * (currentBlock.reps * 3 + 30)
      : currentBlock.duration
      ? parseInt((currentBlock.duration.match(/(\d+)/) || ["0","30"])[1]) * (currentBlock.duration.includes("minuto") ? 60 : 1) * (currentBlock.sets || 1)
      : 60)
    : 60;

  return (
    <div style={{
      height: "100dvh",
      background: "#0B0B0F",
      display: "flex",
      flexDirection: "column",
      maxWidth: 430,
      margin: "0 auto",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes albumPulse{0%,100%{transform:scale(1);box-shadow:0 0 10px rgba(196,98,45,0.4)}50%{transform:scale(1.08);box-shadow:0 0 22px rgba(196,98,45,0.7)}}
        @keyframes waveBarSm{from{height:2px}to{height:100%}}
        @keyframes eaglePulse{0%,100%{box-shadow:0 2px 14px rgba(196,98,45,0.35)}50%{box-shadow:0 4px 26px rgba(196,98,45,0.6)}}
      `}</style>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "20px 20px 12px", gap: 12, flexShrink: 0 }}>
        <button
          onClick={() => phase === "intro" ? navigate("/forca") : setPhase("intro")}
          style={{ background: "none", border: "none", color: "#A0A0A0", cursor: "pointer", padding: 4 }}
        >
          <IcBack />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C4622D", margin: 0 }}>
            {phase === "session" ? `EXERCÃCIO ${blockIndex + 1} DE ${blocks.length}` : "SESSÃƒO DE FORÃ‡A"}
          </p>
          {phase === "session" && (
            <p style={{ fontSize: "0.7rem", color: "#A0A0A0", margin: 0 }}>{session?.forcaPlan?.title}</p>
          )}
        </div>
        {phase === "session" && (
          <TimerRing elapsed={elapsed} total={blockEstSec} />
        )}
      </div>

      {/* Progress bar (sessÃ£o ativa) */}
      {phase === "session" && (
        <div style={{ padding: "0 20px 12px", flexShrink: 0 }}>
          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${((blockIndex + 1) / blocks.length) * 100}%`,
              background: "#C4622D",
              borderRadius: 99,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      )}

      {/* Mini Music Bar â€” sempre visÃ­vel */}
      <MiniMusicBar
        playing={playing} muted={muted} trackIdx={trackIdx}
        onTogglePlay={handleTogglePlay}
        onToggleMute={handleToggleMute}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* ConteÃºdo */}
      {phase === "intro" && <IntroScreen blocks={blocks} onStart={startSession} />}

      {phase === "session" && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "0 20px 20px", overflow: "hidden" }}>
          <ExerciseCard block={currentBlock} index={blockIndex} total={blocks.length} />
          <div style={{ paddingTop: 16, display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <button
              onClick={() => setRunning(r => !r)}
              style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "#F5F0EB", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {running ? <IcPause /> : <IcPlay />}
            </button>
            <button
              onClick={nextBlock}
              style={{
                flex: 1, padding: "15px",
                borderRadius: 14, border: "none",
                background: blockIndex < blocks.length - 1
                  ? "linear-gradient(135deg, #C4622D, #e07a45)"
                  : "linear-gradient(135deg, #2d8a4e, #3aa862)",
                color: "#fff", fontSize: "0.88rem", fontWeight: 800,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {blockIndex < blocks.length - 1 ? "PrÃ³ximo ExercÃ­cio" : "Finalizar SessÃ£o"}
              {blockIndex < blocks.length - 1 ? <IcNext /> : <IcCheck />}
            </button>
          </div>
        </div>
      )}

      {phase === "done" && <DoneScreen totalTime={totalTime} onFinish={finishSession} />}
    </div>
  );
}




