// Food Tracker — modern performance-tracker aesthetic
const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ─── tweaks ─────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#7AB7FF",
  "heroMode": "bar",
  "density": "compact",
  "showSubtitles": true
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  '#D6FF3D', // electric lime  (default)
  '#7CF8C0', // mint
  '#FF6B4A', // ember
  '#7AB7FF', // sky
];

// ─── helpers ────────────────────────────────────────────────────────────
const todayStr = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};
const offsetDate = (s, n) => {
  const d = new Date(s + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const dayName = (s) => new Date(s+'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
const dayNum = (s) => new Date(s+'T00:00:00').getDate();
const monthShort = (s) => new Date(s+'T00:00:00').toLocaleDateString('en-US', { month: 'short' });
const allMeals = () => SECTIONS.flatMap(s => s.meals);

// API-backed log (production) — loaded once via /api/history/summary, then
// per-mutation POSTs keep server in sync. Local state is the cache.
const loadLog = () => ({}); // initial empty; App fetches on mount
const saveLog = (_) => {};  // mutations go through saveCount/saveWeight directly
const ensureSeed = () => ({}); // server is source of truth — no seeding

async function fetchHistorySummary() {
  const res = await fetch('/api/history/summary');
  const { logs, weights } = await res.json();
  const log = {};
  for (const row of logs) {
    if (!log[row.date]) log[row.date] = {};
    log[row.date][row.meal_name] = row.count;
  }
  for (const w of weights) {
    if (!log[w.date]) log[w.date] = {};
    log[w.date]._kg = w.kg;
  }
  return log;
}
async function saveCountAPI(date, mealId, count) {
  return fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, meal_name: mealId, count }),
  });
}
async function saveWeightAPI(date, kg) {
  return fetch('/api/weight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, kg }),
  });
}
window.fetchHistorySummary = fetchHistorySummary;
window.saveCountAPI = saveCountAPI;
window.saveWeightAPI = saveWeightAPI;

const computeTotals = (counts) => {
  const t = { protein: 0, carbs: 0, fat: 0, fiber: 0, cals: 0 };
  for (const m of allMeals()) {
    const n = counts[m.id] || 0;
    t.protein += m.protein * n;
    t.carbs   += m.carbs   * n;
    t.fat     += m.fat     * n;
    t.fiber   += m.fiber   * n;
    t.cals    += m.cals    * n;
  }
  return t;
};

// ─── ring  ──────────────────────────────────────────────────────────────
function Ring({ size = 220, stroke = 14, value, target, color, trackColor = '#1a1a1a', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, target ? value / target : 0));
  const dash = c * pct;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          style={{ transition: 'stroke-dasharray 600ms cubic-bezier(0.2,0.8,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ─── stat dial (small) ──────────────────────────────────────────────────
function MiniDial({ label, value, target, color, unit = 'g' }) {
  const pct = target ? Math.min(1, value / target) : 0;
  const size = 56, stroke = 5, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: 1 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1c1c1c" strokeWidth={stroke}/>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${c*pct} ${c}`}
            style={{ transition: 'stroke-dasharray 500ms cubic-bezier(0.2,0.8,0.2,1)' }} />
        </svg>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600, color: '#fff',
          letterSpacing: '-0.02em',
        }}>{Math.round(value)}</div>
      </div>
      <div style={{
        fontFamily: 'Sora, sans-serif', fontSize: 9.5, fontWeight: 600,
        color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.35)',
        marginTop: -3, letterSpacing: '-0.02em',
      }}>{Math.round(target)}{unit}</div>
    </div>
  );
}

