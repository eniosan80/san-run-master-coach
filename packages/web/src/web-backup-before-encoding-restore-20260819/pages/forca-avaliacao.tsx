import { useState } from "react";
import { useLocation } from "wouter";
import { loadSession, saveSession } from "../lib/store";
import { generateForcaPlan } from "../lib/forca-engine";

/* --- icons --- */
const IcArrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const IcBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);
const IcCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

/* --- tipos --- */
type Step = 1 | 2 | 3 | 4;

interface Answers {
  daysPerWeek: number;
  discomfort: string[];
  discomfortOutra: string;
  weakAreas: string[];
  weakOutra: string;
  mobility: "travado" | "pouca" | "normal" | "boa";
}

const DISCOMFORT_OPTIONS = [
  { id: "nenhuma",      label: "Nenhuma"     },
  { id: "joelho",       label: "Joelho"      },
  { id: "quadril",      label: "Quadril"     },
  { id: "tornozelo",    label: "Tornozelo"   },
  { id: "panturrilha",  label: "Panturrilha" },
  { id: "pe",           label: "P�"          },
  { id: "lombar",       label: "Lombar"      },
  { id: "outra_disco",  label: "Outra"       },
];

const WEAK_OPTIONS = [
  { id: "nao_sei",      label: "N�o sei dizer"      },
  { id: "core",         label: "Core / Abd�men"     },
  { id: "gluteos",      label: "Gl�teos"            },
  { id: "pernas",       label: "Pernas / Quadr�ceps"},
  { id: "panturrilhas", label: "Panturrilhas"        },
  { id: "outra_weak",   label: "Outra"              },
];

const MOBILITY_OPTIONS = [
  { id: "travado", label: "Muito travado", desc: "Dif�cil agachar fundo, quadril r�gido" },
  { id: "pouca", label: "Pouca mobilidade", desc: "Consigo fazer, mas sinto limita��o" },
  { id: "normal", label: "Normal", desc: "Movimento razo�vel, sem grandes problemas" },
  { id: "boa", label: "Boa mobilidade", desc: "Me movo bem, raramente trava" },
];

/* --- componente de chip multi-select --- */
function Chip({ label, selected, onToggle }: { label: string; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "9px 14px", borderRadius: 100,
        border: selected ? "1.5px solid #C4622D" : "1.5px solid rgba(255,255,255,0.12)",
        background: selected ? "rgba(196,98,45,0.15)" : "rgba(255,255,255,0.04)",
        color: selected ? "#F5F0EB" : "#A0A0A0",
        fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
        transition: "all 0.18s",
      }}
    >
      {selected && <IcCheck />}
      {label}
    </button>
  );
}

/* --- barra de progresso --- */
function Progress({ step }: { step: Step }) {
  return (
    <div style={{ display: "flex", gap: 6, padding: "0 24px", marginBottom: 32 }}>
      {([1, 2, 3, 4] as Step[]).map(s => (
        <div key={s} style={{
          flex: 1, height: 3, borderRadius: 99,
          background: s <= step ? "#C4622D" : "rgba(255,255,255,0.1)",
          transition: "background 0.3s",
        }} />
      ))}
    </div>
  );
}

