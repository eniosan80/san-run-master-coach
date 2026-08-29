/**
 * TREINO GUIADO SAN RUN � Monte seu Treino
 * Visual identity v3 � SVG linear icons, SAN RUN palette, no emojis
 */

import { useState } from "react";
import { useLocation } from "wouter";
import {
  BuilderBlock,
  BuilderSession,
  calcTotalDurationMin,
  formatDurationMin,
  loadSession,
  saveSession,
} from "../lib/store";

// --- palette -----------------------------------------------------------------
const C = {
  bg:        "#0B0B0F",
  card:      "#141420",
  surface2:  "#1C1C28",
  terracota: "#C4622D",
  bluestone: "#3A5F6F",
  slate:     "#5A5A8A",
  offwhite:  "#F5F0EB",
  muted:     "#A0A0A0",
  input:     "#1a1a22",
  border:    "#2A2A38",
} as const;

// --- helpers ------------------------------------------------------------------

function uid() { return Math.random().toString(36).slice(2, 10); }

function fmt(min: number) {
  if (!min || min <= 0) return "0:00";
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return s > 0 ? `${m}:${String(s).padStart(2, "0")}` : `${m}:00`;
}

type BlockType = BuilderBlock["type"];

function blockLabel(type: BlockType): string {
  switch (type) {
    case "warmup":   return "Aquecimento";
    case "series":   return "S�rie / Bloco";
    case "recovery": return "Recupera��o";
    case "cooldown": return "Desaquecimento";
  }
}

function typeColor(t: BlockType): string {
  switch (t) {
    case "warmup":   return C.bluestone;
    case "series":   return C.terracota;
    case "recovery": return "#4A6A7A";   // bluestone muted
    case "cooldown": return C.slate;
  }
}

// --- SVG icons lineares -------------------------------------------------------

