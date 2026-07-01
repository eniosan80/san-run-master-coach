import { useLocation, useParams } from "wouter";
import { BottomNav } from "../components/BottomNav";
import { getExercisesByCategory, CATEGORY_META } from "../lib/forca-data";
import { FORCA_CATEGORIES } from "./forca";

const IcBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);
const IcChevron = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);
const IcCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const LEVEL_COLOR: Record<string, string> = {
  "Iniciante": "#3A5F6F",
  "Intermediário": "#a07040",
  "Avançado": "#C4622D",
};

/* ── Illustration SVGs ── */
function ExerciseIllustration({ type, color }: { type: string; color: string }) {
  const c = color;
  switch (type) {
    case "squat":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="8" r="5" stroke={c} strokeWidth="1.8"/>
          <path d="M24 13v10M14 30l10-7 10 7M14 30v8M34 30v8M14 38h6M28 38h6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "lunge":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="20" cy="8" r="5" stroke={c} strokeWidth="1.8"/>
          <path d="M20 13v8M20 21l8 8M12 29h16M12 29v8M28 29v-4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "bridge":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M8 36h8l6-12 6 12h12" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="24" r="3.5" stroke={c} strokeWidth="1.8"/>
          <path d="M8 36v4M40 36v4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "calf":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="8" r="5" stroke={c} strokeWidth="1.8"/>
          <path d="M24 13v18M19 31h10M19 31v8M29 31v8M19 39h3M26 39h3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M21 37v-2M27 37v-2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "plank":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="10" cy="20" r="4" stroke={c} strokeWidth="1.8"/>
          <path d="M14 22l28 4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M42 26v6M14 28v6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "lateral":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="10" cy="22" r="4" stroke={c} strokeWidth="1.8"/>
          <path d="M14 24l28 0M14 24v12M42 24v12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    case "skipping":
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="8" r="5" stroke={c} strokeWidth="1.8"/>
          <path d="M24 13v8M16 22l8-1M32 18l-8 3M18 30l6-9 6 5M18 30v8M30 26v12" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
    default:
      return (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="8" r="5" stroke={c} strokeWidth="1.8"/>
          <path d="M24 13v14M16 20l8 7 8-7M18 30v10M30 30v10" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      );
  }
}

