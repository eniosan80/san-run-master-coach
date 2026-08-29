import { useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import {
  loadSession,
  saveSession,
  clearSession,
  generateDefaultWeeklyPlan,
  refreshWeeklyPlanStatuses,
} from "../lib/store";
import { BottomNav } from "../components/BottomNav";
import { RITUAL_PHRASES as _RP, TRACKS as _TR, RitualPlayer, useRitualPlayer } from "../components/RitualPlayer";

/* ------------------- helpers -- */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}
function daysUntil(dateStr?: string) {
  if (!dateStr) return null;
  const t = new Date(dateStr);
  const today = new Date(); today.setHours(0,0,0,0);
  const d = Math.ceil((t.getTime() - today.getTime()) / 86400000);
  return d > 0 ? d : 0;
}
function parseGoal(goal?: string) {
  if (!goal) return null;
  const dist = goal.match(/(\d+)\s?km/i);
  const date = goal.match(/(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
  return { dist: dist ? `${dist[1]} km` : null, rawDate: date ? date[0] : null, full: goal };
}
function getMotivation(streak: number, total: number) {
  if (total === 0) return "Seu primeiro treino come�a agora. Vai ser �pico.";
  if (streak >= 14) return `${streak} dias consecutivos. Voc� � elite.`;
  if (streak >= 7)  return `${streak} dias seguidos. Isso � ra�a de verdade.`;
  if (streak >= 3)  return `${streak} dias consecutivos. Const�ncia em movimento.`;
  if (streak === 1) return "Primeiro passo dado. Amanh� � o segundo.";
  return "Resultado vem do processo. Continue.";
}

const LEVEL_NAMES    = ["","Iniciante Absoluto","Corredor Iniciante","Intermedi�rio","Avan�ado","Performance"];
const LEVEL_PROGRESS = [0, 0.1, 0.3, 0.55, 0.78, 1];
const DAYS_SHORT_PT  = ["SEG","TER","QUA","QUI","SEX","S�B","DOM"];
const STATUS_DAY_ORDER = [1,2,3,4,5,6,0];

// RITUAL_PHRASES and TRACKS imported from shared RitualPlayer component
const RITUAL_PHRASES = _RP;
const TRACKS = _TR;

/* ------------------- icons -- */
const I = {
  play:     ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause:    ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  prev:     ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  next:     ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  mute:     ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  volume:   ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  zap:      ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  target:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  clock:    ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
  trophy:   ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4a2 2 0 0 1-2-2V5h4"/><path d="M18 9h2a2 2 0 0 0 2-2V5h-4"/><path d="M12 17c-4 0-6-3-6-7V3h12v7c0 4-2 7-6 7z"/><path d="M8 21h8M12 17v4"/></svg>,
  calendar: ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check:    ()=><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  lock:     ()=><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  fire:     ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22C8 22 4 18.5 4 14c0-4 2-6 3.5-8 .5 2 2 3 2 3s-1-3 1.5-5c.5 2.5 2.5 4 2.5 4S14.5 6 14 4c3 2 6 6.5 6 10 0 4.5-4 8-8 8z"/></svg>,
  trend:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  chevron:  ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>,
  diagnosis:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  brain:    ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-1.66z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-1.66z"/></svg>,
  rpe:      ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  music:    ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
};

/* ------------------- SanBtn -- */
const SanBtn = ({
  label, onClick, small=false, ghost=false, icon,
}: {
  label:string; onClick:()=>void; small?:boolean; ghost?:boolean; icon?:React.ReactNode;
}) => (
  <button onClick={onClick} style={{
    display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,
    background:ghost?"transparent":"linear-gradient(135deg,#C4622D 0%,#a04e22 100%)",
    border:ghost?"1.5px solid rgba(196,98,45,0.5)":"none",
    borderRadius:14,cursor:"pointer",
    padding:small?"10px 18px":"13px 22px",
    boxShadow:ghost?"none":"0 2px 14px rgba(196,98,45,0.35)",
    transition:"all 0.2s",
    animation:ghost?"none":"eaglePulse 3s ease-in-out infinite",
  }}>
    {!ghost&&!icon&&(
      <img src="/logo-eagle.png" alt="" style={{ height:small?16:20,width:small?16:20,objectFit:"contain",filter:"brightness(0) invert(1) opacity(0.9)" }}/>
    )}
    {icon&&<span style={{color:ghost?"#C4622D":"#fff"}}>{icon}</span>}
    <span style={{ color:ghost?"#C4622D":"#fff",fontWeight:700,fontSize:small?"0.78rem":"0.88rem",letterSpacing:"0.04em",textTransform:"uppercase" }}>
      {label}
    </span>
  </button>
);

// RitualPlayer imported from ../components/RitualPlayer

/* ------------------- Workout Modal -- */
function WorkoutStartModal({
  visible,onStartNow,onListen,onClose,
}:{
  visible:boolean;onStartNow:()=>void;onListen:()=>void;onClose:()=>void;
}) {
  if (!visible) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:300,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",animation:"fadeInBg 0.2s ease both" }}>
      <div style={{ width:"100%",maxWidth:430,margin:"0 auto",background:"linear-gradient(180deg,rgba(20,20,34,0.99) 0%,#0B0B0F 100%)",borderTop:"1px solid rgba(196,98,45,0.3)",borderRadius:"24px 24px 0 0",padding:"28px 20px 44px",animation:"slideUp 0.35s cubic-bezier(.34,1.4,.64,1) both" }}>
        <div style={{ textAlign:"center",marginBottom:20 }}>
          <div style={{ width:68,height:68,borderRadius:"50%",background:"linear-gradient(135deg,#C4622D,#a04e22)",display:"inline-flex",alignItems:"center",justifyContent:"center",boxShadow:"0 0 30px rgba(196,98,45,0.45)",animation:"eaglePulse 2s ease-in-out infinite" }}>
            <img src="/logo-eagle-gold.png" alt="" style={{ height:44,width:44,objectFit:"contain",filter:"brightness(0) invert(1) opacity(0.95)" }}/>
          </div>
        </div>
        <h2 style={{ textAlign:"center",fontWeight:900,fontSize:"1.1rem",color:"var(--offwhite)",letterSpacing:"-0.02em",marginBottom:8,lineHeight:1.3 }}>
          Preparado para entrar no<br/>modo SAN RUN?
        </h2>
        <p style={{ textAlign:"center",fontSize:"0.78rem",color:"var(--muted)",marginBottom:26,lineHeight:1.55 }}>
          Cada treino � um ato de comprometimento com quem voc� quer se tornar.
        </p>
        <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
          <SanBtn label="Come�ar Treino" onClick={onStartNow}/>
          <button onClick={onListen} style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(196,98,45,0.3)",borderRadius:14,padding:"13px 22px",cursor:"pointer",color:"var(--terra)",fontWeight:700,fontSize:"0.85rem",letterSpacing:"0.04em",textTransform:"uppercase" }}>
            <I.music/> Ouvir Motiva��o
          </button>
          <button onClick={onClose} style={{ background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:"0.73rem",padding:"8px 0" }}>
            Agora n�o
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------- MAIN PAGE -- */
export default function DashboardPage() {
  const [, navigate] = useLocation();
  const session = loadSession();

  // Player state � from shared hook
  const [playerOpen, setPlayerOpen] = useState(false);
  const [workoutModal, setWorkoutModal] = useState(false);
  const { playing, muted, trackIdx, phraseIdx, audioRef,
    handleTogglePlay, handleToggleMute, handlePrev, handleNext, handleOpenPlayer: _openPlayer,
  } = useRitualPlayer();

  const handleOpenPlayer = useCallback(() => {
    setPlayerOpen(true);
    _openPlayer();
  }, [_openPlayer]);

  // Init weekly plan + refresh statuses so today's workout is always "active"
  useEffect(() => {
    if (!session) return;
    if (!session.weeklyPlan) {
      session.weeklyPlan = generateDefaultWeeklyPlan(
        session.classification?.level ?? 1,
        session.athlete?.trainingDays ?? []
      );
      saveSession(session);
    }
    refreshWeeklyPlanStatuses();
  }, []);

  // Workout modal
  const handleListenMotivation = () => {
    setWorkoutModal(false);
    setPlayerOpen(true);
    if (!playing && audioRef.current) { audioRef.current.play().catch(()=>{}); }
    _openPlayer();
  };

  if (!session) { navigate("/"); return null; }

  const { athlete, classification, workout, workoutHistory=[], streak=0, totalWorkouts=0 } = session;
  const checkins    = session.checkins || [];
  const lastCheckin = checkins[0];
  const todayStr    = new Date().toDateString();
  const checkedToday = checkins.some(c => new Date(c.date).toDateString() === todayStr);

  const lvl      = classification?.level ?? 1;
  const lvlName  = LEVEL_NAMES[lvl] || `N�vel ${lvl}`;
  const lvlPct   = LEVEL_PROGRESS[lvl] ?? 0;

  const today      = new Date();
  const todayJsDay = today.getDay();

  // Treino de Hoje � only from weekly plan, only on scheduled training days
  const todayPlanWorkout = session.weeklyPlan?.workouts.find(
    w => w.dayIndex === todayJsDay && w.status !== "rest"
  ) ?? null;

  type DayStatus = "done"|"active"|"next"|"locked"|"rest";
  const calDays = session.weeklyPlan
    ? STATUS_DAY_ORDER.map((jsDay,i) => {
        const w = session.weeklyPlan!.workouts[i];
        return { label:DAYS_SHORT_PT[i], isToday:jsDay===todayJsDay, status:(w?.status ?? "rest") as DayStatus };
      })
    : [] as {label:string;isToday:boolean;status:DayStatus}[];

  const goalData = parseGoal(athlete?.goal);
  const daysLeft = goalData?.rawDate ? daysUntil(goalData.rawDate) : null;

  const last7 = Array.from({length:7},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()-(6-i)); return d.toDateString(); });
  const histDates  = new Set(workoutHistory.map(r=>new Date(r.date).toDateString()));
  const consistency = Math.round((last7.filter(d=>histDates.has(d)).length/7)*100);
  const thisWk     = last7.slice(1).filter(d=>histDates.has(d)).length;
  const prevWkDates = Array.from({length:7},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()-(13-i)); return d.toDateString(); });
  const prevWk = prevWkDates.filter(d=>histDates.has(d)).length;
  const volDelta = prevWk>0 ? Math.round(((thisWk-prevWk)/prevWk)*100) : thisWk>0 ? 100 : 0;

  const rpeLabel = (r:number) => r<=3?"F�cil":r<=5?"Moderado":r<=7?"Forte":"Muito forte";

  return (
    <>
      <style>{`
        @keyframes eaglePulse{0%,100%{box-shadow:0 2px 14px rgba(196,98,45,0.35)}50%{box-shadow:0 4px 26px rgba(196,98,45,0.6)}}
        @keyframes albumPulse{0%,100%{transform:scale(1);box-shadow:0 0 12px rgba(196,98,45,0.35)}50%{transform:scale(1.08);box-shadow:0 0 28px rgba(196,98,45,0.7)}}
        @keyframes breathe{0%,100%{transform:scale(1);box-shadow:0 4px 18px rgba(196,98,45,0.4)}50%{transform:scale(1.07);box-shadow:0 4px 30px rgba(196,98,45,0.65)}}
        @keyframes floatSlogan{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeInBg{from{opacity:0}to{opacity:1}}
        @keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes waveBar{from{height:2px}to{height:100%}}
        .pf{animation:fadeUp 0.45s ease both}
        .d0{animation-delay:0s}.d1{animation-delay:.07s}.d2{animation-delay:.14s}.d3{animation-delay:.21s}.d4{animation-delay:.28s}.d5{animation-delay:.35s}.d6{animation-delay:.42s}
        .slogan-float{animation:floatSlogan 4s ease-in-out infinite}
        .cal-day-done{background:linear-gradient(135deg,#C4622D,#a04e22)!important;box-shadow:0 0 10px rgba(196,98,45,0.4)!important}
        .cal-day-active{background:rgba(58,95,111,0.55)!important;border:1.5px solid #3A5F6F!important}
        .cal-day-next{background:rgba(255,255,255,0.05)!important}
        .cal-day-locked{background:rgba(255,255,255,0.02)!important;opacity:.45!important}
        .cal-day-rest{background:rgba(255,255,255,0.02)!important}
        .prog{height:100%;border-radius:99px;background:linear-gradient(90deg,#C4622D,#e8743a);transition:width 1s cubic-bezier(.4,0,.2,1)}
        .minifill{height:100%;border-radius:99px;background:linear-gradient(90deg,#3A5F6F,#5a8fa5);transition:width 1.2s cubic-bezier(.4,0,.2,1)}
        .tap:active{transform:scale(0.975);transition:transform .1s}
        .fab-ritual{animation:breathe 3s ease-in-out infinite}
        .fab-ritual:active{transform:scale(0.9)!important;transition:transform .1s!important}
      `}</style>

      <div className="shell screen-with-nav" style={{ overflow:"hidden" }}>
        <div className="screen">
          {/* glow bg */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:200,background:"radial-gradient(ellipse 120% 100% at 50% 0%,rgba(196,98,45,0.11) 0%,transparent 70%)",pointerEvents:"none",zIndex:0 }}/>
          <img src="/logo-shield.png" alt="" style={{ position:"absolute",top:"4%",right:"-10%",height:160,opacity:0.028,pointerEvents:"none",zIndex:0 }}/>

          <div className="page-content" style={{ position:"relative",zIndex:1 }}>

            {/* -- TOPO -- */}
            <div className="pf d0" style={{ marginBottom:16 }}>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
                <div>
                  <p style={{ color:"var(--muted)",fontSize:12,fontWeight:500,marginBottom:2,letterSpacing:"0.03em" }}>{getGreeting()},</p>
                  <h1 style={{ fontSize:"clamp(1.5rem,7vw,1.9rem)",fontWeight:900,letterSpacing:"-0.03em",color:"var(--offwhite)",lineHeight:1,marginBottom:2 }}>
                    {athlete.name.split(" ")[0]}
                  </h1>
                  <p style={{ fontSize:"0.78rem",color:"var(--muted)",fontWeight:500 }}>Pronto para evoluir hoje?</p>
                </div>
                <div style={{ position:"relative" }}>
                  <div style={{ position:"absolute",inset:-10,borderRadius:"50%",background:"radial-gradient(circle,rgba(196,98,45,0.15) 0%,transparent 70%)" }}/>
                  <img src="/logo-shield.png" alt="SAN RUN" style={{ height:54,objectFit:"contain",filter:"drop-shadow(0 2px 16px rgba(196,98,45,0.35))",position:"relative" }}/>
                </div>
              </div>
              {/* N�vel */}
              <div style={{ marginTop:14,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:16,padding:"14px 16px" }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ background:"linear-gradient(135deg,#C4622D,#a04e22)",borderRadius:8,padding:"3px 9px",fontSize:"0.6rem",fontWeight:800,letterSpacing:"0.1em",color:"#fff",textTransform:"uppercase" }}>N�VEL {lvl}</div>
                    <span style={{ color:"var(--fg)",fontWeight:700,fontSize:"0.8rem" }}>{lvlName}</span>
                  </div>
                  <span style={{ fontSize:"0.68rem",color:"var(--muted)" }}>{Math.round(lvlPct*100)}%</span>
                </div>
                <div style={{ height:4,borderRadius:99,background:"rgba(255,255,255,0.07)",marginBottom:8,overflow:"hidden" }}>
                  <div className="prog" style={{ width:`${lvlPct*100}%` }}/>
                </div>
                <div style={{ display:"flex",justifyContent:"space-between" }}>
                  {["Inic.","Corr.","Inter.","Avan�.","Perf."].map((l,i)=>(
                    <span key={i} style={{ fontSize:"0.55rem",fontWeight:i+1===lvl?800:400,color:i+1===lvl?"var(--terra)":"var(--muted)" }}>{l}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* -- CHECK-IN -- */}
            {!checkedToday&&(
              <div className="pf d1" style={{ background:"linear-gradient(135deg,rgba(196,98,45,0.08) 0%,var(--surface) 100%)",border:"1px solid rgba(196,98,45,0.3)",borderRadius:20,padding:"18px",marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
                  <div style={{ flex:1 }}>
                    <p style={{ fontWeight:800,fontSize:"0.88rem",color:"var(--fg)",marginBottom:4 }}>Vai treinar hoje?</p>
                    <p style={{ fontSize:"0.72rem",color:"var(--muted)",lineHeight:1.5 }}>Registre seu check-in para ajustar a carga do treino.</p>
                  </div>
                  <SanBtn label="Check-in" onClick={()=>navigate("/checkin")} small/>
                </div>
              </div>
            )}

            {/* -- TREINO DE HOJE � s� aparece quando hoje � dia de treino no plano semanal -- */}
            {todayPlanWorkout && (
              <div className="pf d2" style={{ marginBottom:14 }}>
                {todayPlanWorkout.status === "done" ? (
                  <div style={{ background:"var(--surface)",border:"1px solid rgba(196,98,45,0.25)",borderRadius:20,padding:"20px 18px",textAlign:"center" }}>
                    <div style={{ color:"var(--terra)",marginBottom:8 }}><I.check/></div>
                    <p style={{ fontWeight:800,fontSize:"0.95rem",color:"var(--offwhite)",marginBottom:4 }}>Treino conclu�do!</p>
                    <p style={{ fontSize:"0.75rem",color:"var(--muted)" }}>{todayPlanWorkout.title}</p>
                  </div>
                ) : (
                  <div className="tap" style={{ background:"linear-gradient(135deg,rgba(196,98,45,0.13) 0%,rgba(20,20,34,0.98) 60%)",border:"1px solid rgba(196,98,45,0.4)",borderRadius:20,padding:"20px 18px",cursor:"pointer",boxShadow:"0 6px 32px rgba(196,98,45,0.14)" }} onClick={()=>setWorkoutModal(true)}>
                    <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}>
                      <span style={{ color:"var(--terra)" }}><I.zap/></span>
                      <p style={{ fontSize:"0.6rem",fontWeight:800,letterSpacing:"0.14em",textTransform:"uppercase",color:"var(--terra)" }}>Treino de Hoje</p>
                    </div>
                    <h2 style={{ fontSize:"clamp(1.1rem,5vw,1.35rem)",fontWeight:800,letterSpacing:"-0.02em",color:"var(--offwhite)",lineHeight:1.2,marginBottom:14 }}>{todayPlanWorkout.title}</h2>
                    <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:14 }}>
                      <div style={{ display:"flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.07)",borderRadius:8,padding:"5px 10px" }}>
                        <span style={{ color:"var(--muted)" }}><I.clock/></span>
                        <span style={{ fontSize:"0.75rem",fontWeight:600,color:"var(--fg)" }}>{todayPlanWorkout.duration}</span>
                      </div>
                      <div style={{ display:"flex",alignItems:"center",gap:4,background:"rgba(196,98,45,0.12)",borderRadius:8,padding:"5px 10px",border:"1px solid rgba(196,98,45,0.2)" }}>
                        <span style={{ color:"var(--terra)" }}><I.rpe/></span>
                        <span style={{ fontSize:"0.75rem",fontWeight:700,color:"var(--terra)" }}>RPE {todayPlanWorkout.rpe} � {rpeLabel(todayPlanWorkout.rpe)}</span>
                      </div>
                    </div>
                    {todayPlanWorkout.why&&<p style={{ fontSize:"0.75rem",color:"var(--muted)",lineHeight:1.55,marginBottom:16,fontStyle:"italic" }}>"{todayPlanWorkout.why}"</p>}
                    <SanBtn label="Iniciar Treino" onClick={()=>setWorkoutModal(true)}/>
                  </div>
                )}
              </div>
            )}

            {/* -- COMPLEMENTO FOR�A SAN RUN -- */}
            {(() => {
              const s = loadSession();
              const fp = s?.forcaPlan;
              const today = new Date().getDay();
              const isForcaToday = fp?.focusDays?.includes(today);
              return (
                <div className="pf d3" style={{ background:"linear-gradient(135deg,rgba(58,95,111,0.12) 0%,rgba(20,20,34,0.98) 100%)",border:"1px solid rgba(58,95,111,0.28)",borderRadius:18,padding:"14px 16px",marginBottom:14 }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:"0.58rem",fontWeight:800,letterSpacing:"0.12em",textTransform:"uppercase",color:"var(--stone-lite)",marginBottom:4 }}>Complemento Recomendado</p>
                      {fp ? (
                        <>
                          <p style={{ fontWeight:800,fontSize:"0.88rem",color:"var(--offwhite)",marginBottom:3 }}>{fp.title}</p>
                          <p style={{ fontSize:"0.7rem",color:"var(--muted)",lineHeight:1.45 }}>
                            {isForcaToday ? `Hoje � dia de for�a � ${fp.totalDuration}` : `${fp.blocks.length} exerc�cios � ${fp.totalDuration}`}
                          </p>
                        </>
                      ) : (
                        <>
                          <p style={{ fontWeight:800,fontSize:"0.88rem",color:"var(--offwhite)",marginBottom:3 }}>FOR�A SAN RUN</p>
                          <p style={{ fontSize:"0.7rem",color:"var(--muted)",lineHeight:1.45 }}>Configure seu plano personalizado</p>
                        </>
                      )}
                    </div>
                    <button
                      onClick={()=>navigate(fp ? (isForcaToday ? "/forca/sessao" : "/forca") : "/forca")}
                      style={{ background:"rgba(58,95,111,0.25)",border:"1px solid rgba(58,95,111,0.45)",borderRadius:12,padding:"9px 14px",cursor:"pointer",flexShrink:0,display:"flex",alignItems:"center",gap:6 }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5a8fa5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="6" y1="10" x2="4" y2="10"/><line x1="18" y1="10" x2="20" y2="10"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="9" y1="20" x2="15" y2="20"/></svg>
                      <span style={{ fontSize:"0.7rem",fontWeight:800,color:"var(--stone-lite)",letterSpacing:"0.06em",textTransform:"uppercase" }}>
                        {fp ? (isForcaToday ? "Iniciar" : "Ver Plano") : "Configurar"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* -- RITUAL SAN RUN � card header + player inline -- */}
            <div className="pf d3" style={{ marginBottom:14 }}>
              {/* Header tappable */}
              <div
                className="tap"
                onClick={handleOpenPlayer}
                style={{ display:"flex",alignItems:"center",gap:12,marginBottom:playerOpen?14:0,cursor:"pointer",background:"transparent" }}
              >
                {/* Eagle circle � FAB inline */}
                <div style={{
                  width:44,height:44,borderRadius:"50%",flexShrink:0,
                  background:"linear-gradient(135deg,#C4622D,#a04e22)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  boxShadow:playing?"0 0 20px rgba(196,98,45,0.6)":"0 0 8px rgba(196,98,45,0.25)",
                  animation:playing?"albumPulse 0.8s ease-in-out infinite":"none",
                  transition:"box-shadow 0.3s",
                }}>
                  <img src="/logo-eagle-gold.png" alt="SAN RUN" style={{ height:28,width:28,objectFit:"contain",filter:"brightness(0) invert(1) opacity(0.95)" }}/>
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontWeight:800,fontSize:"0.88rem",color:"var(--offwhite)",marginBottom:2 }}>Ritual SAN RUN</p>
                  <p style={{ fontSize:"0.72rem",color:"var(--muted)",lineHeight:1.4 }}>Antes de correr, conecte mente e corpo.</p>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(196,98,45,0.15)",border:"1px solid rgba(196,98,45,0.3)",borderRadius:10,padding:"7px 13px",flexShrink:0 }}>
                  <span style={{ color:"var(--terra)" }}>{playing?<I.pause/>:<I.play/>}</span>
                  <span style={{ fontSize:"0.7rem",fontWeight:700,color:"var(--terra)" }}>{playing?"Tocando":"Ouvir"}</span>
                </div>
              </div>

              {/* Player inline � expands below when open */}
              {playerOpen && (
                <RitualPlayer
                  playing={playing} muted={muted}
                  trackIdx={trackIdx} phraseIdx={phraseIdx}
                  onTogglePlay={handleTogglePlay}
                  onToggleMute={handleToggleMute}
                  onPrev={handlePrev}
                  onNext={handleNext}
                />
              )}

              {/* Wave mini when playing but collapsed */}
              {playing && !playerOpen && (
                <div style={{ display:"flex",gap:2,alignItems:"flex-end",height:16,marginTop:10 }}>
                  {Array.from({length:28},(_,i)=>(
                    <div key={i} style={{
                      flex:1,borderRadius:2,minHeight:2,
                      background:i%4===0?"var(--terra)":"rgba(196,98,45,0.25)",
                      animation:`waveBar 0.${5+(i%5)}s ease-in-out ${i*0.04}s infinite alternate`,
                    }}/>
                  ))}
                </div>
              )}
            </div>

            {/* -- CALEND�RIO SEMANAL -- */}
            {session.weeklyPlan&&(
              <div className="pf d2 tap" style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:"18px 16px",marginBottom:14,cursor:"pointer" }} onClick={()=>navigate("/weekly")}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                  <p style={{ fontSize:"0.68rem",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)" }}>Minha Semana</p>
                  <div style={{ display:"flex",alignItems:"center",gap:4,color:"var(--stone-lite)" }}>
                    <span style={{ fontSize:"0.7rem",fontWeight:600 }}>Ver tudo</span><I.chevron/>
                  </div>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:5 }}>
                  {calDays.map((d,i)=>(
                    <div key={i} style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:5 }}>
                      <div className={`cal-day-${d.status}`} style={{ width:"100%",aspectRatio:"1",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",border:d.isToday&&d.status!=="done"?"1.5px solid var(--terra)":"1px solid transparent" }}>
                        {d.status==="done"&&<span style={{color:"#fff"}}><I.check/></span>}
                        {d.status==="locked"&&<span style={{color:"var(--muted)"}}><I.lock/></span>}
                        {d.status==="active"&&<span style={{color:"var(--terra)",fontSize:9}}>?</span>}
                      </div>
                      <span style={{ fontSize:"0.52rem",fontWeight:d.isToday?800:500,color:d.isToday?"var(--terra)":"var(--muted)" }}>{d.label}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:14 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:6 }}>
                    <span style={{ fontSize:"0.68rem",color:"var(--muted)" }}>{session.weeklyPlan.completedCount}/{session.weeklyPlan.requiredCount} treinos conclu�dos</span>
                    <span style={{ fontSize:"0.68rem",color:"var(--terra)",fontWeight:700 }}>Semana {session.weeklyPlan.weekNumber}</span>
                  </div>
                  <div style={{ height:4,borderRadius:99,background:"rgba(255,255,255,0.07)",overflow:"hidden" }}>
                    <div className="prog" style={{ width:`${session.weeklyPlan.requiredCount>0?(session.weeklyPlan.completedCount/session.weeklyPlan.requiredCount)*100:0}%` }}/>
                  </div>
                  {session.weeklyPlan.completedCount<session.weeklyPlan.requiredCount&&(
                    <p style={{ fontSize:"0.62rem",color:"var(--muted)",marginTop:6,fontStyle:"italic" }}>Pr�xima semana libera ao completar os treinos planejados.</p>
                  )}
                </div>
              </div>
            )}

            {/* -- OBJETIVO -- */}
            {athlete?.goal&&(
              <div className="pf d3" style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:"18px 16px",marginBottom:14 }}>
                <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:12 }}>
                  <span style={{ color:"#C4622D" }}><I.trophy/></span>
                  <p style={{ fontSize:"0.68rem",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)" }}>Meu Objetivo</p>
                </div>
                {goalData?.dist?(
                  <div style={{ display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:12 }}>
                    <div>
                      <span style={{ fontSize:"0.68rem",color:"var(--muted)",fontWeight:600 }}>Prova alvo</span>
                      <p style={{ fontSize:"clamp(1.8rem,9vw,2.2rem)",fontWeight:900,letterSpacing:"-0.04em",color:"var(--offwhite)",lineHeight:1,margin:"4px 0 6px" }}>{goalData.dist}</p>
                      {goalData.rawDate&&<span style={{ display:"flex",alignItems:"center",gap:4,fontSize:"0.68rem",color:"var(--muted)" }}><I.calendar/>{goalData.rawDate}</span>}
                    </div>
                    {daysLeft!==null&&(
                      <div style={{ background:"linear-gradient(135deg,rgba(196,98,45,0.15) 0%,transparent 100%)",border:"1px solid rgba(196,98,45,0.25)",borderRadius:14,padding:"12px 14px",textAlign:"center",minWidth:68 }}>
                        <p style={{ fontSize:"1.6rem",fontWeight:900,color:"var(--terra)",lineHeight:1,letterSpacing:"-0.03em" }}>{daysLeft}</p>
                        <p style={{ fontSize:"0.56rem",color:"var(--muted)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginTop:3 }}>dias</p>
                      </div>
                    )}
                  </div>
                ):(
                  <p style={{ color:"var(--fg)",fontSize:"0.88rem",lineHeight:1.55 }}>{athlete.goal}</p>
                )}
                {classification?.phase&&(
                  <div style={{ marginTop:10 }}>
                    <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:"rgba(58,95,111,0.15)",border:"1px solid rgba(58,95,111,0.25)",borderRadius:8,padding:"4px 10px" }}>
                      <span style={{ color:"var(--stone-lite)" }}><I.target/></span>
                      <span style={{ fontSize:"0.67rem",fontWeight:700,color:"var(--stone-lite)" }}>Plano: {classification.phase}</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* -- EVOLU��O -- */}
            <div className="pf d4" style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:"18px 16px",marginBottom:14 }}>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:14 }}>
                <span style={{ color:"var(--stone-lite)" }}><I.trend/></span>
                <p style={{ fontSize:"0.68rem",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)" }}>Minha Evolu��o</p>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16 }}>
                <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"12px 8px",textAlign:"center" }}>
                  <p style={{ fontSize:"clamp(1.2rem,5vw,1.5rem)",fontWeight:900,color:"var(--terra)",lineHeight:1,marginBottom:4 }}>{consistency}%</p>
                  <p style={{ fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--muted)" }}>Consist�ncia</p>
                </div>
                <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"12px 8px",textAlign:"center" }}>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:3,marginBottom:4 }}>
                    <p style={{ fontSize:"clamp(1.2rem,5vw,1.5rem)",fontWeight:900,color:"var(--stone-lite)",lineHeight:1 }}>{streak}</p>
                    <span style={{ color:"#C4622D",marginBottom:2 }}><I.fire/></span>
                  </div>
                  <p style={{ fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--muted)" }}>Sequ�ncia</p>
                </div>
                <div style={{ background:"rgba(255,255,255,0.04)",borderRadius:14,padding:"12px 8px",textAlign:"center" }}>
                  <p style={{ fontSize:"clamp(1.2rem,5vw,1.5rem)",fontWeight:900,lineHeight:1,marginBottom:4,color:volDelta>=0?"#3A5F6F":"#a04e22" }}>{volDelta>=0?"+":""}{volDelta}%</p>
                  <p style={{ fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",color:"var(--muted)" }}>Volume</p>
                </div>
              </div>
              <p style={{ fontSize:"0.6rem",color:"var(--muted)",fontWeight:600,marginBottom:8 }}>�ltimos 7 dias</p>
              <div style={{ display:"flex",gap:5,alignItems:"flex-end",height:36 }}>
                {last7.map((d,i)=>{
                  const done=histDates.has(d); const isToday=i===6;
                  return(
                    <div key={i} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                      <div style={{ width:"100%",borderRadius:4,height:done?36:isToday?16:5,background:done?"linear-gradient(180deg,#C4622D,#a04e22)":isToday?"rgba(196,98,45,0.3)":"rgba(255,255,255,0.05)",boxShadow:done?"0 0 8px rgba(196,98,45,0.3)":"none",transition:"height 0.8s ease" }}/>
                      <span style={{ fontSize:"0.46rem",color:isToday?"var(--terra)":"var(--muted)",fontWeight:isToday?700:400 }}>{["S","T","Q","Q","S","S","D"][new Date(d).getDay()]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* -- �LTIMO CHECK-IN -- */}
            {lastCheckin&&(
              <div className="pf d4" style={{ background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:"18px 16px",marginBottom:14 }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:6 }}>
                    <span style={{ color:"var(--stone-lite)" }}><I.brain/></span>
                    <p style={{ fontSize:"0.68rem",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--muted)" }}>�ltimo Check-in</p>
                  </div>
                  <span style={{ fontSize:"0.68rem",color:"var(--muted)" }}>{new Date(lastCheckin.date).toLocaleDateString("pt-BR",{day:"2-digit",month:"short"})}</span>
                </div>
                <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6 }}>
                  {([{label:"Sono",val:lastCheckin.sleep},{label:"Energia",val:lastCheckin.energy},{label:"Motiva��o",val:lastCheckin.motivation}] as {label:string;val:number}[]).map(({label,val})=>(
                    <div key={label} style={{ background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"10px 8px",textAlign:"center" }}>
                      <div style={{ height:4,borderRadius:99,background:"rgba(255,255,255,0.07)",marginBottom:8,overflow:"hidden" }}>
                        <div className="minifill" style={{ width:`${val*10}%` }}/>
                      </div>
                      <p style={{ fontSize:"0.92rem",fontWeight:800,color:"var(--fg)",lineHeight:1,marginBottom:3 }}>{val}/10</p>
                      <p style={{ fontSize:"0.56rem",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",color:"var(--muted)" }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* -- DIAGN�STICO -- */}
            <div className="pf d5 tap" style={{ background:"linear-gradient(135deg,rgba(58,95,111,0.12) 0%,var(--surface) 100%)",border:"1px solid rgba(58,95,111,0.3)",borderRadius:20,padding:"18px 16px",marginBottom:14,cursor:"pointer" }} onClick={()=>navigate("/diagnosis")}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ display:"flex",gap:12,alignItems:"center" }}>
                  <div style={{ width:44,height:44,borderRadius:12,flexShrink:0,background:"rgba(58,95,111,0.25)",border:"1px solid rgba(58,95,111,0.35)",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--stone-lite)" }}><I.diagnosis/></div>
                  <div>
                    <p style={{ color:"var(--fg)",fontWeight:700,fontSize:"0.88rem",marginBottom:2 }}>Ver diagn�stico</p>
                    <p style={{ color:"var(--muted)",fontSize:"0.7rem" }}>An�lise personalizada do seu perfil</p>
                  </div>
                </div>
                <span style={{ color:"var(--muted)" }}><I.chevron/></span>
              </div>
            </div>

            {/* -- SLOGAN -- */}
            <div className="pf d6 slogan-float" style={{ textAlign:"center",padding:"24px 0 10px" }}>
              <p style={{ fontSize:"0.7rem",fontWeight:900,letterSpacing:"0.22em",textTransform:"uppercase",color:"rgba(245,240,235,0.15)",lineHeight:1.9 }}>
                MENTE SAN<br/>CORPO RUN
              </p>
            </div>

            <button
              style={{ background:"none",border:"none",color:"var(--muted)",fontSize:"0.7rem",cursor:"pointer",padding:"4px 0 20px",textDecoration:"underline",textUnderlineOffset:3,display:"block",margin:"0 auto" }}
              onClick={()=>{ if(confirm("Resetar todos os dados e come�ar de novo?")){clearSession();navigate("/");} }}
            >Reiniciar do zero</button>

          </div>
        </div>
        <BottomNav active="home"/>
      </div>

      {/* -- MODAL TREINO -- */}
      <WorkoutStartModal
        visible={workoutModal}
        onStartNow={()=>{setWorkoutModal(false);navigate("/workout");}}
        onListen={handleListenMotivation}
        onClose={()=>setWorkoutModal(false)}
      />
    </>
  );
}
