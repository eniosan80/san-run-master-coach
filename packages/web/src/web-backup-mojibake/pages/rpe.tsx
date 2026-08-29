import { useLocation } from "wouter";

/* ─── Botão padrão SAN RUN ──────────────────────────── */
const SanBtn = ({ label, onClick, ghost }: { label: string; onClick?: () => void; ghost?: boolean }) => {
  if (ghost) return (
    <button
      className="btn btn-ghost"
      onClick={onClick}
      style={{ minHeight: 52, fontSize: "0.9rem", fontWeight: 700 }}
    >
      {label}
    </button>
  );
  return (
    <button
      className="btn"
      onClick={onClick}
      style={{
        background: "linear-gradient(135deg, #D4722D 0%, #C4622D 50%, #A85228 100%)",
        color: "var(--offwhite)",
        boxShadow: "0 6px 28px rgba(196,98,45,0.38), 0 2px 8px rgba(196,98,45,0.22), inset 0 1px 0 rgba(255,255,255,0.1)",
        border: "none", borderRadius: 18, minHeight: 58,
        fontSize: "1rem", fontWeight: 800, letterSpacing: "0.01em",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", position: "relative", overflow: "hidden", width: "100%",
      }}
    >
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

const scale = [
  { r: "1–2", label: "Descanso",  desc: "Mal sente o esforço. Conversa sem dificuldade.",         color: "#4A9AAD" },
  { r: "3–4", label: "Leve",      desc: "Ritmo confortável. Fala frases completas enquanto corre.", color: "#5AAFB0" },
  { r: "5–6", label: "Moderado",  desc: "Respiração elevada. Fala frases curtas, foco no ritmo.",  color: "#C4A032" },
  { r: "7–8", label: "Intenso",   desc: "Difícil conversar. Concentração total no esforço.",       color: "#C47032" },
  { r: "9–10", label: "Máximo",   desc: "Quase sem fôlego. Tudo que você tem naquele momento.",   color: "#C4422D" },
];

export default function RpePage() {
  const [, nav] = useLocation();

  return (
    <div className="shell">
      <div className="screen" style={{ padding: "52px 24px 16px" }}>

        {/* Header */}
        <div className="anim-up">
          <span className="tag tag-stone" style={{ marginBottom: 16, display: "inline-flex" }}>
            Educação do Atleta
          </span>
          <h1 className="t-h1" style={{ marginBottom: 10 }}>Escala de Esforço<br />RPE</h1>
          <p className="t-body" style={{ marginBottom: 28 }}>
            <strong style={{ color: "var(--offwhite)" }}>RPE</strong> (Rating of Perceived Exertion) é a sua percepção de esforço de 1 a 10. Aprender a calibrar o esforço é uma das habilidades mais importantes do corredor.
          </p>
        </div>

        {/* Gradient bar */}
        <div className="anim-up d1" style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
            {scale.map((s, i) => (
              <div key={i} className="rpe-segment" style={{ background: s.color }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="t-caption">Mínimo (1)</span>
            <span className="t-caption">Máximo (10)</span>
          </div>
        </div>

        {/* Scale items */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {scale.map((s, i) => (
            <div key={i} className={`anim-up d${i+2}`} style={{
              display: "flex", alignItems: "center", gap: 14,
              background: "var(--surface)", border: "1px solid var(--border)",
              borderRadius: 14, padding: "14px 16px"
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 12, flexShrink: 0,
                background: `${s.color}14`, border: `1px solid ${s.color}28`,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.r}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--offwhite)", marginBottom: 3 }}>{s.label}</p>
                <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.4 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Regra de ouro */}
        <div className="card-stone anim-up d6" style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(58,95,111,0.25)",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--stone-lite)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div>
              <p className="t-caption" style={{ color: "var(--stone-lite)", marginBottom: 8 }}>Regra de ouro SAN RUN</p>
              <p className="t-body">
                A maioria dos treinos de base deve ficar entre{" "}
                <strong style={{ color: "var(--offwhite)" }}>RPE 4–6</strong>. Correr no limite todo dia é o caminho mais curto para o overtraining.{" "}
                <strong style={{ color: "var(--offwhite)" }}>Consistência bate intensidade.</strong>
              </p>
            </div>
          </div>
        </div>
        <div style={{ height: 16 }} />
      </div>

      {/* Bottom bar — SEM check-in, só RPE e Painel */}
      <div className="bottom-bar">
        <SanBtn label="Ir para o Painel" onClick={() => nav("/dashboard")} />
        <button className="btn btn-ghost" onClick={() => nav("/rpe")} style={{ minHeight: 48, fontSize: "0.875rem" }}>
          Entender RPE novamente
        </button>
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