function IconWarmup({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 3C12 3 8 7 8 11C8 13.2 9.8 15 12 15C14.2 15 16 13.2 16 11C16 7 12 3 12 3Z"
        stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8 15C8 15 6 16.5 6 18.5C6 20.4 7.8 22 10 22" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 15C16 15 18 16.5 18 18.5C18 20.4 16.2 22 14 22" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 15V22" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconSeries({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <polygon points="13,2 22,12 13,22 13,2" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <polygon points="4,2 13,12 4,22 4,2" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function IconRecovery({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 4C7.6 4 4 7.6 4 12C4 16.4 7.6 20 12 20C16.4 20 20 16.4 20 12"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 4L20 7L17 10" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 7H14" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconCooldown({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <line x1="12" y1="2" x2="12" y2="5" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <line x1="12" y1="19" x2="12" y2="22" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <line x1="2" y1="12" x2="5" y2="12" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <line x1="19" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.7" />
    </svg>
  );
}

function TypeIcon({ type, size = 20 }: { type: BlockType; size?: number }) {
  const color = typeColor(type);
  switch (type) {
    case "warmup":   return <IconWarmup size={size} color={color} />;
    case "series":   return <IconSeries size={size} color={color} />;
    case "recovery": return <IconRecovery size={size} color={color} />;
    case "cooldown": return <IconCooldown size={size} color={color} />;
  }
}

function IconChevUp({ color = C.muted }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 9L7 5L11 9" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevDown({ color = C.muted }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 5L7 9L11 5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEdit({ color = C.bluestone }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9.5 2.5L11.5 4.5L5 11H3V9L9.5 2.5Z"
        stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTrash({ color = C.terracota }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 4H12" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 4V2.5C5 2.2 5.2 2 5.5 2H8.5C8.8 2 9 2.2 9 2.5V4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 4L4.5 11.5C4.5 11.8 4.7 12 5 12H9C9.3 12 9.5 11.8 9.5 11.5L10 4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBack({ color = C.terracota }: { color?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M14 5L8 11L14 17" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlay({ color = "#fff", size = 18 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <polygon points="5,2 17,10 5,18" fill={color} />
    </svg>
  );
}

function IconRepeat({ color = C.muted }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 4C1 2.3 2.3 1 4 1H10" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M10 1L13 4L10 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 10C13 11.7 11.7 13 10 13H4" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4 13L1 10L4 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- tipos do editor ----------------------------------------------------------

interface EditorState {
  type: BlockType;
  label: string;
  durationMin: number;
  rpe: number;
  notes: string;
  reps: number;
  workDurationMin: number;
  restDurationMin: number;
  workRpe: number;
  restRpe: number;
}

function defaultEditor(type: BlockType): EditorState {
  const labels: Record<BlockType, string> = {
    warmup: "Aquecimento",
    series: "Corrida",
    recovery: "Recupera��o",
    cooldown: "Desaquecimento",
  };
  return {
    type,
    label: labels[type],
    durationMin: type === "series" ? 0 : 10,
    rpe: 5,
    notes: "",
    reps: 6,
    workDurationMin: 2,
    restDurationMin: 1,
    workRpe: 7,
    restRpe: 3,
  };
}

function editorToBlock(e: EditorState, id?: string): BuilderBlock {
  return {
    id: id ?? uid(),
    type: e.type,
    label: e.label || blockLabel(e.type),
    durationMin: e.durationMin,
    rpe: e.rpe,
    notes: e.notes,
    reps: e.type === "series" ? e.reps : undefined,
    workDurationMin: e.type === "series" ? e.workDurationMin : undefined,
    restDurationMin: e.type === "series" ? e.restDurationMin : undefined,
    workRpe: e.type === "series" ? e.workRpe : undefined,
    restRpe: e.type === "series" ? e.restRpe : undefined,
  };
}

// --- sub-componentes ----------------------------------------------------------

function NumberStepper({
  label, value, onChange, min = 0, max = 999, step = 1,
}: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; step?: number;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.2 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
          style={{
            width: 42, height: 42, borderRadius: 21,
            background: C.input, border: `1px solid ${C.border}`,
            color: C.offwhite, fontSize: 22, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >-</button>
        <div style={{ flex: 1, textAlign: "center", fontSize: 24, fontWeight: 800, color: C.offwhite }}>
          {value}
        </div>
        <button
          onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
          style={{
            width: 42, height: 42, borderRadius: 21,
            background: C.input, border: `1px solid ${C.border}`,
            color: C.offwhite, fontSize: 22, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >+</button>
      </div>
    </div>
  );
}

function RpeRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: C.muted, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.2 }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
          <button key={n} onClick={() => onChange(n)} style={{
            width: 32, height: 32, borderRadius: 8,
            background: value === n ? C.terracota : C.input,
            border: value === n ? `2px solid ${C.terracota}` : `1px solid ${C.border}`,
            color: C.offwhite, fontSize: 13, fontWeight: value === n ? 800 : 400,
            cursor: "pointer",
          }}>{n}</button>
        ))}
      </div>
    </div>
  );
}

// --- editor bottom sheet ------------------------------------------------------

function BlockEditor({
  initial, onSave, onCancel,
}: {
  initial: EditorState;
  onSave: (e: EditorState) => void;
  onCancel: () => void;
}) {
  const [e, setE] = useState<EditorState>(initial);
  const set = (patch: Partial<EditorState>) => setE(prev => ({ ...prev, ...patch }));
  const types: BlockType[] = ["warmup", "series", "recovery", "cooldown"];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.78)",
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}
      onClick={ev => { if ((ev.target as HTMLElement).dataset.backdrop) onCancel(); }}
      data-backdrop="1"
    >
      <div style={{
        background: C.card, borderRadius: "22px 22px 0 0",
        padding: "8px 20px 40px",
        maxHeight: "92vh", overflowY: "auto",
      }}>
        {/* drag handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border, margin: "10px auto 20px" }} />

        {/* tipo � 2 col grid */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ color: C.muted, fontSize: 11, marginBottom: 10, textTransform: "uppercase", letterSpacing: 1.2 }}>
            Tipo de etapa
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {types.map(t => {
              const active = e.type === t;
              const col = typeColor(t);
              return (
                <button
                  key={t}
                  onClick={() => set({ type: t, label: blockLabel(t) })}
                  style={{
                    padding: "12px 10px",
                    borderRadius: 14,
                    background: active ? col + "22" : C.input,
                    border: active ? `2px solid ${col}` : `1px solid ${C.border}`,
                    color: active ? C.offwhite : C.muted,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 10,
                    fontWeight: active ? 700 : 400,
                    fontSize: 14,
                  }}
                >
                  <TypeIcon type={t} size={18} />
                  {blockLabel(t)}
                </button>
              );
            })}
          </div>
        </div>

        {/* nome */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ color: C.muted, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.2 }}>
            Nome da etapa
          </div>
          <input
            value={e.label}
            onChange={ev => set({ label: ev.target.value })}
            placeholder="Ex: Corrida cont�nua"
            style={{
              width: "100%", background: C.input, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "11px 14px", color: C.offwhite, fontSize: 15,
              boxSizing: "border-box", outline: "none",
            }}
          />
        </div>

        {/* campos por tipo */}
        {e.type === "series" ? (
          <>
            <NumberStepper label="Repeti��es" value={e.reps} onChange={v => set({ reps: v })} min={1} max={50} />
            <NumberStepper
              label="Tempo de trabalho (min)"
              value={e.workDurationMin}
              onChange={v => set({ workDurationMin: v })}
              min={0.5} max={60} step={0.5}
            />
            <NumberStepper
              label="Recupera��o entre s�ries (min)"
              value={e.restDurationMin}
              onChange={v => set({ restDurationMin: v })}
              min={0} max={30} step={0.5}
            />
            {/* linha divis�ria */}
            <div style={{ height: 1, background: C.surface2, margin: "4px 0 16px" }} />
            <RpeRow label="RPE � Esfor�o" value={e.workRpe} onChange={v => set({ workRpe: v })} />
          </>
        ) : (
          <>
            <NumberStepper label="Dura��o (min)" value={e.durationMin} onChange={v => set({ durationMin: v })} min={1} max={120} />
            <RpeRow label="Intensidade (RPE)" value={e.rpe} onChange={v => set({ rpe: v })} />
          </>
        )}

        {/* obs */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: C.muted, fontSize: 11, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1.2 }}>
            Observa��o (opcional)
          </div>
          <textarea
            value={e.notes}
            onChange={ev => set({ notes: ev.target.value })}
            rows={2}
            placeholder="Ritmo, percep��o, foco..."
            style={{
              width: "100%", background: C.input, border: `1px solid ${C.border}`,
              borderRadius: 12, padding: "11px 14px", color: C.offwhite, fontSize: 14,
              resize: "none", boxSizing: "border-box", outline: "none",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "15px 0", borderRadius: 14, background: C.input,
            border: `1px solid ${C.border}`, color: C.muted, fontSize: 15, cursor: "pointer",
          }}>Cancelar</button>
          <button onClick={() => onSave(e)} style={{
            flex: 2, padding: "15px 0", borderRadius: 14,
            background: `linear-gradient(135deg, ${C.terracota}, #e0773a)`,
            border: "none", color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
          }}>Salvar etapa</button>
        </div>
      </div>
    </div>
  );
}

