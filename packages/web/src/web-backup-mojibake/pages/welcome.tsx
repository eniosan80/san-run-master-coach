import { useLocation } from "wouter";

/* ─── Botão padrão SAN RUN ──────────────────────────── */
const SanBtn = ({ label, onClick }: { label: string; onClick?: () => void }) => (
  <button
    className="btn"
    onClick={onClick}
    style={{
      background: "linear-gradient(135deg, #D4722D 0%, #C4622D 50%, #A85228 100%)",
      color: "var(--offwhite)",
      boxShadow: "0 6px 32px rgba(196,98,45,0.42), 0 2px 8px rgba(196,98,45,0.28), inset 0 1px 0 rgba(255,255,255,0.1)",
      border: "none", borderRadius: 18, minHeight: 60,
      fontSize: "1rem", fontWeight: 800, letterSpacing: "0.01em",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", position: "relative", overflow: "hidden", width: "100%",
    }}
  >
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.08) 50%, transparent 65%)",
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

/* ─── Pilares da marca ──────────────────────────────── */
const PILLARS = [
  { icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
    </svg>
  ), text: "Baseado em ciência do esporte", color: "terra" },
  { icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ), text: "Constância antes de progressão", color: "terra" },
  { icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  ), text: "Mente San, Corpo Run", color: "stone" },
  { icon: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  ), text: "Resultado vem do processo", color: "stone" },
];

