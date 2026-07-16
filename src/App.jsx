import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// TÉCNICAS DE INTENSIDAD
// dropset: última serie → fallo → baja ~40% el peso → fallo otra vez
// restpause: última serie → fallo → 15s descanso → 3-5 reps → 15s → 2-3 reps
// pausa: pausa de 2 segundos abajo (estiramiento) en CADA rep
// superset: ejercicio A + B sin descanso entre ellos
// ─────────────────────────────────────────────

const TECH_INFO = {
  dropset: {
    label: "DROP SET",
    color: "#ef4444",
    desc: "Solo en la ÚLTIMA serie: llega al fallo, baja el peso ~40% y sigue hasta fallar otra vez.",
  },
  restpause: {
    label: "REST-PAUSE",
    color: "#f97316",
    desc: "Solo en la ÚLTIMA serie: fallo → descansa 15 seg → 3-5 reps más → 15 seg → 2-3 reps finales.",
  },
  pausa: {
    label: "PAUSA 2s",
    color: "#06b6d4",
    desc: "En CADA rep: pausa de 2 segundos abajo, en el estiramiento. Sin rebotes.",
  },
  superset: {
    label: "SUPERSERIE",
    color: "#a855f7",
    desc: "Haz este ejercicio y el siguiente SIN descanso entre ellos. Descansa al terminar los dos.",
  },
};

