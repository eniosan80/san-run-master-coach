import { useState, useRef, useEffect, useCallback } from "react";

/* --- Data -- */
export const RITUAL_PHRASES = [
  "Mente San, Corpo Run.",
  "� treino, ritmo � miss�o.",
  "Const�ncia em movimento.",
  "Resultado vem de quem vai al�m.",
  "N�o � sobre pace. � sobre entrega.",
  "N�o tem truque. Tem processo.",
  "Todo treino � um progresso.",
];

export const TRACKS = [
  { id:"alternativo",        label:"SAN RUN Alternativo",        src:"/music-alternativo.mp3"          },
  { id:"clipe2026",          label:"SAN RUN Clipe 2026",         src:"/music-clipe2026.mp3"            },
  { id:"hardcore1",          label:"SAN RUN Hardcore 1",         src:"/music-hardcore1.mp3"            },
  { id:"mente-san-run",      label:"MENTE SAN RUN 2026",         src:"/music-mente-san-run.mp3"        },
  { id:"pop-punk",           label:"SAN RUN Pop Punk",           src:"/music-pop-punk.mp3"             },
  { id:"pop-rock-baladinha", label:"SAN RUN Pop Rock Baladinha", src:"/music-pop-rock-baladinha.mp3"   },
  { id:"popmetal",           label:"SAN RUN Pop Metal",          src:"/music-pop-metal.mp3"            },
  { id:"poprock",            label:"SAN RUN Pop Rock",           src:"/music-pop-rock.mp3"             },
  { id:"punkhc1",            label:"SAN RUN Punk HC 1",          src:"/music-punk-hc1.mp3"             },
  { id:"punkhc2",            label:"SAN RUN Punk HC 2",          src:"/music-punk-hc2.mp3"             },
];

/* --- Icons -- */
export const RI = {
  play:   ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  pause:  ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  prev:   ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  next:   ()=><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="4" x2="19" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>,
  mute:   ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>,
  volume: ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>,
  music:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
};

/* --- Hook -- */
export function useRitualPlayer() {
  const [playing,   setPlaying]   = useState(false);
  const [muted,     setMuted]     = useState(false);
  const [trackIdx,  setTrackIdx]  = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);

  const audioRef    = useRef<HTMLAudioElement | null>(null);
  const phraseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build audio on track change
  useEffect(() => {
    const prev = audioRef.current;
    if (prev) { prev.pause(); prev.src = ""; }

    const audio = new Audio(TRACKS[trackIdx].src);
    audio.loop   = true;
    audio.volume = 0.8;
    audio.muted  = muted;
    audioRef.current = audio;

    if (playing) audio.play().catch(()=>{});

    return () => { audio.pause(); audio.src = ""; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackIdx]);

  // Phrase rotation
  useEffect(() => {
    if (playing) {
      phraseTimer.current = setInterval(()=>setPhraseIdx(i=>(i+1)%RITUAL_PHRASES.length), 4000);
    } else {
      if (phraseTimer.current) clearInterval(phraseTimer.current);
    }
    return () => { if (phraseTimer.current) clearInterval(phraseTimer.current); };
  }, [playing]);

  const handleTogglePlay = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().catch(()=>{}); setPlaying(true); }
  }, [playing]);

  const handleToggleMute = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    a.muted = !muted; setMuted(m=>!m);
  }, [muted]);

  const handlePrev = useCallback(() => {
    setTrackIdx(i => (i - 1 + TRACKS.length) % TRACKS.length);
  }, []);

  const handleNext = useCallback(() => {
    setTrackIdx(i => (i + 1) % TRACKS.length);
  }, []);

  const handleOpenPlayer = useCallback(() => {
    if (!playing && audioRef.current) {
      audioRef.current.play().catch(()=>{});
      setPlaying(true);
    }
  }, [playing]);

  return { playing, muted, trackIdx, phraseIdx, audioRef, handleTogglePlay, handleToggleMute, handlePrev, handleNext, handleOpenPlayer };
}

