import { useLocation } from "wouter";
import { loadSession } from "../lib/store";

/* ─── Botão padrão SAN RUN ──────────────────────────── */
const SanBtn = ({ label, onClick, ghost }: { label: string; onClick?: () => void; ghost?: boolean }) => {
  if (ghost) return (
    <button className="btn btn-ghost" onClick={onClick} style={{ minHeight: 52, fontSize: "0.9rem" }}>
      {label}
    </button>
  );
  return (
    <button className="btn" onClick={onClick} style={{
      background: "linear-gradient(135deg, #D4722D 0%, #C4622D 50%, #A85228 100%)",
      color: "var(--offwhite)",
      boxShadow: "0 6px 28px rgba(196,98,45,0.38), 0 2px 8px rgba(196,98,45,0.22), inset 0 1px 0 rgba(255,255,255,0.1)",
      border: "none", borderRadius: 18, minHeight: 58,
      fontSize: "1rem", fontWeight: 800, letterSpacing: "0.01em",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", position: "relative", overflow: "hidden", width: "100%",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <span style={{ position: "relative" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative", animation: "eagleBtnPulse 3s ease-in-out infinite" }}>
        <img src="/logo-eagle.png" alt="" style={{ height: 24, width: 24, objectFit: "contain", filter: "brightness(0) invert(1) opacity(0.9)" }} />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    </button>
  );
};

const IconClipboard = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
  </svg>
);
const IconBrain = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2a2.5 2.5 0 0 1 5 0v1a2 2 0 0 1 2 2v.5a2 2 0 0 1 2 2 2 2 0 0 1-2 2v.5a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.5a2 2 0 0 1-2-2 2 2 0 0 1 2-2V5a2 2 0 0 1 2-2V2"/>
    <path d="M12 12v10"/><path d="M8 22h8"/>
  </svg>
);
const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

export default function DiagnosisPage() {
  const [, navigate] = useLocation();
  const session = loadSession();
  if (!session) { navigate("/"); return null; }
  const { diagnosis, athlete } = session;

  const blocks = [
    { label: "DADO",          content: diagnosis.data,           cardClass: "card-stone", icon: <IconClipboard />, accent: "var(--stone)" },
    { label: "INTERPRETAÇÃO", content: diagnosis.interpretation,  cardClass: "card-terra", icon: <IconBrain />,     accent: "var(--terra)" },
    { label: "DECISÃO",       content: diagnosis.decision,        cardClass: "card",       icon: <IconTarget />,    accent: "var(--fg)"   },
  ];

  return (
    <div className="shell">
      <div className="screen" style={{ paddingBottom: 0 }}>
        {/* Header */}
        <div className="anim-up" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <img src="/logo-shield.png" alt="" style={{ height: 28, objectFit: "contain" }} />
            <p className="d6">Diagnóstico SAN RUN</p>
          </div>
          <h2 className="d1">Análise de {athlete.name}</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
            Baseado no seu perfil e objetivos declarados.
          </p>
        </div>

        {/* Diagnosis blocks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {blocks.map((block, i) => (
            <div key={block.label} className={`${block.cardClass} anim-up`} style={{ animationDelay: `${i * 60}ms` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ color: block.accent, lineHeight: 0 }}>{block.icon}</span>
                <span style={{
                  fontSize: 10, fontWeight: 800, textTransform: "uppercase" as const,
                  letterSpacing: "0.2em", color: block.accent,
                  background: `${block.accent}18`, border: `1px solid ${block.accent}30`,
                  borderRadius: 20, padding: "3px 10px",
                }}>
                  {block.label}
                </span>
              </div>
              <p style={{ color: "var(--fg)", fontSize: 14, lineHeight: 1.7 }}>{block.content}</p>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="card anim-up" style={{ marginTop: 12 }}>
          <p style={{ color: "var(--muted)", fontSize: 12, lineHeight: 1.6 }}>
            <span style={{ color: "var(--terra)", fontWeight: 600 }}>Importante: </span>
            Este diagnóstico é uma orientação baseada nas suas respostas. Não substitui avaliação médica ou de profissional de educação física.
          </p>
        </div>
        <div style={{ height: 100 }} />
      </div>

      <div className="bottom-bar">
        <SanBtn label="Entender o RPE" onClick={() => navigate("/rpe")} />
        <SanBtn label="Ir para o painel" onClick={() => navigate("/dashboard")} ghost />
      </div>

      <style>{`
        @keyframes eagleBtnPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.82; transform: scale(0.95); }
        }
      `}</style>
    </div>
  );
}
