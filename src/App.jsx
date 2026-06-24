import { useState, useEffect, useRef } from "react";

const SESSIONS = {
  "Lunes — UPPER A": [
    { name: "Press de banca con barra", series: 4, reps: "6-10", rest: 120 },
    { name: "Remo en máquina de discos", series: 4, reps: "8-10", rest: 120 },
    { name: "Press militar con mancuernas", series: 3, reps: "8-12", rest: 90 },
    { name: "Aperturas de pecho en máquina", series: 3, reps: "10-12", rest: 90 },
    { name: "Extensión de tríceps en polea", series: 3, reps: "10-15", rest: 60 },
    { name: "Curl de antebrazo con barra", series: 3, reps: "12-15", rest: 60 },
    { name: "Agarre invertido", series: 3, reps: "12-15", rest: 60 },
  ],
  "Martes — LOWER A": [
    { name: "Prensa con banda", series: 4, reps: "6-10", rest: 120 },
    { name: "Sentadilla goblet con mancuerna", series: 3, reps: "10-12", rest: 90 },
    { name: "Extensión de cuádriceps en máquina", series: 3, reps: "10-15", rest: 90 },
    { name: "Zancadas con mancuernas", series: 3, reps: "10 c/lado", rest: 90 },
    { name: "Elevación de gemelos en máquina", series: 4, reps: "10-15", rest: 60 },
    { name: "Hollow Body Hold", series: 3, reps: "30 seg", rest: 45 },
  ],
  "Jueves — UPPER B": [
    { name: "Jalón al pecho agarre ancho", series: 4, reps: "6-10", rest: 120 },
    { name: "Jalón al pecho agarre cerrado", series: 3, reps: "8-12", rest: 90 },
    { name: "Pull over unilateral en polea", series: 3, reps: "10-12", rest: 90 },
    { name: "Elevaciones laterales en máquina", series: 3, reps: "12-15", rest: 60 },
    { name: "Elevaciones posteriores con mancuernas", series: 3, reps: "15-20", rest: 60 },
    { name: "Curl de bíceps araña con barra", series: 3, reps: "8-10", rest: 90 },
    { name: "Curl martillo con mancuernas", series: 3, reps: "10-12", rest: 60 },
    { name: "Paseo del granjero", series: 3, reps: "30 seg", rest: 60 },
  ],
  "Viernes — LOWER B": [
    { name: "Curl femoral tumbado en máquina", series: 4, reps: "10-12", rest: 90 },
    { name: "Hiperextensión lumbar con peso", series: 3, reps: "10-15", rest: 90 },
    { name: "Prensa inclinada a una pierna", series: 3, reps: "8-10 c/lado", rest: 90 },
    { name: "Aducción de cadera en máquina", series: 3, reps: "12-15", rest: 45 },
    { name: "Abducción de cadera en máquina", series: 3, reps: "12-15", rest: 45 },
    { name: "Elevación de gemelos de pie", series: 3, reps: "12-15", rest: 60 },
    { name: "Jack Knife Crunch", series: 3, reps: "12-15", rest: 60 },
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

function SetRow({ setNum, exerciseName, sessionKey, onRestStart, savedData, onSave }) {
  const key = `${sessionKey}||${exerciseName}||set${setNum}`;
  const saved = savedData[key] || {};
  const [kg, setKg] = useState(saved.kg || "");
  const [reps, setReps] = useState(saved.reps || "");
  const [done, setDone] = useState(saved.done || false);

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
        width: 24, height: 24, borderRadius: "50%", background: "#1f2937",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, color: "#6b7280", flexShrink: 0
      }}>{setNum}</div>
      <input type="number" placeholder="kg" value={kg} onChange={e => handleKg(e.target.value)}
        style={{ width: 56, background: "#1f2937", border: "1px solid #374151", borderRadius: 6, color: "#f9fafb", padding: "6px 8px", fontSize: 14, textAlign: "center", outline: "none" }} />
      <input type="number" placeholder="reps" value={reps} onChange={e => handleReps(e.target.value)}
        style={{ width: 56, background: "#1f2937", border: "1px solid #374151", borderRadius: 6, color: "#f9fafb", padding: "6px 8px", fontSize: 14, textAlign: "center", outline: "none" }} />
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

  return (
    <div style={{
      background: "#111827", borderRadius: 12, marginBottom: 10,
      border: `1px solid ${open ? color + "44" : "#1f2937"}`, overflow: "hidden", transition: "border-color 0.2s"
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "none", border: "none", cursor: "pointer",
        padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, textAlign: "left"
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>💪</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: "#f9fafb", fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{exercise.name}</div>
          <div style={{ color: "#6b7280", fontSize: 12 }}>{exercise.series} series · {exercise.reps} reps · {formatTime(exercise.rest)} descanso</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
          <div style={{ fontSize: 12, color: doneSets === totalSets ? "#10b981" : "#6b7280" }}>{doneSets}/{totalSets}</div>
          <div style={{ fontSize: 12, color: "#374151" }}>{open ? "▲" : "▼"}</div>
        </div>
      </button>
      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#6b7280", letterSpacing: 1 }}>KG</div>
            <div style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#6b7280", letterSpacing: 1 }}>REPS</div>
            <div style={{ width: 32 }} />
          </div>
          {Array.from({ length: totalSets }, (_, i) => (
            <SetRow key={i} setNum={i + 1} exerciseName={exercise.name} sessionKey={sessionKey}
              savedData={savedData} onSave={onSave} onRestStart={() => onRestStart(exercise.rest)} />
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
              <div style={{ fontSize: 12, color: "#6b7280", letterSpacing: 2, textTransform: "uppercase" }}>{SESSIONS[activeSession].length} ejercicios</div>
              <button onClick={() => handleClearSession(activeSession)} style={{ background: "transparent", border: "1px solid #374151", color: "#6b7280", padding: "4px 10px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>Resetear sesión</button>
            </div>
            {SESSIONS[activeSession].map((exercise, i) => (
              <ExerciseCard key={i} exercise={exercise} sessionKey={activeSession} color={color}
                savedData={savedData} onSave={handleSave} onRestStart={(secs) => setTimer({ seconds: secs })} />
            ))}
          </div>
        )}

        {tab === "historial" && <HistoryView savedData={savedData} />}
      </div>

      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480, background: "#0d1117", borderTop: "1px solid #1f2937", display: "flex"
      }}>
        {[{ key: "entrenar", label: "Entrenar", icon: "🏋️" }, { key: "historial", label: "Historial", icon: "📊" }].map(({ key, label, icon }) => (
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
