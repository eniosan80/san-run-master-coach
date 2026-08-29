import { useState } from "react";
import { useLocation } from "wouter";
import { api } from "../lib/api";
import { loadSession, saveSession, addCheckin } from "../lib/store";

interface CheckinForm {
  sleep: number; energy: number; pain: number; motivation: number;
}

// Premium linear icons for each metric
const MetricIcon = ({ type, active }: { type: string; active: boolean }) => {
  const color = active ? "var(--terra)" : "var(--muted)";
  if (type === "sleep") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
  if (type === "energy") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
    </svg>
  );
  if (type === "pain") return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 15s1.5 2 4 2 4-2 4-2"/><circle cx="9" cy="10" r="1"/><circle cx="15" cy="10" r="1"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
    </svg>
  );
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 20.9l8.84-8.61a5.5 5.5 0 0 0 0-7.68z"/>
    </svg>
  );
};

const sliderConfig = [
  { key: "sleep" as const,      label: "Sono",       sub: "Como você dormiu?",                min: 1, max: 5,  low: "Péssimo",    high: "Ótimo"      },
  { key: "energy" as const,     label: "Energia",    sub: "Nível de energia agora",            min: 1, max: 5,  low: "Sem energia", high: "No máximo" },
  { key: "pain" as const,       label: "Dor",        sub: "Dor muscular ou articular",         min: 0, max: 10, low: "Sem dor",     high: "Intensa"   },
  { key: "motivation" as const, label: "Motivação",  sub: "Vontade de treinar hoje",           min: 1, max: 5,  low: "Sem vontade", high: "Total"     },
];

const readinessMap = {
  high: {
    label: "Alta Prontidão",
    sub: "Você pode evoluir hoje. Vá com tudo!",
    color: "var(--terra)",
    tagClass: "tag-terra",
  },
  medium: {
    label: "Prontidão Moderada",
    sub: "Mantenha a carga ou ajuste levemente.",
    color: "var(--stone-lite)",
    tagClass: "tag-stone",
  },
  low: {
    label: "Baixa Prontidão",
    sub: "Reduza a carga. Recuperação é treino.",
    color: "var(--muted)",
    tagClass: "tag-muted",
  },
};

function ScaleButtons({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div style={{ display: "flex", gap: 5 }}>
      {options.map(opt => (
        <button
          key={opt}
          className={`scale-btn${value === opt ? " active" : ""}`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default function CheckinPage() {
  const [, navigate] = useLocation();
  const session = loadSession();
  const [form, setForm] = useState<CheckinForm>({ sleep: 3, energy: 3, pain: 0, motivation: 3 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ readiness: string; workout: any } | null>(null);

  if (!session) { navigate("/"); return null; }

  const update = (key: keyof CheckinForm, value: number) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await api.checkin.$post({
        json: {
          athleteId: session.athlete.id,
          sleep: form.sleep, energy: form.energy,
          pain: form.pain, motivation: form.motivation,
        },
      });
      const data = await res.json();
      const readiness = data.checkin.readiness;
      addCheckin({
        sleep: form.sleep, energy: form.energy, pain: form.pain, motivation: form.motivation,
        readiness, date: new Date().toISOString(),
      });
      if (data.workout) {
        saveSession({ ...loadSession()!, workout: data.workout });
      }
      setResult({ readiness, workout: data.workout });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const rd = result
    ? readinessMap[result.readiness as keyof typeof readinessMap] ?? readinessMap.medium
    : null;

  return (
    <div className="shell">
      <div className="screen">

        {/* Header */}
        <div style={{ padding: "52px 24px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: "4px 0", display: "flex", alignItems: "center", gap: 4 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
          </div>
          <div className="anim-up">
            <span className="tag tag-stone" style={{ marginBottom: 14, display: "inline-flex" }}>Antes do Treino</span>
            <h1 className="t-h1" style={{ marginBottom: 8 }}>Check-in Diário</h1>
            <p className="t-body">Como você está chegando para o treino hoje?</p>
          </div>
        </div>

        <div style={{ padding: "0 20px" }}>
          {!result ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {sliderConfig.map((config, i) => (
                <div key={config.key} className={`card anim-up d${i+1}`}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                        background: "var(--surface2)", border: "1px solid var(--border2)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <MetricIcon type={config.key} active={true} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--offwhite)" }}>{config.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{config.sub}</div>
                      </div>
                    </div>
                    <span style={{ color: "var(--terra)", fontWeight: 800, fontSize: "1.4rem", minWidth: 30, textAlign: "right" }}>
                      {form[config.key]}
                    </span>
                  </div>
                  <ScaleButtons
                    value={form[config.key]}
                    min={config.min}
                    max={config.max}
                    onChange={v => update(config.key, v)}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    <span className="t-caption">{config.low}</span>
                    <span className="t-caption">{config.high}</span>
                  </div>
                </div>
              ))}
              <div style={{ height: 20 }} />
            </div>
          ) : (
            <div className="anim-up" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Readiness result */}
              <div className="card-glow-terra" style={{ textAlign: "center", padding: "28px 20px" }}>
                <div style={{ marginBottom: 14 }}>
                  {rd!.label === "Alta Prontidão" ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--terra)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                  ) : rd!.label === "Prontidão Moderada" ? (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--stone-lite)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </div>
                <p className="t-caption" style={{ marginBottom: 6 }}>Resultado do check-in</p>
                <h2 className="t-h2" style={{ color: rd!.color, marginBottom: 8 }}>{rd!.label}</h2>
                <p className="t-body">{rd!.sub}</p>
              </div>

              {/* Summary */}
              <div className="card">
                <p className="t-caption" style={{ marginBottom: 12 }}>Resumo</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {sliderConfig.map(c => (
                    <div key={c.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <MetricIcon type={c.key} active={false} />
                      <div>
                        <p className="t-caption">{c.label}</p>
                        <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--offwhite)" }}>{form[c.key]}</span>
                        <span className="t-small" style={{ marginLeft: 2 }}>/{c.max}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result.workout && (
                <div className="card-stone">
                  <p className="t-caption" style={{ color: "var(--stone-lite)", marginBottom: 10 }}>Treino ajustado para hoje</p>
                  <p style={{ fontWeight: 700, color: "var(--offwhite)", fontSize: "0.95rem", marginBottom: 10 }}>
                    {result.workout.title}
                  </p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    <span className="tag tag-muted">{result.workout.duration}</span>
                    <span className="tag tag-terra">RPE {result.workout.rpe}</span>
                  </div>
                </div>
              )}
              <div style={{ height: 20 }} />
            </div>
          )}
        </div>
      </div>

      <div className="bottom-bar">
        {!result ? (
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Calculando prontidão..."
              : <>Calcular prontidão <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
            }
          </button>
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => navigate("/workout")}>
              Ver treino completo
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="btn btn-ghost" onClick={() => navigate("/dashboard")}>
              Voltar ao painel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