// --- card de bloco ------------------------------------------------------------

function BlockCard({
  block, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  block: BuilderBlock;
  onEdit: () => void; onDelete: () => void;
  onMoveUp: () => void; onMoveDown: () => void;
  isFirst: boolean; isLast: boolean;
}) {
  const col = typeColor(block.type);
  const isSeries = block.type === "series";

  return (
    <div style={{
      background: C.card,
      borderRadius: 14,
      marginBottom: 10,
      border: isSeries ? `2px solid ${col}44` : `1px solid ${C.surface2}`,
      overflow: "hidden",
    }}>
      {/* stripe topo para series */}
      {isSeries && (
        <div style={{ height: 3, background: `linear-gradient(90deg, ${col}, ${col}88)` }} />
      )}

      <div style={{
        padding: isSeries ? "14px 14px 14px 14px" : "12px 14px",
        display: "flex", alignItems: "center", gap: 12,
      }}>
        {/* �cone */}
        <div style={{
          width: 42, height: 42, borderRadius: 12,
          background: col + "1A",
          border: `1px solid ${col}33`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <TypeIcon type={block.type} size={isSeries ? 22 : 18} />
        </div>

        {/* info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 11, color: col, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 2,
          }}>
            {blockLabel(block.type)}
          </div>
          <div style={{
            color: C.offwhite, fontSize: isSeries ? 16 : 15,
            fontWeight: isSeries ? 800 : 700,
            marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {block.label}
          </div>
          <div style={{ color: C.muted, fontSize: 13 }}>
            {isSeries
              ? <>
                  <span style={{ fontWeight: 700, color: col }}>{block.reps}�</span>
                  {" "}{fmt(block.workDurationMin ?? 2)}
                  {(block.restDurationMin ?? 0) > 0 && ` � rec ${fmt(block.restDurationMin!)}`}
                  {block.workRpe ? ` � RPE ${block.workRpe}` : ""}
                </>
              : `${fmt(block.durationMin)} � RPE ${block.rpe ?? "�"}`
            }
          </div>
        </div>

        {/* a��es */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
          {/* move */}
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={onMoveUp} disabled={isFirst} style={{
              width: 30, height: 30, borderRadius: 8,
              background: C.input, border: `1px solid ${C.border}`,
              color: isFirst ? "#333" : C.muted, cursor: isFirst ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconChevUp color={isFirst ? "#333" : C.muted} />
            </button>
            <button onClick={onMoveDown} disabled={isLast} style={{
              width: 30, height: 30, borderRadius: 8,
              background: C.input, border: `1px solid ${C.border}`,
              color: isLast ? "#333" : C.muted, cursor: isLast ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconChevDown color={isLast ? "#333" : C.muted} />
            </button>
          </div>
          {/* edit / delete */}
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={onEdit} style={{
              width: 30, height: 30, borderRadius: 8,
              background: C.bluestone + "18", border: `1px solid ${C.bluestone}55`,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconEdit color={C.bluestone} />
            </button>
            <button onClick={onDelete} style={{
              width: 30, height: 30, borderRadius: 8,
              background: C.terracota + "18", border: `1px solid ${C.terracota}55`,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IconTrash color={C.terracota} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- tela de resumo -----------------------------------------------------------

function SummaryScreen({
  name, blocks, onBack, onStart,
}: {
  name: string; blocks: BuilderBlock[];
  onBack: () => void; onStart: () => void;
}) {
  const total = calcTotalDurationMin(blocks);
  const seriesCount = blocks.filter(b => b.type === "series").length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.offwhite, paddingBottom: 120 }}>

      {/* header */}
      <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", color: C.terracota, cursor: "pointer", padding: 0,
        }}>
          <IconBack />
        </button>
        <div>
          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 2 }}>
            Resumo do Treino
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>{name || "Meu Treino"}</div>
        </div>
      </div>

      {/* stats */}
      <div style={{ display: "flex", gap: 8, padding: "18px 20px 0" }}>
        {[
          { label: "DURA��O", value: formatDurationMin(total), color: C.terracota },
          { label: "ETAPAS",  value: String(blocks.length),    color: C.bluestone },
          ...(seriesCount > 0 ? [{ label: "S�RIES", value: String(seriesCount), color: C.slate }] : []),
        ].map(stat => (
          <div key={stat.label} style={{
            flex: 1, background: C.card, borderRadius: 12, padding: "14px 10px",
            textAlign: "center", border: `1px solid ${C.surface2}`,
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: 1 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* lista */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
          Estrutura do treino
        </div>
        {blocks.map(b => {
          const col = typeColor(b.type);
          const isSeries = b.type === "series";
          return (
            <div key={b.id} style={{
              background: C.card, borderRadius: 14,
              marginBottom: 8, overflow: "hidden",
              border: isSeries ? `2px solid ${col}44` : `1px solid ${C.surface2}`,
            }}>
              {isSeries && <div style={{ height: 3, background: `linear-gradient(90deg, ${col}, ${col}88)` }} />}
              <div style={{ padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 7, marginBottom: 5,
                    }}>
                      <TypeIcon type={b.type} size={14} />
                      <span style={{ fontSize: 10, color: col, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2 }}>
                        {blockLabel(b.type)}
                      </span>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: isSeries ? 800 : 700, color: C.offwhite, marginBottom: 4 }}>
                      {b.label}
                    </div>
                    {isSeries ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <IconRepeat color={col} />
                        <span style={{ fontSize: 13, color: C.muted }}>
                          <span style={{ color: col, fontWeight: 700 }}>{b.reps}�</span>
                          {" "}{fmt(b.workDurationMin ?? 2)} esfor�o
                          {(b.restDurationMin ?? 0) > 0 && (
                            <> + {fmt(b.restDurationMin!)} rec</>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: C.muted }}>{fmt(b.durationMin)} � RPE {b.rpe}</div>
                    )}
                  </div>
                  {/* dura��o / reps badge */}
                  <div style={{
                    background: col + "15",
                    border: `1px solid ${col}33`,
                    borderRadius: 10, padding: "6px 12px",
                    textAlign: "center", flexShrink: 0, marginLeft: 10,
                  }}>
                    <div style={{ fontSize: isSeries ? 20 : 18, fontWeight: 800, color: col }}>
                      {isSeries ? `${b.reps}�` : fmt(b.durationMin)}
                    </div>
                  </div>
                </div>
                {b.notes && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "#6a7a8a", fontStyle: "italic" }}>{b.notes}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA fixo */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: `linear-gradient(to top, ${C.bg} 75%, transparent)`,
        padding: "20px 20px 36px",
      }}>
        <button onClick={onStart} style={{
          width: "100%", padding: "18px 0", borderRadius: 18,
          background: `linear-gradient(135deg, ${C.terracota}, #e0773a)`,
          border: "none", color: "#fff", fontSize: 18, fontWeight: 800,
          cursor: "pointer", letterSpacing: 1,
          boxShadow: `0 6px 24px ${C.terracota}55`,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
        }}>
          <IconPlay size={20} /> INICIAR TREINO
        </button>
      </div>
    </div>
  );
}

// --- p�gina principal ---------------------------------------------------------

export default function BuilderPage() {
  const [, navigate] = useLocation();
  const [blocks, setBlocks] = useState<BuilderBlock[]>([]);
  const [workoutName, setWorkoutName] = useState("Meu Treino");
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorInit, setEditorInit] = useState<EditorState>(defaultEditor("warmup"));
  const [showSummary, setShowSummary] = useState(false);

  function openNew(type: BlockType) {
    setEditorInit(defaultEditor(type));
    setEditingIdx(null);
    setShowEditor(true);
  }

  function openEdit(idx: number) {
    const b = blocks[idx];
    setEditorInit({
      type: b.type,
      label: b.label,
      durationMin: b.durationMin ?? 10,
      rpe: b.rpe ?? 5,
      notes: b.notes ?? "",
      reps: b.reps ?? 6,
      workDurationMin: b.workDurationMin ?? 2,
      restDurationMin: b.restDurationMin ?? 1,
      workRpe: b.workRpe ?? 7,
      restRpe: b.restRpe ?? 3,
    });
    setEditingIdx(idx);
    setShowEditor(true);
  }

  function handleSave(e: EditorState) {
    if (editingIdx !== null) {
      setBlocks(prev => {
        const next = [...prev];
        next[editingIdx] = editorToBlock(e, prev[editingIdx].id);
        return next;
      });
    } else {
      setBlocks(prev => [...prev, editorToBlock(e)]);
    }
    setShowEditor(false);
  }

  function handleDelete(idx: number) {
    setBlocks(prev => prev.filter((_, i) => i !== idx));
  }

  function moveUp(idx: number) {
    if (idx === 0) return;
    setBlocks(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  }

  function moveDown(idx: number) {
    setBlocks(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  }

  function handleStart() {
    const s = loadSession();
    if (!s) return;
    const session: BuilderSession = {
      name: workoutName || "Meu Treino",
      blocks,
      totalDuration: formatDurationMin(calcTotalDurationMin(blocks)),
      createdAt: new Date().toISOString(),
    };
    s.activeBuilderSession = session;
    saveSession(s);
    navigate("/builder-timer");
  }

  const totalMin = calcTotalDurationMin(blocks);

  if (showSummary && blocks.length > 0) {
    return (
      <SummaryScreen
        name={workoutName}
        blocks={blocks}
        onBack={() => setShowSummary(false)}
        onStart={handleStart}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.offwhite, paddingBottom: 120 }}>

      {/* header */}
      <div style={{ padding: "20px 20px 0", display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{ background: "none", border: "none", color: C.terracota, cursor: "pointer", padding: 0 }}
        >
          <IconBack />
        </button>
        <div>
          <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 2.5, marginBottom: 2 }}>
            SAN RUN
          </div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Monte seu Treino</div>
        </div>
      </div>

      {/* nome do treino */}
      <div style={{ padding: "16px 20px 0" }}>
        <input
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          placeholder="Nome do treino..."
          style={{
            width: "100%", background: C.card, border: `1px solid ${C.surface2}`,
            borderRadius: 14, padding: "13px 16px", color: C.offwhite,
            fontSize: 16, fontWeight: 700, boxSizing: "border-box", outline: "none",
          }}
        />
      </div>

      {/* bot�es adicionar etapa */}
      <div style={{ padding: "20px 20px 0" }}>
        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
          Adicionar etapa
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {(["warmup", "series", "recovery", "cooldown"] as BlockType[]).map(t => {
            const col = typeColor(t);
            return (
              <button
                key={t}
                onClick={() => openNew(t)}
                style={{
                  padding: "13px 12px", borderRadius: 14,
                  background: col + "14",
                  border: `1px solid ${col}44`,
                  color: C.offwhite, fontSize: 14, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 10,
                  fontWeight: 600, textAlign: "left",
                }}
              >
                <TypeIcon type={t} size={20} />
                {blockLabel(t)}
              </button>
            );
          })}
        </div>
      </div>

      {/* lista de blocos */}
      <div style={{ padding: "20px 20px 0" }}>
        {blocks.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            color: "#444", fontSize: 14, lineHeight: 1.7,
          }}>
            Nenhuma etapa ainda.<br />
            <span style={{ fontSize: 12, color: "#333" }}>
              Adicione aquecimento, s�ries, recupera��o e desaquecimento.
            </span>
          </div>
        ) : (
          <>
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              marginBottom: 12,
            }}>
              <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5 }}>
                Etapas do treino
              </div>
              <div style={{ fontSize: 13, color: C.terracota, fontWeight: 700 }}>
                {formatDurationMin(totalMin)}
              </div>
            </div>
            {blocks.map((b, i) => (
              <BlockCard
                key={b.id}
                block={b}
                onEdit={() => openEdit(i)}
                onDelete={() => handleDelete(i)}
                onMoveUp={() => moveUp(i)}
                onMoveDown={() => moveDown(i)}
                isFirst={i === 0}
                isLast={i === blocks.length - 1}
              />
            ))}
          </>
        )}
      </div>

      {/* CTA fixo */}
      {blocks.length > 0 && (
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: `linear-gradient(to top, ${C.bg} 75%, transparent)`,
          padding: "16px 20px 36px",
        }}>
          <button
            onClick={() => setShowSummary(true)}
            style={{
              width: "100%", padding: "17px 0", borderRadius: 16,
              background: `linear-gradient(135deg, ${C.terracota}, #e0773a)`,
              border: "none", color: "#fff", fontSize: 17, fontWeight: 800,
              cursor: "pointer", letterSpacing: 0.5,
              boxShadow: `0 6px 24px ${C.terracota}44`,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
            }}
          >
            Ver Resumo � {formatDurationMin(totalMin)}
          </button>
        </div>
      )}

      {/* editor */}
      {showEditor && (
        <BlockEditor
          initial={editorInit}
          onSave={handleSave}
          onCancel={() => setShowEditor(false)}
        />
      )}
    </div>
  );
}
