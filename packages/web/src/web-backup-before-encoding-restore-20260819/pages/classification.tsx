import { useLocation } from "wouter";
import { loadSession } from "../lib/store";

/* --- Bot�o padr�o SAN RUN ---------------------------- */
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

const LEVEL_META = [
  null,
  { name: "Iniciante Absoluto",   color: "#7AAFC0", dim: "rgba(90,130,150,0.15)",  desc: "Primeiro contato com a corrida. Foco em adapta��o e consist�ncia." },
  { name: "Corredor Iniciante",   color: "#7AAFC0", dim: "rgba(58,95,111,0.18)",   desc: "Base em constru��o. Aprende a respeitar o corpo e o processo." },
  { name: "Intermedi�rio",        color: "#C4A032", dim: "rgba(120,90,40,0.15)",   desc: "Consist�ncia estabelecida. Come�a a explorar dist�ncias e ritmos." },
  { name: "Avan�ado",             color: "#C4622D", dim: "rgba(196,98,45,0.14)",   desc: "Busca performance. Treino estruturado com objetivos espec�ficos." },
  { name: "Avan�ado Performance", color: "#C4622D", dim: "rgba(196,98,45,0.18)",   desc: "Alto desempenho. Planeja para provas e monitora cada vari�vel." },
];

export default function ClassificationPage() {
  const [, nav] = useLocation();
  const s = loadSession();
  if (!s) { nav("/"); return null; }
  const { classification: c, athlete: a } = s;
  const meta = LEVEL_META[c.level] || LEVEL_META[1]!;

  return (
    <div className="shell">
      <div className="screen">

        {/* BG gradient */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${meta.dim} 0%, transparent 60%)`
        }} />

        {/* Header */}
        <div style={{ padding: "52px 24px 0", position: "relative", zIndex: 1 }} className="anim-in">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/logo-shield.png" alt="" style={{ width: 32, objectFit: "contain" }} />
            <span className="t-caption" style={{ color: "var(--terra)", letterSpacing: "0.14em" }}>
              CLASSIFICA��O SAN RUN
            </span>
          </div>
        </div>

        {/* Hero */}
        <div style={{ padding: "32px 24px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <div className="anim-up d1" style={{ marginBottom: 4 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 88, height: 88, borderRadius: "50%",
              border: `2px solid ${meta.color}40`, background: meta.dim, marginBottom: 16,
            }}>
              <span style={{ fontSize: "2.4rem", fontWeight: 800, color: meta.color, lineHeight: 1 }}>{c.level}</span>
            </div>
          </div>

          <div className="anim-up d2">
            <p className="t-caption" style={{ color: "var(--muted)", marginBottom: 6 }}>SEU N�VEL ATUAL</p>
            <h1 className="t-h1" style={{ color: meta.color, marginBottom: 8 }}>{c.levelName || meta.name}</h1>
            <p className="t-body" style={{ maxWidth: 280, margin: "0 auto" }}>{meta.desc}</p>
          </div>
        </div>

        {/* Level ladder */}
        <div style={{ padding: "0 24px 20px", position: "relative", zIndex: 1 }} className="anim-up d2">
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            {[1,2,3,4,5].map(l => (
              <div key={l} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div className={`level-bar${l <= c.level ? (l === c.level ? " current" : " filled") : ""}`}
                  style={{ height: `${4 + l * 2}px` }} />
                <span style={{ fontSize: "0.6rem", fontWeight: 700, color: l === c.level ? "var(--terra-lite)" : "var(--muted2)" }}>N{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info cards */}
        <div style={{ padding: "0 24px 28px", display: "flex", flexDirection: "column", gap: 10, position: "relative", zIndex: 1 }}>
          <div className="card-stone anim-up d3">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(58,95,111,0.25)", border: "1px solid rgba(58,95,111,0.3)",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--stone-lite)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
              </div>
              <div>
                <p className="t-caption" style={{ color: "var(--stone-lite)", marginBottom: 4 }}>Fase atual</p>
                <p style={{ fontWeight: 700, color: "var(--offwhite)", fontSize: "1rem" }}>{c.phase}</p>
              </div>
            </div>
          </div>

          <div className="card anim-up d3">
            <p className="t-caption" style={{ color: "var(--terra)", marginBottom: 10 }}>Por que esse n�vel?</p>
            <p className="t-body" style={{ lineHeight: 1.7 }}>{c.reason}</p>
          </div>

          <div className="card-terra anim-up d4">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(196,98,45,0.18)",
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--terra-lite)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <div>
                <p className="t-caption" style={{ color: "var(--terra-lite)", marginBottom: 6 }}>Pr�ximo foco</p>
                <p className="t-body">{c.nextFocus}</p>
              </div>
            </div>
          </div>

          <div className="card anim-up d5" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p className="t-caption" style={{ marginBottom: 3 }}>Atleta</p>
              <p style={{ fontWeight: 700, color: "var(--offwhite)", fontSize: "1rem" }}>{a.name}</p>
            </div>
            <img src="/logo-shield.png" alt="" style={{ width: 30, opacity: 0.35 }} />
          </div>
        </div>
        <div style={{ height: 100 }} />
      </div>

      <div className="bottom-bar anim-up d5">
        <SanBtn label="Pr�ximo: escala RPE" onClick={() => nav("/rpe")} />
        <SanBtn label="Ir para o painel" onClick={() => nav("/dashboard")} ghost />
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