export default function ForcaAvaliacaoPage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [answers, setAnswers] = useState<Answers>({
    daysPerWeek: 2,
    discomfort: [],
    discomfortOutra: "",
    weakAreas: [],
    weakOutra: "",
    mobility: "normal",
  });

  function toggleMulti(field: "discomfort" | "weakAreas", id: string) {
    setAnswers(prev => {
      const arr = prev[field];
      // L�gica exclusiva: "nenhuma"/"nao_sei" limpa os outros
      if (id === "nenhuma" || id === "nao_sei") {
        return { ...prev, [field]: arr.includes(id) ? [] : [id] };
      }
      // Se "nenhuma"/"nao_sei" estava selecionado, remover
      const cleaned = arr.filter(x => x !== "nenhuma" && x !== "nao_sei");
      return {
        ...prev,
        [field]: cleaned.includes(id)
          ? cleaned.filter(x => x !== id)
          : [...cleaned, id],
      };
    });
  }

  function canAdvance(): boolean {
    if (step === 1) return answers.daysPerWeek >= 1;
    if (step === 2) return answers.discomfort.length > 0;
    if (step === 3) return answers.weakAreas.length > 0;
    if (step === 4) return !!answers.mobility;
    return false;
  }

  function handleNext() {
    if (step < 4) {
      setStep((s) => (s + 1) as Step);
    } else {
      handleFinish();
    }
  }

  function handleFinish() {
    const session = loadSession();
    if (!session) return;

    const profile = {
      daysPerWeek: answers.daysPerWeek,
      discomfort: answers.discomfort,
      discomfortOutra: answers.discomfortOutra,
      weakAreas: answers.weakAreas,
      weakOutra: answers.weakOutra,
      mobility: answers.mobility,
      generatedAt: new Date().toISOString(),
    };

    const trainingDays = (session.weeklyPlan?.workouts || [])
      .filter(w => w.status !== "rest")
      .map(w => w.dayIndex)
      .filter(d => d !== undefined) as number[];

    const plan = generateForcaPlan(profile, trainingDays);

    saveSession({ ...session, forcaProfile: profile, forcaPlan: plan });
    navigate("/forca");
  }

  const stepTitles: Record<Step, string> = {
    1: "Quantos dias por semana voc� consegue dedicar � for�a?",
    2: "Voc� sente desconforto em alguma dessas regi�es?",
    3: "Qual �rea voc� percebe como mais fraca?",
    4: "Como est� sua mobilidade geral?",
  };

  const stepSubs: Record<Step, string> = {
    1: "Al�m dos dias de corrida",
    2: "Selecione todas que se aplicam",
    3: "Selecione todas que se aplicam",
    4: "Sua capacidade de amplitude de movimento",
  };

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0B0B0F",
      display: "flex",
      flexDirection: "column",
      maxWidth: 430,
      margin: "0 auto",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "20px 20px 12px" }}>
        <button
          onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : navigate("/forca")}
          style={{ background: "none", border: "none", color: "#A0A0A0", cursor: "pointer", padding: 4, marginRight: 8 }}
        >
          <IcBack />
        </button>
        <div>
          <p style={{ fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#C4622D", margin: 0 }}>
            AVALIA��O FOR�A SAN RUN
          </p>
          <p style={{ fontSize: "0.75rem", color: "#A0A0A0", margin: 0 }}>
            Etapa {step} de 4
          </p>
        </div>
      </div>

      <Progress step={step} />

      {/* Content */}
      <div style={{ flex: 1, padding: "0 24px 32px", display: "flex", flexDirection: "column" }}>
        <h2 style={{
          fontFamily: "'Waffle Soft', sans-serif",
          fontSize: "1.2rem",
          color: "#F5F0EB",
          fontWeight: 800,
          lineHeight: 1.3,
          marginBottom: 6,
        }}>
          {stepTitles[step]}
        </h2>
        <p style={{ fontSize: "0.75rem", color: "#A0A0A0", marginBottom: 28 }}>
          {stepSubs[step]}
        </p>

        {/* Step 1: dias por semana */}
        {step === 1 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[1, 2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => setAnswers(prev => ({ ...prev, daysPerWeek: n }))}
                style={{
                  width: 72, height: 72, borderRadius: 16,
                  border: answers.daysPerWeek === n
                    ? "2px solid #C4622D"
                    : "1.5px solid rgba(255,255,255,0.1)",
                  background: answers.daysPerWeek === n
                    ? "rgba(196,98,45,0.15)"
                    : "rgba(255,255,255,0.04)",
                  color: answers.daysPerWeek === n ? "#F5F0EB" : "#A0A0A0",
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  transition: "all 0.18s",
                }}
              >
                <span>{n}</span>
                <span style={{ fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "inherit" }}>
                  {n === 1 ? "dia" : "dias"}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: desconfortos */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {DISCOMFORT_OPTIONS.map(opt => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={answers.discomfort.includes(opt.id)}
                  onToggle={() => toggleMulti("discomfort", opt.id)}
                />
              ))}
            </div>
            {answers.discomfort.includes("outra_disco") && (
              <input
                type="text"
                placeholder="Qual regi�o?"
                value={answers.discomfortOutra}
                onChange={e => setAnswers(prev => ({ ...prev, discomfortOutra: e.target.value }))}
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(196,98,45,0.5)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#F5F0EB",
                  fontSize: "0.85rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
        )}

        {/* Step 3: �reas fracas */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {WEAK_OPTIONS.map(opt => (
                <Chip
                  key={opt.id}
                  label={opt.label}
                  selected={answers.weakAreas.includes(opt.id)}
                  onToggle={() => toggleMulti("weakAreas", opt.id)}
                />
              ))}
            </div>
            {answers.weakAreas.includes("outra_weak") && (
              <input
                type="text"
                placeholder="Qual �rea?"
                value={answers.weakOutra}
                onChange={e => setAnswers(prev => ({ ...prev, weakOutra: e.target.value }))}
                style={{
                  marginTop: 14,
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 12,
                  border: "1.5px solid rgba(196,98,45,0.5)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#F5F0EB",
                  fontSize: "0.85rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
        )}

        {/* Step 4: mobilidade */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {MOBILITY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => setAnswers(prev => ({ ...prev, mobility: opt.id as Answers["mobility"] }))}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start",
                  padding: "14px 16px", borderRadius: 14,
                  border: answers.mobility === opt.id
                    ? "1.5px solid #C4622D"
                    : "1.5px solid rgba(255,255,255,0.1)",
                  background: answers.mobility === opt.id
                    ? "rgba(196,98,45,0.12)"
                    : "rgba(255,255,255,0.03)",
                  textAlign: "left", cursor: "pointer", width: "100%",
                  transition: "all 0.18s",
                }}
              >
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: answers.mobility === opt.id ? "#F5F0EB" : "#C8C0B8" }}>
                  {opt.label}
                </span>
                <span style={{ fontSize: "0.72rem", color: "#A0A0A0", marginTop: 3 }}>
                  {opt.desc}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* CTA */}
        <button
          onClick={handleNext}
          disabled={!canAdvance()}
          style={{
            marginTop: 32,
            width: "100%",
            padding: "16px",
            borderRadius: 14,
            border: "none",
            background: canAdvance()
              ? "linear-gradient(135deg, #C4622D, #e07a45)"
              : "rgba(255,255,255,0.06)",
            color: canAdvance() ? "#fff" : "#555",
            fontSize: "0.9rem",
            fontWeight: 800,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: canAdvance() ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            transition: "all 0.2s",
          }}
        >
          {step < 4 ? "Continuar" : "Gerar Meu Plano"}
          <IcArrow />
        </button>
      </div>
    </div>
  );
}