/* --- RitualPlayer UI -- */
export function RitualPlayer({
  playing, muted, trackIdx, phraseIdx,
  onTogglePlay, onToggleMute, onPrev, onNext,
}: {
  playing:boolean; muted:boolean; trackIdx:number; phraseIdx:number;
  onTogglePlay:()=>void; onToggleMute:()=>void; onPrev:()=>void; onNext:()=>void;
}) {
  const track = TRACKS[trackIdx];
  return (
    <div style={{
      background:"linear-gradient(135deg,rgba(196,98,45,0.12) 0%,rgba(11,11,15,0.97) 100%)",
      border:"1px solid rgba(196,98,45,0.4)",
      borderRadius:20,
      padding:"20px 18px",
      overflow:"hidden",
    }}>
      {/* Top row � album art + track info */}
      <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:16 }}>
        <div style={{
          width:54,height:54,borderRadius:14,flexShrink:0,
          background:"linear-gradient(135deg,#C4622D,#a04e22)",
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:playing?"0 0 24px rgba(196,98,45,0.55)":"0 0 12px rgba(196,98,45,0.25)",
          animation:playing?"albumPulse 0.8s ease-in-out infinite":"none",
          transition:"box-shadow 0.3s",
        }}>
          <img src="/logo-eagle-gold.png" alt="" style={{ height:36,width:36,objectFit:"contain",filter:"brightness(0) invert(1) opacity(0.95)" }}/>
        </div>

        <div style={{ flex:1,minWidth:0 }}>
          <p style={{ fontWeight:800,fontSize:"0.85rem",color:"var(--offwhite, #F5F0EB)",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>
            {track.label}
          </p>
          <p style={{ fontSize:"0.68rem",color:"var(--terra, #C4622D)",fontWeight:600 }}>Ritual de Ativa��o</p>
          {/* track dots */}
          <div style={{ display:"flex",gap:4,marginTop:6 }}>
            {TRACKS.map((_,i)=>(
              <div key={i} style={{
                width:i===trackIdx?16:5,height:5,borderRadius:99,
                background:i===trackIdx?"var(--terra, #C4622D)":"rgba(255,255,255,0.12)",
                transition:"width 0.3s ease",
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* Phrase rotativa */}
      <div style={{
        background:"rgba(255,255,255,0.04)",
        border:"1px solid rgba(255,255,255,0.05)",
        borderRadius:10,padding:"10px 14px",marginBottom:14,
        minHeight:36,display:"flex",alignItems:"center",
      }}>
        <p style={{ fontSize:"0.75rem",color:"var(--muted, #A0A0A0)",fontStyle:"italic",lineHeight:1.5,textAlign:"center",width:"100%" }}>
          "{RITUAL_PHRASES[phraseIdx]}"
        </p>
      </div>

      {/* Wave bars */}
      <div style={{ display:"flex",gap:2,alignItems:"flex-end",height:22,marginBottom:16 }}>
        {Array.from({length:30},(_,i)=>(
          <div key={i} style={{
            flex:1,borderRadius:2,minHeight:2,
            background:i%3===0?"var(--terra, #C4622D)":"rgba(196,98,45,0.28)",
            animation:playing?`waveBar 0.${5+(i%5)}s ease-in-out ${i*0.04}s infinite alternate`:"none",
            height:playing?undefined:3,
          }}/>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display:"flex",gap:8,alignItems:"center" }}>
        {/* Mute */}
        <button onClick={onToggleMute} style={{
          background:muted?"rgba(196,98,45,0.18)":"rgba(255,255,255,0.06)",
          border:muted?"1px solid rgba(196,98,45,0.35)":"1px solid rgba(255,255,255,0.08)",
          borderRadius:10,padding:"9px 12px",cursor:"pointer",
          display:"flex",alignItems:"center",gap:5,
          color:muted?"var(--terra, #C4622D)":"var(--muted, #A0A0A0)",transition:"all 0.2s",flexShrink:0,
        }}>
          {muted?<RI.mute/>:<RI.volume/>}
          <span style={{ fontSize:"0.68rem",fontWeight:600 }}>{muted?"Mudo":"Som"}</span>
        </button>

        {/* Prev */}
        <button onClick={onPrev} style={{
          background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:10,padding:"9px 12px",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          color:"var(--muted, #A0A0A0)",transition:"all 0.2s",flexShrink:0,
        }}>
          <RI.prev/>
        </button>

        {/* Play/Pause */}
        <button onClick={onTogglePlay} style={{
          background:"linear-gradient(135deg,#C4622D,#a04e22)",
          border:"none",borderRadius:12,padding:"9px 0",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:8,
          color:"#fff",flex:1,
          boxShadow:"0 2px 16px rgba(196,98,45,0.4)",
          animation:"eaglePulse 3s ease-in-out infinite",
        }}>
          {playing?<RI.pause/>:<RI.play/>}
          <span style={{ fontSize:"0.82rem",fontWeight:700,letterSpacing:"0.04em" }}>
            {playing?"Pausar":"Tocar"}
          </span>
        </button>

        {/* Next */}
        <button onClick={onNext} style={{
          background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:10,padding:"9px 12px",cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",
          color:"var(--muted, #A0A0A0)",transition:"all 0.2s",flexShrink:0,
        }}>
          <RI.next/>
        </button>
      </div>
    </div>
  );
}