const SESSIONS = {
  "Lunes — UPPER A": [
    { name: "1. Press de banca con barra", series: 4, reps: "6-10", rest: 120, note: "Compuesto principal. Peso limpio, sin técnicas. Fresco o nada." },
    { name: "2. Remo en máquina de discos", series: 4, reps: "8-10", rest: 120, note: "Peso limpio. Agarre fresco (por eso antebrazo va al final)." },
    { name: "3. Press militar con mancuernas", series: 3, reps: "8-12", rest: 90, note: "El hombro ya viene tocado de banca: menos peso, mismo estímulo." },
    { name: "4. Aperturas de pecho en máquina", series: 3, reps: "10-12", rest: 90, tech: "dropset", note: "Remata el pecho pre-fatigado." },
    { name: "5. Extensión de tríceps en polea", series: 4, reps: "10-15", rest: 60, tech: "restpause", note: "El tríceps viene tocado de los press." },
    { name: "6A. Curl de antebrazo con barra", series: 3, reps: "12-15", rest: 0, tech: "superset", note: "Superserie con 6B. Sin descanso entre ambos." },
    { name: "6B. Agarre invertido (barra EZ)", series: 3, reps: "12-15", rest: 60, tech: "superset", note: "Palmas hacia abajo. Descansa 60s tras completar A+B." },
  ],
  "Martes — LOWER A": [
    { name: "1. Prensa con banda", series: 4, reps: "6-10", rest: 120, note: "El movimiento más pesado de pierna. Va primero sí o sí." },
    { name: "2. Sentadilla goblet con mancuerna", series: 3, reps: "10-12", rest: 90, note: "Refuerza el patrón con el cuádriceps ya activado." },
    { name: "3. Extensión de cuádriceps en máquina", series: 3, reps: "10-15", rest: 90, tech: "dropset", note: "Cuádriceps pre-agotado: aquí lo rematas." },
    { name: "4. Zancadas con mancuernas", series: 3, reps: "10 c/lado", rest: 90, note: "Si la fatiga compromete técnica, baja a 2 series." },
    { name: "5. Elevación de gemelos en máquina", series: 4, reps: "10-15", rest: 60, tech: "pausa", note: "Pausa 2s abajo en cada rep. Sin rebote = cada rep vale doble." },
    { name: "6. Hollow Body Hold", series: 3, reps: "30 seg", rest: 45, note: "Pelvis neutra incluso fatigado: clave para tu postura." },
  ],
  "Jueves — UPPER B": [
    { name: "1. Jalón al pecho agarre ancho", series: 4, reps: "6-10", rest: 120, note: "Compuesto principal. Peso limpio. Da anchura de espalda." },
    { name: "2. Press inclinado con mancuernas", series: 3, reps: "8-12", rest: 90, note: "Pecho superior (tu zona a mejorar). Intercalado entre tirones." },
    { name: "3. Remo sentado en polea", series: 3, reps: "8-12", rest: 90, note: "Grosor de espalda. Pre-fatigada del jalón = menos peso, mismo efecto." },
    { name: "4. Elevaciones laterales en máquina", series: 3, reps: "12-15", rest: 60, tech: "dropset", note: "Anchura de hombros. Músculo pequeño, ideal para drop set." },
    { name: "5. Elevaciones posteriores con mancuernas", series: 3, reps: "15-20", rest: 60, note: "Hombro posterior fresco. Reps altas, responde mejor así." },
    { name: "6. Curl de bíceps araña con barra", series: 3, reps: "8-10", rest: 90, tech: "restpause", note: "Sin impulso posible. El bíceps ya lleva jalón + remo encima." },
    { name: "7A. Curl martillo con mancuernas", series: 3, reps: "10-12", rest: 0, tech: "superset", note: "Superserie con 7B. Sin descanso entre ambos." },
    { name: "7B. Paseo del granjero", series: 3, reps: "30 seg", rest: 60, tech: "superset", note: "Al acabar no deberías poder cerrar bien el puño. Esa es la señal." },
  ],
  "Viernes — LOWER B": [
    { name: "1. Curl femoral tumbado en máquina", series: 4, reps: "10-12", rest: 90, note: "Femoral fresco y primero: es tu prioridad rezagada." },
    { name: "2. Prensa inclinada a una pierna", series: 3, reps: "8-10 c/lado", rest: 90, note: "Glúteo y cuádriceps sin robarle nada al femoral. Corrige desequilibrios." },
    { name: "3. Curl femoral sentado", series: 3, reps: "10-12", rest: 90, tech: "dropset", note: "Trabaja el femoral en más estiramiento que el tumbado." },
    { name: "4. Hiperextensión lumbar con peso", series: 3, reps: "10-15", rest: 90, note: "Subir controlado, SIN hiperextender arriba. Parte de tu corrección postural." },
    { name: "5A. Aducción de cadera en máquina", series: 3, reps: "12-15", rest: 0, tech: "superset", note: "Superserie con 5B. Sin descanso entre ambos." },
    { name: "5B. Abducción de cadera en máquina", series: 3, reps: "12-15", rest: 45, tech: "superset", note: "Estabilizan la pelvis. Descansa 45s tras completar A+B." },
    { name: "6. Elevación de gemelos de pie", series: 3, reps: "12-15", rest: 60, tech: "pausa", note: "Pausa 2s abajo en cada rep. Complementa al de máquina del martes." },
  ],
};

const SESSION_COLORS = {
  "Lunes — UPPER A": "#3b82f6",
  "Martes — LOWER A": "#10b981",
  "Jueves — UPPER B": "#8b5cf6",
  "Viernes — LOWER B": "#f59e0b",
};

const DAY_SHORT = {
  "Lunes — UPPER A": "LUN",
  "Martes — LOWER A": "MAR",
  "Jueves — UPPER B": "JUE",
  "Viernes — LOWER B": "VIE",
};

