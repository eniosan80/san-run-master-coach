import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { BottomNav } from "../components/BottomNav";
import { loadSession } from "../lib/store";
import { RitualPlayer, useRitualPlayer, RI } from "../components/RitualPlayer";

/* ─────────────────────────────────────────────
   FORCA_CATEGORIES — mantido para compatibilidade
   com forca-categoria.tsx que ainda importa isso
───────────────────────────────────────────── */
export const FORCA_CATEGORIES = [
  {
    id: "pernas",
    label: "Pernas & Estabilidade",
    subtitle: "Fortalecer músculos do passada",
    icon: null,
    color: "#C4622D",
    exercises: ["agachamento","avanco","panturrilha","ponte-gluteo"],
    count: 4,
    duration: "12–16 min",
  },
  {
    id: "nucleo",
    label: "Núcleo",
    subtitle: "Controle e estabilidade na corrida",
    icon: null,
    color: "#3A5F6F",
    exercises: ["prancha","elevacao-lateral","anti-rotacao","dead-bug"],
    count: 4,
    duration: "10–14 min",
  },
  {
    id: "mobilidade",
    label: "Mobilidade do Corredor",
    subtitle: "Melhorar movimento e eficiência",
    icon: null,
    color: "#5a8fa5",
    exercises: ["mobilidade-tornozelo","mobilidade-quadril","rotacao-toracica","alongamento-hip-flexor"],
    count: 4,
    duration: "10–12 min",
  },
  {
    id: "educativos",
    label: "Educativos de Corrida",
    subtitle: "Técnica e mecânica da passada",
    icon: null,
    color: "#7a6a5a",
    exercises: ["skipping","elevacao-joelhos","calcanhares","corrida-cruzada-lateral"],
    count: 4,
    duration: "8–10 min",
  },
];

/* ─── icons ─── */
const IcDumbbell = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="6" y1="10" x2="4" y2="10"/><line x1="18" y1="10" x2="20" y2="10"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="9" y1="20" x2="15" y2="20"/>
  </svg>
);
const IcArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
);
const IcClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IcTarget = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IcCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IcHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);

const DAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function ForcaPage() {
  const [, navigate] = useLocation();
  const session = loadSession();
  const plan = session?.forcaPlan;
  const profile = session?.forcaProfile;

  // Ritual Player
  const [playerOpen, setPlayerOpen] = useState(false);
  const { playing, muted, trackIdx, phraseIdx,
    handleTogglePlay, handleToggleMute, handlePrev, handleNext, handleOpenPlayer: _openPlayer,
  } = useRitualPlayer();

  const handleOpenPlayer = useCallback(() => {
    setPlayerOpen(true);
    _openPlayer();
  }, [_openPlayer]);

  /* ─── SEM plano configurado ─── */
  if (!plan || !profile) {
    return (
      <div style={{
        minHeight: "100dvh",
        background: "#0B0B0F",
        display: "flex",
        flexDirection: "column",
        maxWidth: 430,
        margin: "0 auto",
        paddingBottom: 80,
      }}>
        {/* Header */}
        <div style={{ padding: "24px 24px 0" }}>
          <p style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C4622D", margin: "0 0 4px" }}>
            FORÇA SAN RUN
          </p>
          <h1 style={{
            fontFamily: "'Waffle Soft', sans-serif",
            fontSize: "1.55rem",
            color: "#F5F0EB",
            fontWeight: 800,
            margin: "0 0 6px",
            lineHeight: 1.2,
          }}>
            Complemento de Corrida
          </h1>
          <p style={{ fontSize: "0.78rem", color: "#A0A0A0", margin: 0, lineHeight: 1.5 }}>
            Força prescrita para o seu perfil. Nada genérico.
          </p>
        </div>

        {/* Ilustração / hero */}
        <div style={{
          margin: "28px 24px",
          padding: "28px 24px",
          borderRadius: 20,
          background: "linear-gradient(135deg, rgba(58,95,111,0.18) 0%, rgba(11,11,15,0.98) 100%)",
          border: "1px solid rgba(58,95,111,0.3)",
          textAlign: "center",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(196,98,45,0.12)",
            border: "1.5px solid rgba(196,98,45,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 18px",
            color: "#C4622D",
          }}>
            <IcDumbbell />
          </div>
          <h3 style={{ fontFamily: "'Waffle Soft', sans-serif", fontSize: "1.05rem", color: "#F5F0EB", fontWeight: 800, marginBottom: 10 }}>
            Força prescrita para você
          </h3>
          <p style={{ fontSize: "0.78rem", color: "#A0A0A0", lineHeight: 1.55, marginBottom: 24 }}>
            Responda 4 perguntas e o SAN RUN monta seu plano de força personalizado — exercícios certos, dias certos, no tempo certo.
          </p>

          {/* Pilares */}
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            {[
              { label: "Mobilidade", desc: "Para o seu nível" },
              { label: "Força", desc: "Áreas prioritárias" },
              { label: "Prevenção", desc: "Seus desconfortos" },
            ].map(p => (
              <div key={p.label} style={{
                flex: 1, padding: "10px 6px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 800, color: "#C4622D", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 3px" }}>
                  {p.label}
                </p>
                <p style={{ fontSize: "0.65rem", color: "#A0A0A0", margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/forca/avaliacao")}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #C4622D, #e07a45)",
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            Configurar Meu Plano
            <IcArrow />
          </button>
        </div>

        {/* O que vai ser avaliado */}
        <div style={{ padding: "0 24px" }}>
          <p style={{ fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A0A0A0", marginBottom: 14 }}>
            O QUE AVALIAMOS
          </p>
          {[
            { q: "Dias disponíveis por semana", a: "Integrado ao seu calendário de corrida" },
            { q: "Regiões de desconforto", a: "Exercícios preventivos específicos" },
            { q: "Áreas mais fracas", a: "Foco nos músculos prioritários" },
            { q: "Mobilidade atual", a: "Bloco de mobilidade adequado" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", gap: 12, alignItems: "flex-start",
              padding: "12px 0",
              borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                background: "rgba(196,98,45,0.12)",
                border: "1px solid rgba(196,98,45,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#C4622D", marginTop: 1,
              }}>
                <IcCheck />
              </div>
              <div>
                <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "#F5F0EB", margin: "0 0 2px" }}>{item.q}</p>
                <p style={{ fontSize: "0.7rem", color: "#A0A0A0", margin: 0 }}>{item.a}</p>
              </div>
            </div>
          ))}
        </div>

        <BottomNav active="forca" />
      </div>
    );
  }

  /* ─── COM plano configurado ─── */
  const today = new Date().getDay();
  const isForcaDay = plan.focusDays.includes(today);
  const doneToday = plan.lastSessionDate
    ? new Date(plan.lastSessionDate).toDateString() === new Date().toDateString()
    : false;
  const daysSinceSession = plan.lastSessionDate
    ? Math.floor((Date.now() - new Date(plan.lastSessionDate).getTime()) / 86400000)
    : null;

  return (
    <>
    <style>{`
      @keyframes albumPulse{0%,100%{transform:scale(1);box-shadow:0 0 12px rgba(196,98,45,0.35)}50%{transform:scale(1.08);box-shadow:0 0 28px rgba(196,98,45,0.7)}}
      @keyframes breathe{0%,100%{transform:scale(1);box-shadow:0 0 12px rgba(196,98,45,0.3)}50%{transform:scale(1.06);box-shadow:0 0 24px rgba(196,98,45,0.55)}}
      @keyframes waveBar{from{height:2px}to{height:100%}}
      @keyframes eaglePulse{0%,100%{box-shadow:0 2px 14px rgba(196,98,45,0.35)}50%{box-shadow:0 4px 26px rgba(196,98,45,0.6)}}
    `}</style>
    <div style={{
      minHeight: "100dvh",
      background: "#0B0B0F",
      display: "flex",
      flexDirection: "column",
      maxWidth: 430,
      margin: "0 auto",
      paddingBottom: 80,
      overflowY: "auto",
    }}>
      {/* Header */}
      <div style={{ padding: "24px 24px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C4622D", margin: "0 0 4px" }}>
            FORÇA SAN RUN
          </p>
          <h1 style={{
            fontFamily: "'Waffle Soft', sans-serif",
            fontSize: "1.4rem",
            color: "#F5F0EB",
            fontWeight: 800,
            margin: "0 0 4px",
            lineHeight: 1.2,
          }}>
            {plan.title}
          </h1>
          <p style={{ fontSize: "0.72rem", color: "#A0A0A0", margin: 0 }}>Plano personalizado ativo</p>
        </div>
        <button
          onClick={() => navigate("/forca/avaliacao")}
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: "8px 10px",
            color: "#A0A0A0",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
          }}
        >
          <IcEdit />
          Editar
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 10, padding: "18px 24px 0" }}>
        {[
          { icon: <IcCheck />, val: String(plan.sessionsCompleted), label: "Sessões" },
          { icon: <IcClock />, val: plan.totalDuration, label: "Por sessão" },
          { icon: <IcTarget />, val: `${plan.focusDays.length}x`, label: "Por semana" },
        ].map((s, i) => (
          <div key={i} style={{
            flex: 1, padding: "12px 10px", borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
            textAlign: "center",
          }}>
            <div style={{ color: "#C4622D", display: "flex", justifyContent: "center", marginBottom: 5 }}>{s.icon}</div>
            <p style={{ fontSize: "1rem", fontWeight: 800, color: "#F5F0EB", margin: "0 0 2px" }}>{s.val}</p>
            <p style={{ fontSize: "0.6rem", color: "#A0A0A0", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Hoje é dia de força? */}
      {isForcaDay && (
        <div style={{
          margin: "16px 24px 0",
          padding: "16px",
          borderRadius: 16,
          background: "linear-gradient(135deg, rgba(196,98,45,0.15) 0%, rgba(11,11,15,0.98) 100%)",
          border: "1.5px solid rgba(196,98,45,0.4)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ color: "#C4622D", flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 800, color: "#F5F0EB", margin: "0 0 2px" }}>Hoje é dia de força</p>
            <p style={{ fontSize: "0.68rem", color: "#A0A0A0", margin: 0 }}>
              {plan.blocks.length} exercícios · {plan.totalDuration}
            </p>
          </div>
          <button
            onClick={() => navigate("/forca/sessao")}
            style={{
              background: "#C4622D", border: "none", borderRadius: 10,
              padding: "10px 14px", color: "#fff",
              fontSize: "0.72rem", fontWeight: 800, letterSpacing: "0.06em",
              textTransform: "uppercase", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            Iniciar
            <IcArrow />
          </button>
        </div>
      )}

      {/* Não é dia de força mas tem plano */}
      {!isForcaDay && (
        <div style={{
          margin: "16px 24px 0",
          padding: "14px 16px",
          borderRadius: 16,
          background: "rgba(58,95,111,0.1)",
          border: "1px solid rgba(58,95,111,0.25)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ color: "#3A5F6F", flexShrink: 0 }}>
            <IcCalendar />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#F5F0EB", margin: "0 0 2px" }}>
              {daysSinceSession === null
                ? "Ainda não fez nenhuma sessão"
                : daysSinceSession === 0
                ? "Sessão feita hoje"
                : `Última sessão há ${daysSinceSession} dia${daysSinceSession > 1 ? "s" : ""}`}
            </p>
            <p style={{ fontSize: "0.68rem", color: "#A0A0A0", margin: 0 }}>
              Próxima sessão: {plan.focusDays.map(d => DAY_LABELS[d]).join(", ")}
            </p>
          </div>
          <button
            onClick={() => navigate("/forca/sessao")}
            style={{
              background: "rgba(58,95,111,0.25)", border: "1px solid rgba(58,95,111,0.4)",
              borderRadius: 10, padding: "9px 12px",
              color: "#5a8fa5", fontSize: "0.68rem", fontWeight: 800,
              letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
            }}
          >
            Fazer Agora
          </button>
        </div>
      )}

      {/* Objetivo */}
      <div style={{
        margin: "16px 24px 0",
        padding: "16px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A0A0A0", marginBottom: 6 }}>
          OBJETIVO DO PLANO
        </p>
        <p style={{ fontSize: "0.8rem", color: "#C8C0B8", lineHeight: 1.55, margin: 0 }}>
          {plan.objective}
        </p>
      </div>

      {/* Dias de força na semana */}
      <div style={{ padding: "20px 24px 0" }}>
        <p style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "#A0A0A0", marginBottom: 12 }}>
          DIAS NA SEMANA
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {[0, 1, 2, 3, 4, 5, 6].map(d => {
            const isForca = plan.focusDays.includes(d);
            const isToday = d === today;
            return (
              <div key={d} style={{
                flex: 1, padding: "10px 4px", borderRadius: 10, textAlign: "center",
                background: doneToday && isToday
                  ? "linear-gradient(135deg,#C4622D,#a04e22)"
                  : isForca
                  ? "rgba(58,95,111,0.25)"
                  : "rgba(255,255,255,0.03)",
                border: isToday
                  ? "1.5px solid #C4622D"
                  : isForca
                  ? "1px solid rgba(58,95,111,0.45)"
                  : "1px solid rgba(255,255,255,0.07)",
              }}>
                <p style={{ fontSize: "0.58rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: doneToday && isToday ? "#fff" : isForca ? "#5a8fa5" : "#555", margin: "0 0 3px" }}>
                  {DAY_LABELS[d]}
                </p>
                <div style={{ fontSize: "0.65rem", color: doneToday && isToday ? "#fff" : isForca ? "#3A5F6F" : "transparent" }}>
                  {doneToday && isToday ? "✓" : "●"}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* ══ RITUAL SAN RUN ══ */}
      <div style={{ padding: "20px 24px 0" }}>
        {/* Header tappable */}
        <div
          onClick={handleOpenPlayer}
          style={{ display:"flex",alignItems:"center",gap:12,marginBottom:playerOpen?14:0,cursor:"pointer" }}
        >
          <div style={{
            width:40,height:40,borderRadius:"50%",flexShrink:0,
            background:"linear-gradient(135deg,#C4622D,#a04e22)",
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:playing?"0 0 16px rgba(196,98,45,0.55)":"0 0 6px rgba(196,98,45,0.2)",
            animation:playing?"albumPulse 0.9s ease-in-out infinite":"none",
            transition:"box-shadow 0.3s",
          }}>
            <img src="/logo-eagle-gold.png" alt="SAN RUN" style={{ height:24,width:24,objectFit:"contain",filter:"brightness(0) invert(1) opacity(0.9)" }}/>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontWeight:800,fontSize:"0.88rem",color:"#F5F0EB",margin:"0 0 2px" }}>Ritual SAN RUN</p>
            <p style={{ fontSize:"0.72rem",color:"#A0A0A0",lineHeight:1.4,margin:0 }}>Antes do treino, conecte mente e corpo.</p>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(196,98,45,0.15)",border:"1px solid rgba(196,98,45,0.3)",borderRadius:10,padding:"7px 13px",flexShrink:0 }}>
            <span style={{ color:"#C4622D" }}>{playing?<RI.pause/>:<RI.play/>}</span>
            <span style={{ fontSize:"0.7rem",fontWeight:700,color:"#C4622D" }}>{playing?"Tocando":"Ouvir"}</span>
          </div>
        </div>

        {/* Player inline */}
        {playerOpen && (
          <div style={{ marginTop:14 }}>
            <RitualPlayer
              playing={playing} muted={muted}
              trackIdx={trackIdx} phraseIdx={phraseIdx}
              onTogglePlay={handleTogglePlay}
              onToggleMute={handleToggleMute}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </div>
        )}

        {/* Mini wave when playing but collapsed */}
        {playing && !playerOpen && (
          <div style={{ display:"flex",gap:2,alignItems:"flex-end",height:16,marginTop:10 }}>
            {Array.from({length:28},(_,i)=>(
              <div key={i} style={{
                flex:1,borderRadius:2,minHeight:2,
                background:i%4===0?"#C4622D":"rgba(196,98,45,0.25)",
                animation:`waveBar 0.${5+(i%5)}s ease-in-out ${i*0.04}s infinite alternate`,
              }}/>
            ))}
          </div>
        )}
      </div>

      {/* CTA sessão */}
      <div style={{ padding: "20px 24px 0" }}>
        <button
          onClick={() => navigate("/forca/sessao")}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            border: "none",
            background: "linear-gradient(135deg, #C4622D, #e07a45)",
            color: "#fff",
            fontSize: "0.88rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <IcDumbbell />
          Iniciar Sessão de Força
        </button>
      </div>

      {/* Atalhos rápidos */}
      <div style={{ padding: "16px 24px 0", display: "flex", gap: 10 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            flex: 1, padding: "12px", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.04)",
            color: "#A0A0A0", fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: "0.05em", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}
        >
          <IcHome /> Dashboard
        </button>
        <button
          onClick={() => navigate("/weekly")}
          style={{
            flex: 1, padding: "12px", borderRadius: 12,
            border: "1px solid rgba(58,95,111,0.3)",
            background: "rgba(58,95,111,0.08)",
            color: "#5a8fa5", fontSize: "0.72rem", fontWeight: 700,
            letterSpacing: "0.05em", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}
        >
          <IcCalendar /> Semana
        </button>
      </div>

      <BottomNav active="forca" />
    </div>
    </>
  );
}