export default function ForcaCategoriaPage() {
  const [, navigate] = useLocation();
  const params = useParams<{ categoryId: string }>();
  const categoryId = params.categoryId;

  const meta = CATEGORY_META[categoryId];
  const catData = FORCA_CATEGORIES.find(c => c.id === categoryId);
  const exercises = getExercisesByCategory(categoryId);

  if (!meta || !catData) {
    navigate("/forca");
    return null;
  }

  const color = catData.color;

  return (
    <>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes floatSlogan{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        .pf{animation:fadeUp 0.4s ease both}
        .d0{animation-delay:0s}.d1{animation-delay:.07s}.d2{animation-delay:.12s}.d3{animation-delay:.17s}.d4{animation-delay:.22s}.d5{animation-delay:.27s}
        .slogan-float{animation:floatSlogan 4s ease-in-out infinite}
        .ex-card{transition:transform .15s,box-shadow .15s}
        .ex-card:active{transform:scale(0.975)!important}
      `}</style>

      <div className="shell screen-with-nav" style={{ overflow:"hidden" }}>
        <div className="screen">
          {/* Glow top */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:200,background:`radial-gradient(ellipse 120% 100% at 50% 0%,${color}18 0%,transparent 70%)`,pointerEvents:"none",zIndex:0 }}/>

          <div className="page-content" style={{ position:"relative",zIndex:1 }}>

            {/* ══ HEADER ══ */}
            <div className="pf d0" style={{ marginBottom:20 }}>
              <button
                onClick={() => navigate("/forca")}
                style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",display:"flex",alignItems:"center",gap:6,padding:"0 0 14px",marginLeft:-4 }}
              >
                <IcBack/>
                <span style={{ fontSize:"0.75rem",fontWeight:600 }}>Força SAN RUN</span>
              </button>

              <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:8 }}>
                <div style={{ width:52,height:52,borderRadius:14,flexShrink:0,background:`${color}20`,border:`1.5px solid ${color}40`,display:"flex",alignItems:"center",justifyContent:"center",color }}>
                  {catData.icon}
                </div>
                <div>
                  <h1 style={{ fontSize:"clamp(1.3rem,6vw,1.6rem)",fontWeight:900,color:"var(--offwhite)",lineHeight:1.1,marginBottom:4 }}>
                    {meta.label}
                  </h1>
                  <p style={{ fontSize:"0.72rem",color:"var(--muted)" }}>{meta.objective}</p>
                </div>
              </div>

              {/* Info pills */}
              <div style={{ display:"flex",gap:8 }}>
                <span style={{ fontSize:"0.62rem",fontWeight:700,color,background:`${color}18`,border:`1px solid ${color}30`,borderRadius:8,padding:"4px 10px" }}>{exercises.length} exercícios</span>
                <span style={{ fontSize:"0.62rem",fontWeight:600,color:"var(--muted)",background:"rgba(255,255,255,0.05)",borderRadius:8,padding:"4px 10px" }}>{catData.duration}</span>
              </div>
            </div>

            {/* ══ LISTA DE EXERCÍCIOS ══ */}
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {exercises.map((ex, i) => (
                <div
                  key={ex.id}
                  className={`pf d${Math.min(i+1,5)} ex-card`}
                  onClick={() => navigate(`/forca/${categoryId}/${ex.id}`)}
                  style={{
                    background:"var(--surface)",
                    border:"1px solid var(--border)",
                    borderRadius:18,
                    padding:"16px",
                    cursor:"pointer",
                    display:"flex",
                    alignItems:"center",
                    gap:14,
                  }}
                >
                  {/* Illustration */}
                  <div style={{ width:56,height:56,borderRadius:14,flexShrink:0,background:`${color}12`,border:`1px solid ${color}25`,display:"flex",alignItems:"center",justifyContent:"center" }}>
                    <ExerciseIllustration type={ex.illustration} color={color}/>
                  </div>

                  <div style={{ flex:1,minWidth:0 }}>
                    <p style={{ fontWeight:800,fontSize:"0.9rem",color:"var(--offwhite)",marginBottom:4 }}>{ex.name}</p>
                    <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                      {/* Level */}
                      <span style={{ fontSize:"0.58rem",fontWeight:700,color:LEVEL_COLOR[ex.level]||color,background:`${LEVEL_COLOR[ex.level]||color}18`,border:`1px solid ${LEVEL_COLOR[ex.level]||color}30`,borderRadius:6,padding:"2px 7px" }}>
                        {ex.level}
                      </span>
                      {/* Sets/reps or duration */}
                      <span style={{ fontSize:"0.58rem",fontWeight:600,color:"var(--muted)",background:"rgba(255,255,255,0.06)",borderRadius:6,padding:"2px 7px" }}>
                        {ex.sets && ex.reps ? `${ex.sets}x${ex.reps} reps` : ex.duration ?? ""}
                      </span>
                    </div>
                    <p style={{ fontSize:"0.68rem",color:"var(--muted)",marginTop:6,lineHeight:1.4,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" as any }}>
                      {ex.why}
                    </p>
                  </div>

                  <span style={{ color:"var(--muted)",flexShrink:0 }}><IcChevron/></span>
                </div>
              ))}
            </div>

            {/* ── Start all button ── */}
            <div className="pf d5" style={{ marginTop:20,marginBottom:8 }}>
              <button
                onClick={() => navigate(`/forca/${categoryId}/${exercises[0]?.id}`)}
                style={{
                  width:"100%",
                  background:"linear-gradient(135deg,#C4622D 0%,#a04e22 100%)",
                  border:"none",borderRadius:16,padding:"14px 0",cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  color:"#fff",fontWeight:800,fontSize:"0.88rem",letterSpacing:"0.06em",textTransform:"uppercase",
                  boxShadow:"0 4px 20px rgba(196,98,45,0.35)",
                }}
              >
                <span style={{ display:"flex",alignItems:"center",gap:6 }}>
                  <IcCheck/> Iniciar Sessão
                </span>
              </button>
            </div>

            {/* slogan */}
            <div className="slogan-float" style={{ textAlign:"center",padding:"24px 0 8px" }}>
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