function formatTime(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function loadData() {
  try {
    const raw = localStorage.getItem("otto-gym-data");
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveData(data) {
  try {
    localStorage.setItem("otto-gym-data", JSON.stringify(data));
  } catch {}
}

function TechBadge({ tech }) {
  if (!tech) return null;
  const t = TECH_INFO[tech];
  return (
    <span style={{
      display: "inline-block", background: t.color + "22", color: t.color,
      border: `1px solid ${t.color}55`, borderRadius: 5, padding: "1px 7px",
      fontSize: 10, fontWeight: 800, letterSpacing: 0.5, marginLeft: 6,
      verticalAlign: "middle", whiteSpace: "nowrap"
    }}>{t.label}</span>
  );
}

function Timer({ seconds, onDone }) {
  const [left, setLeft] = useState(seconds);
  const ref = useRef();
  useEffect(() => { setLeft(seconds); }, [seconds]);
  useEffect(() => {
    if (left <= 0) { onDone(); return; }
    ref.current = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(ref.current);
  }, [left]);
  const pct = (left / seconds) * 100;
  const color = left <= 10 ? "#ef4444" : left <= 30 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ textAlign: "center", padding: "24px 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 2, color: "#6b7280", marginBottom: 12, textTransform: "uppercase" }}>Descansando</div>
      <div style={{
        width: 120, height: 120, borderRadius: "50%", margin: "0 auto 16px",
        background: `conic-gradient(${color} ${pct * 3.6}deg, #1f2937 0deg)`,
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: "50%", background: "#111827",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, fontWeight: 700, color, fontVariantNumeric: "tabular-nums"
        }}>
          {formatTime(left)}
        </div>
      </div>
      <button onClick={onDone} style={{
        background: "transparent", border: "1px solid #374151", color: "#9ca3af",
        padding: "8px 20px", borderRadius: 8, fontSize: 13, cursor: "pointer"
      }}>Saltar</button>
    </div>
  );
}

function SetRow({ setNum, totalSets, exerciseName, sessionKey, tech, onRestStart, savedData, onSave }) {
  const key = `${sessionKey}||${exerciseName}||set${setNum}`;
  const saved = savedData[key] || {};
  const [kg, setKg] = useState(saved.kg || "");
  const [reps, setReps] = useState(saved.reps || "");
  const [done, setDone] = useState(saved.done || false);

  const isLastSet = setNum === totalSets;
  const lastSetTech = (tech === "dropset" || tech === "restpause") && isLastSet;

  function handleDone() {
    const newDone = !done;
    setDone(newDone);
    onSave(key, { kg, reps, done: newDone, ts: Date.now() });
    if (newDone) onRestStart();
  }
  function handleKg(v) { setKg(v); onSave(key, { kg: v, reps, done, ts: Date.now() }); }
  function handleReps(v) { setReps(v); onSave(key, { kg, reps: v, done, ts: Date.now() }); }

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 0",
      borderBottom: "1px solid #1f2937", opacity: done ? 0.5 : 1, transition: "opacity 0.2s"
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: "50%",
        background: lastSetTech ? TECH_INFO[tech].color + "33" : "#1f2937",
        border: lastSetTech ? `1px solid ${TECH_INFO[tech].color}` : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, color: lastSetTech ? TECH_INFO[tech].color : "#6b7280",
        fontWeight: lastSetTech ? 800 : 400, flexShrink: 0
      }}>{setNum}</div>
      <input type="number" placeholder="kg" value={kg} onChange={e => handleKg(e.target.value)}
        style={{ width: 56, background: "#1f2937", border: "1px solid #374151", borderRadius: 6, color: "#f9fafb", padding: "6px 8px", fontSize: 14, textAlign: "center", outline: "none" }} />
      <input type="number" placeholder="reps" value={reps} onChange={e => handleReps(e.target.value)}
        style={{ width: 56, background: "#1f2937", border: "1px solid #374151", borderRadius: 6, color: "#f9fafb", padding: "6px 8px", fontSize: 14, textAlign: "center", outline: "none" }} />
      {lastSetTech && (
        <span style={{ fontSize: 9, color: TECH_INFO[tech].color, fontWeight: 700, letterSpacing: 0.3 }}>
          {TECH_INFO[tech].label} AQUÍ
        </span>
      )}
      <button onClick={handleDone} style={{
        marginLeft: "auto", width: 32, height: 32, borderRadius: "50%",
        background: done ? "#10b981" : "#1f2937", border: done ? "none" : "1px solid #374151",
        color: done ? "#fff" : "#6b7280", fontSize: 16, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s"
      }}>✓</button>
    </div>
  );
}

