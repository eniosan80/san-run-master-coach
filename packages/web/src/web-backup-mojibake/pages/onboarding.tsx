import { useState } from "react";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { saveSession } from "../lib/store";

const TOTAL = 4;

interface Form {
  name: string; age: string; sex: string;
  experience: string; weeklyFrequency: string;
  trainingDays: number[];
  goal: string;
  goalOtherText: string;
  // Campos de prova (quando "Quero correr uma prova")
  raceMode: boolean;
  raceDistance: string;
  raceCustomDistance: string;
  raceDate: string;
}

const expOpts = [
  { v: "never",        label: "Nunca corri",           desc: "Meu primeiro contato com a corrida" },
  { v: "beginner",     label: "Estou começando agora", desc: "Menos de 3 meses" },
  { v: "intermediate", label: "Corro há algum tempo",  desc: "3 meses a 2 anos" },
  { v: "advanced",     label: "Corredor experiente",   desc: "Mais de 2 anos consistentes" },
];

const freqOpts = [
  { v: "0",   label: "Nenhum por semana",    sub: "Reiniciando do zero" },
  { v: "1-2", label: "1 a 2 por semana",     sub: "Ritmo inicial" },
  { v: "3-4", label: "3 a 4 por semana",     sub: "Consistente" },
  { v: "5+",  label: "5 ou mais por semana", sub: "Alta frequência" },
];

// Sugestões sem "meia maratona" isolado — "prova" agora abre campos específicos
const goalSuggestions = [
  "Quero correr 2 km sem parar",
  "Quero completar 5 km",
  "Quero melhorar meu tempo no 5 km",
  "Quero emagrecer correndo",
  "Quero treinar com mais consistência",
  "Quero correr uma prova",
  "Outro",
];

const RACE_DISTANCES = ["5 km", "10 km", "21 km", "Outra distância"];

function ExpIcon({ v }: { v: string }) {
  if (v === "never") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/><path d="M12 8v4l3 3"/>
    </svg>
  );
  if (v === "beginner") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
    </svg>
  );
  if (v === "intermediate") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
}

/* ─── Botão padrão SAN RUN ──────────────────────────── */
const SanBtn = ({ label, onClick, disabled, loading, loadingLabel }: {
  label: string; onClick?: () => void; disabled?: boolean; loading?: boolean; loadingLabel?: string;
}) => (
  <button
    className="btn"
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      background: (disabled || loading)
        ? "rgba(196,98,45,0.3)"
        : "linear-gradient(135deg, #D4722D 0%, #C4622D 50%, #A85228 100%)",
      color: "var(--offwhite)",
      boxShadow: (disabled || loading) ? "none" : "0 6px 28px rgba(196,98,45,0.38), 0 2px 8px rgba(196,98,45,0.22), inset 0 1px 0 rgba(255,255,255,0.1)",
      border: "none", borderRadius: 18, minHeight: 58,
      fontSize: "1rem", fontWeight: 800, letterSpacing: "0.01em",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 20px", position: "relative", overflow: "hidden", width: "100%",
      cursor: (disabled || loading) ? "not-allowed" : "pointer",
    }}
  >
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.07) 50%, transparent 65%)",
      pointerEvents: "none",
    }} />
    <span style={{ position: "relative" }}>{loading ? (loadingLabel ?? "Aguarde...") : label}</span>
    {!loading && (
      <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative", animation: "eagleBtnPulse 3s ease-in-out infinite" }}>
        <img src="/logo-eagle.png" alt="" style={{ height: 24, width: 24, objectFit: "contain", filter: "brightness(0) invert(1) opacity(0.9)" }} />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </div>
    )}
  </button>
);