export default function WelcomePage() {
  const [, nav] = useLocation();

  return (
    <div className="shell" style={{ background: "var(--bg)", overflow: "hidden" }}>

      {/* Ambient background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        background: [
          "radial-gradient(ellipse 130% 55% at 50% -5%, rgba(196,98,45,0.22) 0%, transparent 52%)",
          "radial-gradient(ellipse 90% 40% at 90% 110%, rgba(45,74,86,0.18) 0%, transparent 55%)",
        ].join(", "),
      }} />

      {/* Linha de brilho topo */}
      <div style={{
        position: "absolute", top: 0, left: "5%", right: "5%", height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(196,98,45,0.55) 50%, transparent 100%)",
        zIndex: 2,
      }} />

      {/* ── CONTEÚDO PRINCIPAL ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        position: "relative", zIndex: 2,
        padding: "clamp(44px, 11vw, 58px) 24px 16px",
        overflow: "hidden",
      }}>

        {/* GRUPO TOPO */}
        <div>
          {/* Badge */}
          <div className="anim-in" style={{ marginBottom: "clamp(14px, 3.5vw, 20px)" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(196,98,45,0.1)", border: "1px solid rgba(196,98,45,0.25)",
              borderRadius: 20, padding: "5px 14px", marginBottom: 8,
            }}>
              <img src="/logo-shield.png" alt="" style={{ height: 16, objectFit: "contain", filter: "drop-shadow(0 1px 4px rgba(196,98,45,0.4))" }} />
              <span style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--terra-lite)" }}>
                SAN RUN MASTER COACH
              </span>
            </div>
            <p style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--muted)" }}>
              Assessoria de Corrida Premium
            </p>
          </div>

          {/* FRASE MANIFESTO — 2 linhas */}
          <div className="anim-up d1">
            <div style={{
              width: 32, height: 3,
              background: "linear-gradient(90deg, var(--terra), var(--terra-lite))",
              borderRadius: 2, marginBottom: 14,
              boxShadow: "0 0 14px rgba(196,98,45,0.6)",
            }} />

            <h1 style={{
              fontSize: "clamp(2.7rem, 11vw, 3.5rem)", fontWeight: 900,
              lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: 4,
              display: "flex", alignItems: "baseline", gap: "0.2em",
            }}>
              <span style={{ color: "var(--offwhite)" }}>MENTE</span>
              <span style={{ color: "var(--terra)" }}>SAN</span>
            </h1>

            <h1 style={{
              fontSize: "clamp(2.7rem, 11vw, 3.5rem)", fontWeight: 900,
              lineHeight: 1.0, letterSpacing: "-0.04em", marginBottom: 14,
              display: "flex", alignItems: "baseline", gap: "0.2em",
            }}>
              <span style={{ color: "var(--offwhite)" }}>CORPO</span>
              <span style={{ color: "var(--terra)" }}>RUN</span>
            </h1>

            <p style={{
              fontSize: "clamp(0.76rem, 2.9vw, 0.86rem)", color: "var(--text-secondary)",
              lineHeight: 1.6, maxWidth: "80%", fontWeight: 400,
            }}>
              Ciência, processo e mentalidade — um treinador que entende o seu momento.
            </p>
          </div>
        </div>

        {/* ESCUDO CENTRAL — tamanho fixo, sem flex: 1 pra não empurrar conteúdo */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center",
          padding: "10px 0 6px",
          position: "relative",
        }}>
          {/* Glow radial */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(196,98,45,0.12) 0%, transparent 70%)",
            filter: "blur(16px)",
            animation: "eagleGlow 4s ease-in-out infinite",
            pointerEvents: "none",
          }} />

          {/* Escudo */}
          <img
            src="/logo-shield.png"
            alt="SAN RUN"
            style={{
              width: "clamp(90px, 28vw, 130px)",
              height: "auto", objectFit: "contain",
              opacity: 0.93,
              filter: "drop-shadow(0 4px 24px rgba(196,98,45,0.42)) drop-shadow(0 2px 10px rgba(0,0,0,0.8))",
              animation: "eagleFloat 6s ease-in-out infinite",
              position: "relative", zIndex: 1,
            }}
          />

          {/* Texto bem-vindo abaixo do escudo */}
          <div style={{
            textAlign: "center", marginTop: 8, zIndex: 1, position: "relative",
          }}>
            <p style={{
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--terra-lite)", opacity: 0.85,
              margin: 0,
            }}>
              Bem-vindo(a) à
            </p>
            <p style={{
              fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em",
              textTransform: "uppercase", color: "var(--offwhite)", opacity: 0.88,
              margin: 0,
            }}>
              assessoria SAN RUN
            </p>
          </div>
        </div>

        {/* GRUPO FUNDO: pilares */}
        <div style={{ marginTop: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10, opacity: 0.35, marginBottom: 10,
          }}>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--muted)" }}>Nossa base</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

          <div className="anim-up d2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 10px", marginBottom: 8 }}>
            {PILLARS.map(({ icon, text, color }, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 7,
                background: color === "terra" ? "rgba(196,98,45,0.07)" : "rgba(58,95,111,0.08)",
                border: `1px solid ${color === "terra" ? "rgba(196,98,45,0.15)" : "rgba(58,95,111,0.18)"}`,
                borderRadius: 12, padding: "8px 10px",
              }}>
                <span style={{ color: color === "terra" ? "var(--terra-lite)" : "var(--stone-lite)", flexShrink: 0, marginTop: 1 }}>
                  {icon}
                </span>
                <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-secondary)", lineHeight: 1.35 }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        position: "relative", zIndex: 3,
        padding: "10px 20px calc(22px + env(safe-area-inset-bottom, 0px))",
        background: "linear-gradient(to top, var(--bg) 75%, transparent)",
        flexShrink: 0, display: "flex", flexDirection: "column", gap: 10,
      }} className="anim-up d3">
        <SanBtn label="Começar avaliação" onClick={() => nav("/onboarding")} />

        {/* Wordmark rodapé */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, paddingTop: 2, opacity: 0.18 }}>
          <img src="/logo-wordmark.png" alt="SAN RUN" style={{ height: 13, objectFit: "contain" }} />
        </div>
      </div>

      <style>{`
        @keyframes eagleFloat {
          0%   { transform: translateY(0px)   rotate(0deg); }
          30%  { transform: translateY(-9px)  rotate(0.4deg); }
          60%  { transform: translateY(-5px)  rotate(-0.3deg); }
          100% { transform: translateY(0px)   rotate(0deg); }
        }
        @keyframes eagleGlow {
          0%,100% { opacity: 0.5; }
          50%      { opacity: 0.9; }
        }
        @keyframes eagleBtnPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.82; transform: scale(0.95); }
        }
        @keyframes welcomeFloat {
          0%,100% { transform: translateY(0px); opacity: 0.85; }
          50%      { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