function ExerciseCard({ exercise, sessionKey, color, savedData, onSave, onRestStart }) {
  const [open, setOpen] = useState(false);
  const totalSets = exercise.series;
  const doneSets = Array.from({ length: totalSets }, (_, i) => {
    const k = `${sessionKey}||${exercise.name}||set${i + 1}`;
    return savedData[k]?.done;
  }).filter(Boolean).length;

  const tech = exercise.tech ? TECH_INFO[exercise.tech] : null;

  return (
    <div style={{
      background: "#111827", borderRadius: 12, marginBottom: 10,
      border: `1px solid ${open ? color + "44" : "#1f2937"}`, overflow: "hidden", transition: "border-color 0.2s"
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, textAlign: "left"
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: (tech ? tech.color : color) + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>💪</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "#f9fafb", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>
            {exercise.name}
            <TechBadge tech={exercise.tech} />
          </div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>
            {exercise.series} series · {exercise.reps} reps{exercise.rest > 0 ? ` · ${formatTime(exercise.rest)} descanso` : " · sin descanso →"}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ fontSize: 12, color: doneSets === totalSets ? "#10b981" : "#6b7280" }}>{doneSets}/{totalSets}</div>
          <div style={{ fontSize: 12, color: "#374151" }}>{open ? "▲" : "▼"}</div>
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          {tech && (
            <div style={{
              background: tech.color + "11", border: `1px solid ${tech.color}44`,
              borderRadius: 8, padding: "8px 12px", marginBottom: 10,
              fontSize: 12, color: "#d1d5db", lineHeight: 1.5
            }}>
              <span style={{ color: tech.color, fontWeight: 800 }}>{tech.label}: </span>
              {tech.desc}
            </div>
          )}
          {exercise.note && (
            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10, lineHeight: 1.5, fontStyle: "italic" }}>
              💡 {exercise.note}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ width: 24 }} />
            <div style={{ width: 56, textAlign: "center", fontSize: 11, color: "#6b7280", letterSpacing: 1 }}>KG</div>
            <div style={{ width: 56, textAlign: "center", fontSize: 11, color: "#6b7280", letterSpacing: 1 }}>REPS</div>
          </div>
          {Array.from({ length: totalSets }, (_, i) => (
            <SetRow key={i} setNum={i + 1} totalSets={totalSets} exerciseName={exercise.name} sessionKey={sessionKey}
              tech={exercise.tech} savedData={savedData} onSave={onSave} onRestStart={() => onRestStart(exercise.rest || 60)} />
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryView({ savedData }) {
  const grouped = {};
  Object.entries(savedData).forEach(([key, val]) => {
    if (!val.ts) return;
    const [session, exercise] = key.split("||");
    const date = new Date(val.ts).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" });
    const gkey = `${date}||${session}`;
    if (!grouped[gkey]) grouped[gkey] = {};
    if (!grouped[gkey][exercise]) grouped[gkey][exercise] = [];
    grouped[gkey][exercise].push({ kg: val.kg, reps: val.reps, done: val.done });
  });

  const entries = Object.entries(grouped).sort((a, b) => b[0].localeCompare(a[0]));

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px", color: "#6b7280" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
        <div style={{ fontSize: 14 }}>Aún no hay registros.</div>
        <div style={{ fontSize: 13, marginTop: 6 }}>Completa tu primera sesión para verlo aquí.</div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      {entries.map(([gkey, exercises]) => {
        const [date, session] = gkey.split("||");
        const color = SESSION_COLORS[session] || "#6b7280";
        return (
          <div key={gkey} style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{ width: 3, height: 20, background: color, borderRadius: 2 }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "#f9fafb" }}>{date}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>{session}</div>
            </div>
            {Object.entries(exercises).map(([exName, sets]) => {
              const doneSets = sets.filter(s => s.done && s.kg);
              if (doneSets.length === 0) return null;
              return (
                <div key={exName} style={{ background: "#111827", borderRadius: 10, padding: "12px 14px", marginBottom: 8, border: "1px solid #1f2937" }}>
                  <div style={{ fontSize: 13, color: "#e5e7eb", fontWeight: 600, marginBottom: 8 }}>{exName}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {doneSets.map((s, i) => (
                      <div key={i} style={{ background: color + "22", border: `1px solid ${color}44`, borderRadius: 6, padding: "4px 10px", fontSize: 12, color: "#d1d5db" }}>
                        {s.kg ? `${s.kg}kg` : "—"} × {s.reps || "—"}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function GuideView() {
  return (
    <div style={{ padding: 16 }}>
      <div style={{ fontSize: 12, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Técnicas de intensidad</div>
      {Object.entries(TECH_INFO).map(([key, t]) => (
        <div key={key} style={{
          background: "#111827", borderRadius: 12, padding: "14px 16px", marginBottom: 10,
          border: `1px solid ${t.color}33`
        }}>
          <div style={{ color: t.color, fontSize: 13, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>{t.label}</div>
          <div style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.6 }}>{t.desc}</div>
        </div>
      ))}
      <div style={{
        background: "#111827", borderRadius: 12, padding: "14px 16px", marginTop: 20,
        border: "1px solid #1f2937"
      }}>
        <div style={{ color: "#f59e0b", fontSize: 13, fontWeight: 800, marginBottom: 8 }}>⚠️ REGLA DE LAS 2 PRIMERAS SEMANAS</div>
        <div style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.6 }}>
          Las semanas 1 y 2 haz el plan SIN drop sets ni rest-pause — solo superseries y pausas de gemelo.
          Primero establece tus pesos de referencia. A partir de la semana 3, actívalo todo.
        </div>
      </div>
      <div style={{
        background: "#111827", borderRadius: 12, padding: "14px 16px", marginTop: 10,
        border: "1px solid #1f2937"
      }}>
        <div style={{ color: "#10b981", fontSize: 13, fontWeight: 800, marginBottom: 8 }}>📈 PROGRESIÓN</div>
        <div style={{ color: "#d1d5db", fontSize: 13, lineHeight: 1.6 }}>
          Cuando llegues al tope del rango de reps en todas las series de un ejercicio, sube el peso la semana
          siguiente (~2.5kg en máquinas, 1.25kg por mancuerna). Los compuestos pesados (banca, remo, jalón,
          prensa, femoral tumbado) siempre limpios: su técnica de intensidad es más peso cada semana.
        </div>
      </div>
    </div>
  );
}

export default function GymTracker() {
  const [tab, setTab] = useState("entrenar");
  const [activeSession, setActiveSession] = useState(null);
  const [savedData, setSavedData] = useState(() => loadData());
  const [timer, setTimer] = useState(null);

  function handleSave(key, val) {
    const updated = { ...savedData, [key]: val };
    setSavedData(updated);
    saveData(updated);
  }

  function handleClearSession(sessionKey) {
    const updated = { ...savedData };
    Object.keys(updated).forEach(k => { if (k.startsWith(sessionKey + "||")) delete updated[k]; });
    setSavedData(updated);
    saveData(updated);
  }

  const color = activeSession ? SESSION_COLORS[activeSession] : "#3b82f6";

  return (
    <div style={{ background: "#0a0f1a", minHeight: "100vh", fontFamily: "system-ui, -apple-system, sans-serif", color: "#f9fafb", maxWidth: 480, margin: "0 auto", position: "relative" }}>

      <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid #1f2937" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.5 }}>
              {activeSession && tab === "entrenar"
                ? <span style={{ color }}>{activeSession.split("—")[1]?.trim()}</span>
                : <span>GYM <span style={{ color: "#3b82f6" }}>TRACKER</span></span>}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
              {activeSession && tab === "entrenar" ? activeSession.split("—")[0]?.trim() : "Otto · Holiday Gym Albufera"}
            </div>
          </div>
          {activeSession && tab === "entrenar" && (
            <button onClick={() => setActiveSession(null)} style={{ background: "#1f2937", border: "none", color: "#9ca3af", padding: "6px 12px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>← Volver</button>
          )}
        </div>
      </div>

      {timer && (
        <div style={{ position: "fixed", inset: 0, background: "#0a0f1aee", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#111827", borderRadius: 20, padding: 24, width: 240, border: "1px solid #1f2937" }}>
            <Timer seconds={timer.seconds} onDone={() => setTimer(null)} />
          </div>
        </div>
      )}

      <div style={{ paddingBottom: 80 }}>
        {tab === "entrenar" && !activeSession && (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 12, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>Selecciona sesión</div>
            {Object.entries(SESSIONS).map(([sessionKey, exercises]) => {
              const c = SESSION_COLORS[sessionKey];
              const day = DAY_SHORT[sessionKey];
              const totalSets = exercises.reduce((a, e) => a + e.series, 0);
              const doneSets = exercises.reduce((a, e) => {
                return a + Array.from({ length: e.series }, (_, i) => {
                  const k = `${sessionKey}||${e.name}||set${i + 1}`;
                  return savedData[k]?.done ? 1 : 0;
                }).reduce((x, y) => x + y, 0);
              }, 0);
              const pct = totalSets > 0 ? (doneSets / totalSets) * 100 : 0;
              return (
                <button key={sessionKey} onClick={() => setActiveSession(sessionKey)} style={{
                  width: "100%", background: "#111827", border: `1px solid ${c}33`,
                  borderRadius: 14, padding: 16, marginBottom: 10, cursor: "pointer",
                  textAlign: "left", display: "flex", alignItems: "center", gap: 14
                }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, background: c + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: c, letterSpacing: 1 }}>{day}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#f9fafb", marginBottom: 4 }}>{sessionKey.split("—")[1]?.trim()}</div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{exercises.length} ejercicios · {totalSets} series</div>
                    <div style={{ height: 4, background: "#1f2937", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: c, borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: pct === 100 ? "#10b981" : "#6b7280", fontWeight: 600 }}>
                    {pct === 100 ? "✓" : `${Math.round(pct)}%`}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {tab === "entrenar" && activeSession && (
          <div style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase" }}>{SESSIONS[activeSession].length} ejercicios · en orden</div>
              <button onClick={() => handleClearSession(activeSession)} style={{ background: "transparent", border: "1px solid #374151", color: "#6b7280", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>Resetear sesión</button>
            </div>
            {SESSIONS[activeSession].map((exercise, i) => (
              <ExerciseCard key={i} exercise={exercise} sessionKey={activeSession} color={color}
                savedData={savedData} onSave={handleSave} onRestStart={(secs) => setTimer({ seconds: secs })} />
            ))}
          </div>
        )}

        {tab === "guia" && <GuideView />}
        {tab === "historial" && <HistoryView savedData={savedData} />}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, background: "#0d1117", borderTop: "1px solid #1f2937", display: "flex"
      }}>
        {[
          { key: "entrenar", label: "Entrenar", icon: "🏋️" },
          { key: "guia", label: "Guía", icon: "📖" },
          { key: "historial", label: "Historial", icon: "📊" },
        ].map(({ key, label, icon }) => (
          <button key={key} onClick={() => { setTab(key); if (key === "entrenar") setActiveSession(null); }} style={{
            flex: 1, background: "none", border: "none", padding: "12px 0 16px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4
          }}>
            <span style={{ fontSize: 20 }}>{icon}</span>
            <span style={{ fontSize: 11, color: tab === key ? "#3b82f6" : "#6b7280", fontWeight: tab === key ? 700 : 400 }}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
