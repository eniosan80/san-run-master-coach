import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { BottomNav } from "../components/BottomNav";
import { getExerciseById, getExercisesByCategory, CATEGORY_META } from "../lib/forca-data";
import { loadSession, saveSession } from "../lib/store";

/* ── icons ── */
const IcBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);
const IcCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IcPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const IcNext = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const IcBody = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v8M8 9h8M9 22l3-7 3 7"/>
  </svg>
);

const LEVEL_COLOR: Record<string, string> = {
  "Iniciante": "#3A5F6F",
  "Intermediário": "#a07040",
  "Avançado": "#C4622D",
};

/* ── Animated Illustration ── */
function AnimatedIllustration({ type, color, playing }: { type: string; color: string; playing: boolean }) {
  const c = color;
  const anim = playing ? "exerciseAnim 1.2s ease-in-out infinite alternate" : "none";

  const bodyStyle = {
    animation: anim,
    transformOrigin: "center 20px",
  };

  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" style={{ display:"block",margin:"0 auto" }}>
      {/* floor */}
      <line x1="20" y1="105" x2="100" y2="105" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" strokeLinecap="round"/>

      <g style={bodyStyle}>
        {/* head */}
        <circle cx="60" cy="20" r="10" stroke={c} strokeWidth="2"/>

        {type === "squat" && <>
          <path d="M60 30v20" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          <path d="M44 58l16-8 16 8" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M44 58v24M76 58v24" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          <path d="M36 38l8-8M84 38l-8-8" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        </>}

        {type === "bridge" && <>
          {/* lying figure */}
          <line x1="20" y1="75" x2="55" y2="75" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          <circle cx="18" cy="72" r="8" stroke={c} strokeWidth="2"/>
          <path d="M55 75l8-20 12 20" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M75 75v20M87 55v40" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        </>}

        {type === "plank" && <>
          <line x1="15" y1="70" x2="105" y2="65" stroke={c} strokeWidth="2.5" strokeLinecap="round"/>
          <circle cx="14" cy="65" r="8" stroke={c} strokeWidth="2"/>
          <path d="M105 65v18" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          <path d="M15 70v18" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        </>}

        {type === "lunge" && <>
          <path d="M60 30v20" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          <path d="M48 42l12-12 8 12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M60 50l-16 18v18M60 50l16 10v26" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        </>}

        {type === "skipping" && <>
          <path d="M60 30v18" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          <path d="M45 40l15-10 10 10" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M60 48l-12 16v22M60 48l12 10v26" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          {/* raised knee */}
          <path d="M72 58l10-12" stroke={c} strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2"/>
        </>}

        {(type !== "squat" && type !== "bridge" && type !== "plank" && type !== "lunge" && type !== "skipping") && <>
          <path d="M60 30v22" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          <path d="M44 44l16-14 16 14" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M44 56v30M76 56v30" stroke={c} strokeWidth="2" strokeLinecap="round"/>
          <path d="M36 40l8-10M84 40l-8-10" stroke={c} strokeWidth="2" strokeLinecap="round"/>
        </>}
      </g>
    </svg>
  );
}

export default function ForcaExercicioPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoryId: string; exerciseId: string }>();
  const { categoryId, exerciseId } = params;

  const exercise = getExerciseById(exerciseId);
  const allExercises = getExercisesByCategory(categoryId);
  const currentIndex = allExercises.findIndex(e => e.id === exerciseId);
  const nextExercise = currentIndex >= 0 && currentIndex < allExercises.length - 1 ? allExercises[currentIndex + 1] : null;

  const meta = CATEGORY_META[categoryId];
  const color = meta?.color ?? "#C4622D";

  const [added, setAdded] = useState(false);
  const [playing, setPlaying] = useState(false);

  if (!exercise || !meta) {
    navigate("/forca");
    return null;
  }

  const handleAddToWorkout = () => {
    const session = loadSession();
    if (!session) return;
    const forcaHistory = (session as any).forcaHistory ?? [];
    forcaHistory.push({ categoryId, exerciseId, date: new Date().toISOString() });
    (session as any).forcaHistory = forcaHistory;
    saveSession(session);
    setAdded(true);
  };

  const LEVEL_COLOR_MAP: Record<string, string> = {
    "Iniciante": "#3A5F6F",
    "Intermediário": "#a07040",
    "Avançado": "#C4622D",
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes exerciseAnim{from{transform:scaleY(1) rotate(-3deg)}to{transform:scaleY(0.9) rotate(3deg)}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 16px rgba(196,98,45,0.3)}50%{box-shadow:0 0 32px rgba(196,98,45,0.6)}}
        @keyframes floatSlogan{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .pf{animation:fadeUp 0.4s ease both}
        .d0{animation-delay:0s}.d1{animation-delay:.07s}.d2{animation-delay:.12s}.d3{animation-delay:.17s}.d4{animation-delay:.22s}.d5{animation-delay:.27s}
        .slogan-float{animation:floatSlogan 4s ease-in-out infinite}
        .tap:active{transform:scale(0.975);transition:transform .1s}
        .step-item{transition:background .2s}
      `}</style>

      <div className="shell screen-with-nav" style={{ overflow:"hidden" }}>
        <div className="screen">
          <div style={{ position:"absolute",top:0,left:0,right:0,height:220,background:`radial-gradient(ellipse 130% 100% at 50% 0%,${color}15 0%,transparent 70%)`,pointerEvents:"none",zIndex:0 }}/>

          <div className="page-content" style={{ position:"relative",zIndex:1 }}>

            {/* back */}
            <div className="pf d0" style={{ marginBottom:8 }}>
              <button
                onClick={() => navigate(`/forca/${categoryId}`)}
                style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",display:"flex",alignItems:"center",gap:6,padding:"0 0 8px",marginLeft:-4 }}
              >
                <IcBack/>
                <span style={{ fontSize:"0.75rem",fontWeight:600 }}>{meta.label}</span>
              </button>
            </div>

            {/* ══ HERO ══ */}
            <div className="pf d1" style={{ background:`linear-gradient(135deg,${color}14 0%,rgba(20,20,34,0.98) 100%)`,border:`1px solid ${color}35`,borderRadius:22,padding:"24px 18px",marginBottom:16 }}>
              {/* Illustration area */}
              <div
                className="tap"
                onClick={() => setPlaying(p => !p)}
                style={{ background:`${color}0e`,borderRadius:16,padding:"20px 0",marginBottom:18,cursor:"pointer",position:"relative",overflow:"hidden" }}
              >
                <div style={{ position:"absolute",inset:0,background:`radial-gradient(circle at 50% 50%,${color}12 0%,transparent 70%)`,pointerEvents:"none",animation:playing?"pulseGlow 1.5s ease-in-out infinite":"none" }}/>
                <AnimatedIllustration type={exercise.illustration} color={color} playing={playing}/>
                {/* play hint */}
                <div style={{ textAlign:"center",marginTop:8 }}>
                  <span style={{ fontSize:"0.62rem",fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:`${color}99` }}>
                    {playing ? "● Animando" : "Toque para animar"}
                  </span>
                </div>
              </div>

              {/* Name + badges */}
              <h1 style={{ fontSize:"clamp(1.3rem,6vw,1.6rem)",fontWeight:900,color:"var(--offwhite)",lineHeight:1.1,marginBottom:10 }}>
                {exercise.name}
              </h1>
              <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:16 }}>
                <span style={{ fontSize:"0.64rem",fontWeight:700,color:LEVEL_COLOR_MAP[exercise.level],background:`${LEVEL_COLOR_MAP[exercise.level]}18`,border:`1px solid ${LEVEL_COLOR_MAP[exercise.level]}35`,borderRadius:8,padding:"4px 10px" }}>
                  {exercise.level}
                </span>
                <span style={{ fontSize:"0.64rem",fontWeight:700,color,background:`${color}18`,border:`1px solid ${color}30`,borderRadius:8,padding:"4px 10px" }}>
                  {exercise.sets && exercise.reps ? `${exercise.sets} séries × ${exercise.reps} reps` : exercise.duration ?? ""}
                </span>
              </div>

              {/* Why */}
              <div style={{ background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:12,padding:"12px 14px" }}>
                <p style={{ fontSize:"0.62rem",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",marginBottom:6 }}>
                  Por que fazer?
                </p>
                <p style={{ fontSize:"0.78rem",color:"var(--fg)",lineHeight:1.6 }}>
                  {exercise.why}
                </p>
              </div>
            </div>

            {/* ══ MÚSCULOS ══ */}
            <div className="pf d2" style={{ marginBottom:14 }}>
              <p style={{ fontSize:"0.62rem",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",marginBottom:10,display:"flex",alignItems:"center",gap:6 }}>
                <IcBody/> Músculos trabalhados
              </p>
              <div style={{ display:"flex",gap:7,flexWrap:"wrap" }}>
                {exercise.muscles.map(m => (
                  <span key={m} style={{ fontSize:"0.68rem",fontWeight:600,color:"var(--stone-lite)",background:"rgba(58,95,111,0.14)",border:"1px solid rgba(58,95,111,0.25)",borderRadius:8,padding:"4px 10px" }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* ══ COMO EXECUTAR ══ */}
            <div className="pf d2" style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:"18px 16px",marginBottom:16 }}>
              <p style={{ fontSize:"0.62rem",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)",marginBottom:14 }}>
                Como executar
              </p>
              <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
                {exercise.steps.map((step, i) => (
                  <div key={i} className="step-item" style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
                    <div style={{ width:26,height:26,borderRadius:"50%",flexShrink:0,background:`${color}18`,border:`1.5px solid ${color}40`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <span style={{ fontSize:"0.65rem",fontWeight:900,color }}>{i + 1}</span>
                    </div>
                    <p style={{ fontSize:"0.78rem",color:"var(--fg)",lineHeight:1.6,paddingTop:3 }}>{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ══ CTA ══ */}
            <div className="pf d3" style={{ display:"flex",flexDirection:"column",gap:10,marginBottom:14 }}>
              <button
                onClick={handleAddToWorkout}
                disabled={added}
                style={{
                  width:"100%",
                  background: added ? "rgba(58,95,111,0.3)" : "linear-gradient(135deg,#C4622D 0%,#a04e22 100%)",
                  border: added ? "1px solid rgba(58,95,111,0.5)" : "none",
                  borderRadius:16,padding:"14px 0",cursor: added ? "default" : "pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  color:"#fff",fontWeight:800,fontSize:"0.88rem",letterSpacing:"0.06em",textTransform:"uppercase",
                  boxShadow: added ? "none" : "0 4px 20px rgba(196,98,45,0.35)",
                  transition:"all 0.3s",
                }}
              >
                {added ? <><IcCheck/> Adicionado ao Treino</> : <><IcPlus/> Adicionar ao Meu Treino</>}
              </button>

              {nextExercise && (
                <button
                  onClick={() => navigate(`/forca/${categoryId}/${nextExercise.id}`)}
                  style={{
                    width:"100%",
                    background:"rgba(255,255,255,0.04)",
                    border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:16,padding:"13px 0",cursor:"pointer",
                    display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                    color:"var(--muted)",fontWeight:700,fontSize:"0.82rem",letterSpacing:"0.04em",textTransform:"uppercase",
                    transition:"all 0.2s",
                  }}
                >
                  Próximo: {nextExercise.name} <IcNext/>
                </button>
              )}
            </div>

            {/* slogan */}
            <div className="slogan-float" style={{ textAlign:"center",padding:"20px 0 8px" }}>
              <p style={{ fontSize:"0.65rem",fontWeight:900,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(245,240,235,0.12)",lineHeight:1.9 }}>
                MENTE SAN<br/>CORPO RUN
              </p>
            </div>

          </div>
        </div>
        <BottomNav active="forca"/>
      </div>
    </>
  );
}