// ─── day strip ──────────────────────────────────────────────────────────
function DayStrip({ currentDate, onPick, log, accent }) {
  const today = todayStr();
  // 14-day strip ending today
  const days = useMemo(() => {
    const arr = [];
    for (let i = 13; i >= 0; i--) arr.push(offsetDate(today, -i));
    return arr;
  }, [today]);

  const scrollerRef = useRef(null);
  useEffect(() => {
    // scroll selected pill into view
    const el = scrollerRef.current?.querySelector(`[data-d="${currentDate}"]`);
    if (el && scrollerRef.current) {
      const sc = scrollerRef.current;
      sc.scrollTo({ left: el.offsetLeft - sc.clientWidth/2 + el.offsetWidth/2, behavior: 'smooth' });
    }
  }, [currentDate]);

  return (
    <div ref={scrollerRef} style={{
      display: 'flex', gap: 8, padding: '12px 16px 16px',
      overflowX: 'auto', scrollbarWidth: 'none',
    }}>
      <style>{`.day-strip::-webkit-scrollbar{display:none}`}</style>
      {days.map(d => {
        const active = d === currentDate;
        const isToday = d === today;
        const dayLog = log[d] || {};
        const cals = computeTotals(dayLog).cals;
        const pct = Math.min(1, cals / TARGETS.cals);
        return (
          <button key={d} data-d={d} onClick={() => onPick(d)} style={{
            flex: '0 0 auto', width: 50, height: 70, borderRadius: 14,
            border: 'none', cursor: 'pointer', padding: 0,
            background: active ? '#fff' : '#0d0d0d',
            color: active ? '#000' : 'rgba(255,255,255,0.7)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 2, position: 'relative', transition: 'all 180ms',
            outline: active ? `1px solid ${accent}` : '1px solid #1a1a1a',
            outlineOffset: active ? 0 : 0,
          }}>
            <div style={{
              fontFamily: 'Sora, sans-serif', fontSize: 9.5, fontWeight: 600,
              opacity: active ? 0.55 : 0.5, textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>{dayName(d).slice(0,3)}</div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600,
              letterSpacing: '-0.04em', lineHeight: 1,
            }}>{dayNum(d)}</div>
            {/* tiny progress dot under date */}
            <div style={{
              width: 18, height: 3, borderRadius: 2, marginTop: 4,
              background: active ? 'rgba(0,0,0,0.1)' : '#1a1a1a', overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct * 100}%`, height: '100%',
                background: active ? '#000' : accent,
                transition: 'width 400ms',
              }}/>
            </div>
            {isToday && !active && (
              <div style={{
                position: 'absolute', top: 4, right: 4, width: 5, height: 5, borderRadius: 5,
                background: accent,
              }}/>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── meal card ──────────────────────────────────────────────────────────
function MacroInput({ letter, value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.55)' }}>
      <span style={{ color: 'rgba(255,255,255,0.3)' }}>{letter}</span>
      <input
        type="number" min="0" step="0.1" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 38, padding: '2px 4px',
          background: '#0e0e0e', border: '1px solid #1f1f1f', borderRadius: 4,
          color: 'rgba(255,255,255,0.85)', fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10.5, textAlign: 'center', MozAppearance: 'textfield',
          outline: 'none',
        }}
      />
    </label>
  );
}

function MealCard({ meal, count, onChange, accent, dense, showSub, editable, onMacroChange }) {
  const active = count > 0;
  return (
    <div style={{
      padding: dense ? '11px 14px' : '14px 16px',
      borderRadius: 14,
      background: active ? '#121212' : '#0a0a0a',
      border: active ? `1px solid ${accent}33` : '1px solid #161616',
      display: 'flex', alignItems: 'center', gap: 12,
      transition: 'border-color 200ms, background 200ms',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Sora, sans-serif', fontSize: 14, fontWeight: 600, color: '#f0f0f0',
          letterSpacing: '-0.01em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{meal.name}</div>
        {showSub && meal.sub && (
          <div style={{
            fontFamily: 'Sora, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.4)',
            marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>{meal.sub}</div>
        )}
        <div style={{
          display: 'flex', gap: 10, marginTop: 6, fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10.5, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.01em',
          alignItems: 'center',
        }}>
          {editable ? (
            <>
              <MacroInput letter="P" value={meal.protein} onChange={(v) => onMacroChange('protein', v)}/>
              <MacroInput letter="C" value={meal.carbs}   onChange={(v) => onMacroChange('carbs',   v)}/>
              <MacroInput letter="F" value={meal.fat}     onChange={(v) => onMacroChange('fat',     v)}/>
            </>
          ) : (
            <>
              <span><span style={{color:'rgba(255,255,255,0.3)'}}>P</span> {meal.protein}</span>
              <span><span style={{color:'rgba(255,255,255,0.3)'}}>C</span> {meal.carbs}</span>
              <span><span style={{color:'rgba(255,255,255,0.3)'}}>F</span> {meal.fat}</span>
            </>
          )}
          <span style={{ marginLeft: 'auto', color: active ? accent : 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
            {meal.cals}<span style={{opacity:0.5, fontSize: 9}}> kcal</span>
          </span>
        </div>
      </div>
      <Stepper count={count} onChange={onChange} accent={accent}/>
    </div>
  );
}

function Stepper({ count, onChange, accent }) {
  const active = count > 0;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 0,
      background: '#0a0a0a', borderRadius: 999,
      border: '1px solid #1a1a1a', padding: 2,
    }}>
      <button
        onClick={(e) => { e.stopPropagation(); if (count > 0) onChange(count - 1); }}
        disabled={count === 0}
        style={{
          width: 30, height: 30, borderRadius: 999, border: 'none', cursor: count ? 'pointer' : 'default',
          background: 'transparent', color: count ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.15)',
          fontSize: 18, lineHeight: 1, fontFamily: 'Sora, sans-serif', fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >−</button>
      <div style={{
        minWidth: 22, textAlign: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600,
        color: active ? '#fff' : 'rgba(255,255,255,0.3)',
      }}>{count}</div>
      <button
        onClick={(e) => { e.stopPropagation(); onChange(count + 1); }}
        style={{
          width: 30, height: 30, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: active ? accent : '#1a1a1a',
          color: active ? '#000' : '#fff', fontSize: 18, fontWeight: 500,
          fontFamily: 'Sora, sans-serif', lineHeight: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 200ms',
        }}
      >+</button>
    </div>
  );
}

// ─── weight card ────────────────────────────────────────────────────────
function WeightCard({ weight, onSave, accent, trend }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(weight ?? '');
  useEffect(() => { setVal(weight ?? ''); }, [weight]);
  const trendStr = trend == null ? null : trend === 0 ? '0.0' : (trend > 0 ? '+' : '') + trend.toFixed(1);

  return (
    <div style={{
      padding: '14px 16px', borderRadius: 14, background: '#0a0a0a',
      border: '1px solid #161616',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: 'Sora, sans-serif', fontSize: 9.5, fontWeight: 600,
          color: 'rgba(255,255,255,0.45)', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>Body Weight</div>
        {editing ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginTop: 4 }}>
            <input autoFocus type="number" step="0.1" value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') { onSave(parseFloat(val)); setEditing(false); }
                if (e.key === 'Escape') setEditing(false);
              }}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 600,
                color: '#fff', width: 110, padding: 0, letterSpacing: '-0.04em',
                borderBottom: `1px solid ${accent}`,
              }}
            />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>kg</span>
          </div>
        ) : (
          <div onClick={() => setEditing(true)} style={{
            cursor: 'pointer', display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4,
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 600, color: '#fff',
              letterSpacing: '-0.04em',
            }}>{weight ?? '—'}</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>kg</span>
            {trendStr && weight != null && (
              <span style={{
                marginLeft: 8, fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: trend < 0 ? accent : trend > 0 ? '#FF6B4A' : 'rgba(255,255,255,0.4)',
                padding: '2px 7px', borderRadius: 4, background: '#101010',
              }}>{trendStr}</span>
            )}
          </div>
        )}
      </div>
      {!editing && (
        <button onClick={() => setEditing(true)} style={{
          width: 36, height: 36, borderRadius: 999,
          background: weight == null ? accent : '#101010',
          color: weight == null ? '#000' : 'rgba(255,255,255,0.55)',
          border: weight == null ? 'none' : '1px solid #1a1a1a',
          cursor: 'pointer', fontSize: 16, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Sora, sans-serif',
        }}>{weight == null ? '+' : '✎'}</button>
      )}
    </div>
  );
}

Object.assign(window, { Ring, MiniDial, DayStrip, MealCard, Stepper, WeightCard,
  todayStr, offsetDate, dayName, dayNum, monthShort, allMeals, computeTotals,
  loadLog, saveLog, ensureSeed, ACCENT_OPTIONS, TWEAK_DEFAULTS });