export default function OnboardingPage() {
  const [, nav] = useLocation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [form, setForm] = useState<Form>({
    name: "", age: "", sex: "", experience: "", weeklyFrequency: "",
    trainingDays: [], goal: "", goalOtherText: "",
    raceMode: false, raceDistance: "", raceCustomDistance: "", raceDate: "",
  });

  const set = (k: keyof Form, v: string | boolean) => { setForm(f => ({ ...f, [k]: v })); setErr(""); };
  const toggleDay = (d: number) => {
    setErr("");
    setForm(f => ({
      ...f,
      trainingDays: f.trainingDays.includes(d)
        ? f.trainingDays.filter(x => x !== d)
        : [...f.trainingDays, d],
    }));
  };

  // Selecionar sugestão de objetivo
  const selectGoal = (g: string) => {
    if (g === "Quero correr uma prova") {
      set("goal", g);
      set("raceMode", true);
      set("goalOtherText", "");
    } else {
      set("goal", g);
      set("raceMode", false);
      set("raceDistance", "");
      set("raceDate", "");
      if (g !== "Outro") set("goalOtherText", "");
    }
  };

  // Montar goal string final incluindo detalhes da prova ou texto livre
  const buildGoalString = () => {
    if (form.goal === "Outro") return form.goalOtherText.trim();
    if (form.raceMode) {
      const dist = form.raceDistance === "Outra distância" ? form.raceCustomDistance : form.raceDistance;
      const date = form.raceDate ? ` — data: ${form.raceDate}` : "";
      return `Quero correr uma prova${dist ? ` de ${dist}` : ""}${date}`;
    }
    return form.goal;
  };

  const canNext = () => {
    if (step === 1) return form.name.trim().length >= 2 && +form.age >= 10 && !!form.sex;
    if (step === 2) return !!form.experience && !!form.weeklyFrequency && form.trainingDays.length >= 1;
    if (step === 3) return !!form.goal && (form.goal !== "Outro" || form.goalOtherText.trim().length >= 3);
    return true;
  };

  const next = () => {
    if (!canNext()) { setErr("Preencha todos os campos para continuar."); return; }
    if (step < TOTAL) { setStep(s => s + 1); return; }
    submit();
  };

  const submit = async () => {
    setLoading(true); setErr("");
    const finalGoal = buildGoalString();
    try {
      const res = await api.athlete.$post({
        json: {
          name: form.name, age: +form.age, sex: form.sex,
          experience: form.experience, weeklyFrequency: form.weeklyFrequency,
          trainingDays: form.trainingDays, goal: finalGoal,
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      saveSession({
        athlete: {
          ...data.athlete, age: +form.age, sex: form.sex,
          experience: form.experience, weeklyFrequency: form.weeklyFrequency,
          trainingDays: form.trainingDays, goal: finalGoal,
        },
        classification: data.classification,
        diagnosis: data.diagnosis,
        workout: data.workout,
        checkins: [],
        workoutHistory: [],
        streak: 0,
        totalWorkouts: 0,
      });
      nav("/classification");
    } catch {
      setErr("Erro ao conectar. Verifique sua conexão e tente novamente.");
      setLoading(false);
    }
  };

  const progressPct = ((step - 1) / TOTAL) * 100;

  const btnLabel = loading
    ? "Gerando sua avaliação..."
    : step === TOTAL
      ? "Gerar avaliação SAN RUN"
      : step === 3
        ? "Continuar"
        : "Continuar";

  return (
    <div className="shell">
      <div className="screen">
        {/* Top bar */}
        <div style={{ padding: "52px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            {step > 1 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center", gap: 4, padding: "4px 0" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
                <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Voltar</span>
              </button>
            ) : <div style={{ width: 60 }} />}
            <span className="t-caption">{step} / {TOTAL}</span>
            <div style={{ width: 60 }} />
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(step / TOTAL) * 100}%` }} />
          </div>
        </div>

        {/* Step content */}
        <div style={{ padding: "28px 24px 20px" }}>

          {/* STEP 1 — Identidade */}
          {step === 1 && (
            <div className="anim-up">
              <span className="tag tag-stone" style={{ marginBottom: 16, display: "inline-flex" }}>Passo 1 de 4</span>
              <h1 className="t-h1" style={{ marginBottom: 8 }}>Vamos começar<br />pela apresentação</h1>
              <p className="t-body" style={{ marginBottom: 28 }}>
                Para montar seu perfil de corredor, preciso de algumas informações básicas.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label className="t-caption" style={{ display: "block", marginBottom: 8 }}>Seu nome</label>
                  <input className="input" placeholder="Como posso te chamar?" value={form.name}
                    onChange={e => set("name", e.target.value)} autoComplete="given-name" />
                </div>
                <div>
                  <label className="t-caption" style={{ display: "block", marginBottom: 8 }}>Idade</label>
                  <input className="input" type="number" placeholder="Ex: 28" value={form.age}
                    onChange={e => set("age", e.target.value)} inputMode="numeric" />
                </div>
                <div>
                  <label className="t-caption" style={{ display: "block", marginBottom: 8 }}>Sexo</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[{ v: "M", label: "Masculino" }, { v: "F", label: "Feminino" }, { v: "O", label: "Outro" }].map(opt => (
                      <button key={opt.v}
                        className={`option-tile${form.sex === opt.v ? " selected" : ""}`}
                        style={{ flex: 1, textAlign: "center", padding: "14px 8px", fontSize: "0.875rem", fontWeight: 600 }}
                        onClick={() => set("sex", opt.v)}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Momento */}
          {step === 2 && (
            <div className="anim-up">
              <span className="tag tag-stone" style={{ marginBottom: 16, display: "inline-flex" }}>Passo 2 de 4</span>
              <h1 className="t-h1" style={{ marginBottom: 8 }}>Vamos entender seu<br />momento de corrida</h1>
              <p className="t-body" style={{ marginBottom: 24 }}>Sem julgamento — cada corredor começa de um ponto diferente.</p>

              <label className="t-caption" style={{ display: "block", marginBottom: 10 }}>Sua experiência com corrida</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
                {expOpts.map(opt => (
                  <button key={opt.v} className={`option-tile${form.experience === opt.v ? " selected" : ""}`}
                    onClick={() => set("experience", opt.v)}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: form.experience === opt.v ? "rgba(196,98,45,0.15)" : "var(--surface2)",
                        color: form.experience === opt.v ? "var(--terra)" : "var(--muted)",
                        border: `1px solid ${form.experience === opt.v ? "rgba(196,98,45,0.3)" : "var(--border2)"}`,
                        transition: "all 0.18s",
                      }}>
                        <ExpIcon v={opt.v} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--offwhite)" }}>{opt.label}</div>
                        <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 1 }}>{opt.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <label className="t-caption" style={{ display: "block", marginBottom: 10 }}>Quantas vezes treina por semana hoje?</label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                {freqOpts.map(opt => (
                  <button key={opt.v}
                    className={`option-tile${form.weeklyFrequency === opt.v ? " selected" : ""}`}
                    onClick={() => set("weeklyFrequency", opt.v)}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px" }}>
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--offwhite)" }}>{opt.label}</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{opt.sub}</span>
                  </button>
                ))}
              </div>

              <label className="t-caption" style={{ display: "block", marginBottom: 10 }}>
                Quais dias da semana você pretende treinar?
              </label>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 14, lineHeight: 1.5 }}>
                Seus treinos serão organizados nesses dias.
              </p>
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                {[{ d: 1, label: "Seg" },{ d: 2, label: "Ter" },{ d: 3, label: "Qua" },{ d: 4, label: "Qui" },{ d: 5, label: "Sex" },{ d: 6, label: "Sáb" },{ d: 0, label: "Dom" }].map(({ d, label }) => {
                  const selected = form.trainingDays.includes(d);
                  return (
                    <button key={d} type="button" onClick={() => toggleDay(d)} style={{
                      flex: 1, padding: "12px 0", borderRadius: 12,
                      border: `1.5px solid ${selected ? "var(--terra)" : "var(--border2)"}`,
                      background: selected ? "rgba(196,98,45,0.15)" : "var(--surface2)",
                      color: selected ? "var(--terra-lite)" : "var(--muted)",
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: selected ? 700 : 500, fontSize: "0.78rem",
                      cursor: "pointer", transition: "all 0.18s",
                      WebkitTapHighlightColor: "transparent",
                    } as React.CSSProperties}>
                      {label}
                    </button>
                  );
                })}
              </div>
              
            </div>
          )}

          {/* STEP 3 — Objetivo */}
          {step === 3 && (
            <div className="anim-up">
              <span className="tag tag-stone" style={{ marginBottom: 16, display: "inline-flex" }}>Passo 3 de 4</span>
              <h1 className="t-h1" style={{ marginBottom: 8 }}>Qual é o seu<br />objetivo com a corrida?</h1>
              <p className="t-body" style={{ marginBottom: 24 }}>Escolha o que mais representa o que você quer alcançar.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {goalSuggestions.map(g => (
                  <button key={g}
                    className={`option-tile${form.goal === g ? " selected" : ""}`}
                    onClick={() => selectGoal(g)}
                    style={{ textAlign: "left", padding: "14px 16px" }}>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--offwhite)" }}>{g}</span>
                  </button>
                ))}
              </div>

              {/* Campo livre para "Outro" */}
              {form.goal === "Outro" && (
                <div style={{ marginTop: 16 }}>
                  <label className="t-caption" style={{ display: "block", marginBottom: 8 }}>
                    Descreva seu objetivo
                  </label>
                  <textarea
                    className="input"
                    placeholder="Ex: Quero correr para aliviar o estresse do trabalho..."
                    value={form.goalOtherText}
                    onChange={e => set("goalOtherText", e.target.value)}
                    rows={3}
                    style={{ resize: "none", lineHeight: 1.6 }}
                  />
                </div>
              )}

              {/* Campos extras para "prova" */}
              {form.raceMode && (
                <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                  <label className="t-caption" style={{ display: "block", marginBottom: 4 }}>Distância da prova</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {RACE_DISTANCES.map(d => (
                      <button key={d}
                        className={`option-tile${form.raceDistance === d ? " selected" : ""}`}
                        onClick={() => set("raceDistance", d)}
                        style={{ padding: "10px 16px", fontSize: "0.85rem" }}>
                        {d}
                      </button>
                    ))}
                  </div>
                  {form.raceDistance === "Outra distância" && (
                    <input className="input" placeholder="Ex: 15 km" value={form.raceCustomDistance}
                      onChange={e => set("raceCustomDistance", e.target.value)} />
                  )}
                  <label className="t-caption" style={{ display: "block", marginBottom: 4 }}>Data da prova (opcional)</label>
                  <input className="input" type="date" value={form.raceDate}
                    onChange={e => set("raceDate", e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* STEP 4 — Revisão */}
          {step === 4 && (
            <div className="anim-up">
              <span className="tag tag-terra" style={{ marginBottom: 16, display: "inline-flex" }}>Tudo certo!</span>
              <h1 className="t-h1" style={{ marginBottom: 8 }}>Revisão do<br />seu perfil</h1>
              <p className="t-body" style={{ marginBottom: 24 }}>Confirme as informações antes de gerar sua avaliação.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Nome", value: form.name },
                  { label: "Idade", value: `${form.age} anos` },
                  { label: "Experiência", value: expOpts.find(o => o.v === form.experience)?.label || form.experience },
                  { label: "Frequência atual", value: freqOpts.find(o => o.v === form.weeklyFrequency)?.label || form.weeklyFrequency },
                  {
                    label: "Dias de treino",
                    value: (() => {
                      const names = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
                      return [1,2,3,4,5,6,0].filter(d => form.trainingDays.includes(d)).map(d => names[d]).join(", ") || "Nenhum";
                    })()
                  },
                  { label: "Objetivo", value: buildGoalString() || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="card" style={{ padding: "14px 16px" }}>
                    <p className="t-caption" style={{ marginBottom: 4 }}>{label}</p>
                    <p style={{ color: "var(--offwhite)", fontWeight: 600, fontSize: "0.9rem" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {err && (
            <div style={{
              marginTop: 14, background: "rgba(196,98,45,0.1)", border: "1px solid rgba(196,98,45,0.2)",
              borderRadius: 12, padding: "12px 14px"
            }}>
              <p style={{ color: "var(--terra-lite)", fontSize: "0.84rem" }}>{err}</p>
            </div>
          )}
          <div style={{ height: 16 }} />
        </div>
      </div>

      <div className="bottom-bar">
        <SanBtn
          label={btnLabel}
          onClick={next}
          disabled={!canNext()}
          loading={loading}
          loadingLabel="Gerando sua avaliação..."
        />
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
