// Food Tracker — Whoop-inspired UI primitives
const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ─── tweaks ─────────────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#0093E7",
  "heroMode": "rings",
  "density": "compact",
  "showSubtitles": true
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = [
  '#0093E7', // strain blue (default)
  '#7BA3C7', // sleep blue
  '#16EC06', // recovery green
  '#FF8A3D', // amber
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

// Rescale macro targets to a new calorie goal, holding the current split.
// Protein and fat scale proportionally; carbs take the remainder so the
// macros still add up to the calorie figure exactly after rounding.
const deriveTargets = (newCals) => {
  const k = newCals / TARGETS.cals;
  const protein = Math.round(TARGETS.protein * k);
  const fat = Math.round(TARGETS.fat * k);
  const carbs = Math.max(0, Math.round((newCals - protein * 4 - fat * 9) / 4));
  return { cals: Math.round(newCals), protein, carbs, fat, fiber: TARGETS.fiber };
};

const saveTargets = (next) => {
  Object.assign(TARGETS, next);
  try { localStorage.setItem(TARGETS_KEY, JSON.stringify(TARGETS)); } catch (_) {}
};

// Consecutive days with anything logged, ending today (or yesterday if today
// is still empty — logging early in the day shouldn't reset the streak).
const computeStreak = (log) => {
  const today = todayStr();
  const hasData = (d) => {
    const day = log[d];
    if (!day) return false;
    return Object.keys(day).some(k => k !== '_kg' && day[k] > 0) || day._kg != null;
  };
  let cursor = hasData(today) ? today : offsetDate(today, -1);
  let n = 0;
  while (hasData(cursor) && n < 999) { n++; cursor = offsetDate(cursor, -1); }
  return n;
};

// ─── ring ───────────────────────────────────────────────────────────────
function Ring({ size = 96, stroke = 8, pct = 0, color, track, glow = true, children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, pct || 0));
  const dash = c * p;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={track || W.track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeLinecap={p > 0 ? 'round' : 'butt'}
          strokeDasharray={`${dash} ${c - dash}`}
          style={{
            transition: 'stroke-dasharray 700ms cubic-bezier(0.2,0.8,0.2,1), stroke 400ms',
            filter: glow && p > 0 ? `drop-shadow(0 0 5px ${color}66)` : 'none',
          }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  );
}

// ─── hero ring stat (the Whoop three-up) ────────────────────────────────
function Chevron({ size = 10, color }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 6 10" fill="none" style={{ flex: '0 0 auto' }}>
      <path d="M1 1L5 5L1 9" stroke={color || W.t3} strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// `sub` is the "/ 155g" denominator line shown in absolute-units mode.
function RingStat({ label, value, unit, sub, pct, color, size = 100, onPress }) {
  const digits = String(value).length;
  const big = sub
    ? (digits >= 4 ? 21 : 25)
    : (digits >= 4 ? 25 : 30);
  return (
    <button onClick={onPress} style={{
      flex: 1, background: 'none', border: 'none', padding: 0,
      cursor: onPress ? 'pointer' : 'default',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
    }}>
      <Ring size={size} stroke={7} pct={pct} color={color}>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <span style={T.num(big)}>{value}</span>
          {unit && <span style={{
            fontSize: big * 0.5, fontWeight: 600, color: W.text, letterSpacing: '-0.01em',
          }}>{unit}</span>}
        </div>
        {sub && (
          <div style={{
            fontSize: 10.5, fontWeight: 600, color: W.t3, marginTop: 3,
            letterSpacing: '-0.01em',
          }}>{sub}</div>
        )}
      </Ring>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={T.label(11.5, W.text)}>{label}</span>
        <Chevron size={7} color={W.t3}/>
      </div>
    </button>
  );
}

// Inline styles can't carry media queries, so breakpoints go through JS.
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    try { return window.matchMedia(query).matches; } catch (_) { return false; }
  });
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

// State backed by localStorage — survives reloads without touching the server.
function useStoredState(key, initial) {
  const [v, setV] = useState(() => {
    try { return localStorage.getItem(key) ?? initial; } catch (_) { return initial; }
  });
  const set = (next) => {
    setV(next);
    try { localStorage.setItem(key, next); } catch (_) {}
  };
  return [v, set];
}

// ─── generic card ───────────────────────────────────────────────────────
function Card({ children, style, onClick, pad = 16 }) {
  return (
    <div onClick={onClick} style={{
      background: W.card, borderRadius: W.radius, padding: pad,
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

// Card header: wide uppercase title, optional right-side glyph. Mirrors
// Whoop's "TODAY'S ACTIVITIES ⤢" / "HEALTH MONITOR ›" pattern.
function CardHead({ title, right, accentCount, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 10, marginBottom: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
        <span style={T.label(11.5, W.text)}>{title}</span>
        {accentCount > 0 && (
          <span style={{
            ...T.label(10, '#001018'), background: accent || W.blue,
            padding: '2px 6px', borderRadius: 5, letterSpacing: '0.04em',
          }}>{accentCount}</span>
        )}
      </div>
      {right}
    </div>
  );
}

// ─── monitor card (the two-up under the rings) ──────────────────────────
function MonitorCard({ title, badge, badgeColor, status, sub, onPress }) {
  return (
    <Card onClick={onPress} pad={14} style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        marginBottom: 14,
      }}>
        <span style={T.label(11, W.text)}>{title}</span>
        <Chevron size={7} color={W.t3}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{
          flex: '0 0 auto', minWidth: 34, height: 34, borderRadius: 8,
          background: `${badgeColor}26`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 6px',
          fontSize: 13, fontWeight: 700, color: badgeColor, letterSpacing: '-0.02em',
        }}>{badge}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{
            ...T.label(11.5, badgeColor),
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{status}</div>
          <div style={{
            fontSize: 12, color: W.t2, marginTop: 2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{sub}</div>
        </div>
      </div>
    </Card>
  );
}

// ─── outlook banner ─────────────────────────────────────────────────────
function OutlookBanner({ headline, onPress }) {
  return (
    <button onClick={onPress} style={{
      width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left',
      borderRadius: W.radius, padding: '16px 16px',
      background: 'linear-gradient(100deg, #7C6A4C 0%, #4C5766 46%, #2E4A5C 100%)',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <SunIcon/>
      <span style={{
        flex: 1, fontSize: 15.5, fontWeight: 600, color: '#fff', letterSpacing: '-0.01em',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{headline}</span>
      <Chevron size={8} color="rgba(255,255,255,0.8)"/>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ flex: '0 0 auto' }}>
      <circle cx="12" cy="12" r="4" stroke="rgba(255,255,255,0.92)" strokeWidth="1.5"/>
      {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
        <line key={a}
          x1={12 + 7 * Math.cos(a * Math.PI / 180)} y1={12 + 7 * Math.sin(a * Math.PI / 180)}
          x2={12 + 9.5 * Math.cos(a * Math.PI / 180)} y2={12 + 9.5 * Math.sin(a * Math.PI / 180)}
          stroke="rgba(255,255,255,0.92)" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
    </svg>
  );
}

// ─── top bar ────────────────────────────────────────────────────────────
function TopBar({ dateLabel, onPrev, onNext, canNext, streak }) {
  return (
    <div style={{
      padding: 'max(env(safe-area-inset-top), 12px) 16px 0',
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {/* streak — the matching spacer on the right keeps the nav centered */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: W.cardHi, borderRadius: 999, padding: '6px 11px 6px 9px',
        }}>
          <FlameIcon/>
          <span style={{ fontSize: 13, fontWeight: 600, color: W.text, letterSpacing: '-0.01em' }}>
            {streak}
          </span>
        </div>
      </div>

      {/* date nav */}
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 2 }}>
        <NavArrow dir="left" onClick={onPrev} enabled/>
        <div style={{
          background: W.cardHi, borderRadius: 999, padding: '7px 16px',
          ...T.label(11.5, W.text), whiteSpace: 'nowrap',
        }}>{dateLabel}</div>
        <NavArrow dir="right" onClick={onNext} enabled={canNext}/>
      </div>

      <div style={{ flex: 1 }}/>
    </div>
  );
}

function NavArrow({ dir, onClick, enabled }) {
  return (
    <button onClick={enabled ? onClick : undefined} disabled={!enabled}
      aria-label={dir === 'left' ? 'Previous day' : 'Next day'} style={{
      width: 30, height: 30, borderRadius: 999, border: 'none', background: 'transparent',
      cursor: enabled ? 'pointer' : 'default', padding: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: dir === 'left' ? 'scaleX(-1)' : 'none',
      opacity: enabled ? 1 : 0.25,
    }}>
      <Chevron size={9} color={W.t2}/>
    </button>
  );
}

function FlameIcon() {
  return (
    <svg width="13" height="15" viewBox="0 0 14 16" fill="none">
      <path d="M7.6 0.6c.5 2.6-.8 3.6-1.7 4.5C4.4 6.5 2.6 8 2.6 10.3a4.4 4.4 0 0 0 8.8 0c0-2.1-1-3.4-1.9-4.4-.5.9-1 1.3-1.4 1.5.3-2.4-.2-4.7-.5-6.8Z"
        fill="url(#flame)"/>
      <path d="M7 8.6c.9.8 1.5 1.5 1.5 2.5a1.6 1.6 0 0 1-3 0c0-.9.7-1.7 1.5-2.5Z"
        fill="rgba(14,18,22,0.55)"/>
      <defs>
        <linearGradient id="flame" x1="7" y1="1" x2="7" y2="15" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8FD3FF"/><stop offset="1" stopColor="#0093E7"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── meal row ───────────────────────────────────────────────────────────
function MacroInput({ letter, value, onChange }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 3, color: W.t2 }}>
      <span style={{ color: W.t4, fontSize: 10.5, fontWeight: 600 }}>{letter}</span>
      <input
        type="number" min="0" step="0.1" value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 40, padding: '3px 4px',
          background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 6,
          color: W.text, fontFamily: 'inherit',
          fontSize: 11, fontWeight: 600, textAlign: 'center', MozAppearance: 'textfield',
          outline: 'none',
        }}
      />
    </label>
  );
}

// Left tile echoes Whoop's activity chip (solid colored block + big number).
function MealRow({ meal, count, onChange, accent, dense, showSub, editable, onMacroChange, last, stacked }) {
  const active = count > 0;
  const name = (
    <div style={{
      fontSize: 14, fontWeight: 600, color: W.text, letterSpacing: '-0.012em',
      lineHeight: 1.25, overflow: 'hidden',
      display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
    }}>{meal.name}</div>
  );
  const sub = showSub && meal.sub
    ? <div style={{ ...T.label(9.5, W.t3), marginTop: 3 }}>{meal.sub}</div>
    : null;
  const macros = (
    <div style={{
      display: 'flex', gap: 10, marginTop: 5, alignItems: 'center',
      fontSize: 11.5, fontWeight: 500, color: W.t2, letterSpacing: '-0.01em',
    }}>
      {editable ? (
        <>
          <MacroInput letter="P" value={meal.protein} onChange={(v) => onMacroChange('protein', v)}/>
          <MacroInput letter="C" value={meal.carbs}   onChange={(v) => onMacroChange('carbs',   v)}/>
          <MacroInput letter="F" value={meal.fat}     onChange={(v) => onMacroChange('fat',     v)}/>
        </>
      ) : (
        <>
          <span><span style={{ color: W.t4 }}>P</span> {meal.protein}</span>
          <span><span style={{ color: W.t4 }}>C</span> {meal.carbs}</span>
          <span><span style={{ color: W.t4 }}>F</span> {meal.fat}</span>
        </>
      )}
    </div>
  );

  // In a narrow column (tablet 3-up) the side-by-side layout doesn't fit, so
  // the name spans the full width and the kcal chip sits inline with the stepper.
  if (stacked) {
    return (
      <div style={{
        padding: dense ? '10px 0' : '12px 0',
        borderBottom: last ? 'none' : `1px solid ${W.line}`,
      }}>
        {name}
        {sub}
        {macros}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 8, marginTop: 10,
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'baseline', gap: 4,
            padding: '6px 10px', borderRadius: 8,
            background: active ? accent : 'rgba(255,255,255,0.07)',
            transition: 'background 220ms',
          }}>
            <span style={{
              fontSize: 13, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1,
              color: active ? '#04212E' : W.text,
            }}>{meal.cals}</span>
            <span style={{
              fontSize: 8.5, fontWeight: 600, letterSpacing: '0.08em',
              color: active ? 'rgba(4,33,46,0.65)' : W.t3,
            }}>KCAL</span>
          </span>
          <Stepper count={count} onChange={onChange} accent={accent}/>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: dense ? '9px 0' : '11px 0',
      borderBottom: last ? 'none' : `1px solid ${W.line}`,
    }}>
      <div style={{
        flex: '0 0 auto', width: 58, height: 44, borderRadius: 10,
        background: active ? accent : 'rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        transition: 'background 220ms',
      }}>
        <span style={{
          fontSize: 15, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1,
          color: active ? '#04212E' : W.text,
        }}>{meal.cals}</span>
        <span style={{
          fontSize: 8.5, fontWeight: 600, letterSpacing: '0.08em', marginTop: 2,
          color: active ? 'rgba(4,33,46,0.65)' : W.t3,
        }}>KCAL</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {name}
        {sub}
        {macros}
      </div>

      <Stepper count={count} onChange={onChange} accent={accent}/>
    </div>
  );
}

function Stepper({ count, onChange, accent }) {
  const active = count > 0;
  return (
    <div style={{
      flex: '0 0 auto',
      display: 'flex', alignItems: 'center',
      background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: 3,
    }}>
      <button
        onClick={(e) => { e.stopPropagation(); if (count > 0) onChange(count - 1); }}
        disabled={count === 0}
        style={{
          width: 28, height: 28, borderRadius: 999, border: 'none',
          cursor: count ? 'pointer' : 'default', background: 'transparent',
          color: count ? W.t2 : W.t4, fontSize: 17, lineHeight: 1, fontWeight: 500,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
        }}
      >−</button>
      <div style={{
        minWidth: 20, textAlign: 'center', fontSize: 14, fontWeight: 700,
        letterSpacing: '-0.02em', color: active ? W.text : W.t4,
      }}>{count}</div>
      <button
        onClick={(e) => { e.stopPropagation(); onChange(count + 1); }}
        style={{
          width: 28, height: 28, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: active ? accent : 'rgba(255,255,255,0.12)',
          color: active ? '#04212E' : W.text, fontSize: 17, fontWeight: 500,
          lineHeight: 1, padding: 0,
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
  const trendStr = trend == null ? null : (trend > 0 ? '+' : '') + trend.toFixed(1);
  const trendColor = trend == null ? W.neutral : trend < 0 ? W.green : trend > 0 ? W.amber : W.neutral;

  return (
    <Card>
      <CardHead title="Body Weight" right={
        !editing ? (
          <button onClick={() => setEditing(true)} style={{
            border: 'none', background: 'rgba(255,255,255,0.10)', color: W.text,
            borderRadius: 999, padding: '5px 12px', cursor: 'pointer',
            ...T.label(10, W.text),
          }}>{weight == null ? 'Log' : 'Edit'}</button>
        ) : null
      }/>
      {editing ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input autoFocus type="number" step="0.1" value={val}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onSave(parseFloat(val)); setEditing(false); }
              if (e.key === 'Escape') setEditing(false);
            }}
            style={{
              background: 'rgba(255,255,255,0.07)', border: 'none', outline: 'none',
              borderRadius: 10, padding: '8px 12px',
              fontFamily: 'inherit', ...T.num(30), width: 130,
            }}
          />
          <button onClick={() => { onSave(parseFloat(val)); setEditing(false); }} style={{
            border: 'none', background: accent, color: '#04212E', borderRadius: 10,
            padding: '10px 16px', cursor: 'pointer', ...T.label(11, '#04212E'),
          }}>Save</button>
          <button onClick={() => setEditing(false)} style={{
            border: 'none', background: 'transparent', color: W.t3, cursor: 'pointer',
            ...T.label(11, W.t3),
          }}>Cancel</button>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
          <span style={T.num(38)}>{weight ?? '—'}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: W.t3 }}>kg</span>
          {trendStr && weight != null && (
            <span style={{
              marginLeft: 6, fontSize: 12, fontWeight: 700, color: trendColor,
              background: `${trendColor}1F`, padding: '3px 8px', borderRadius: 6,
              letterSpacing: '-0.01em',
            }}>{trendStr}</span>
          )}
        </div>
      )}
    </Card>
  );
}

Object.assign(window, { Ring, RingStat, Chevron, useStoredState, useMediaQuery,
  Card, CardHead, MonitorCard, OutlookBanner,
  TopBar, MealRow, Stepper, WeightCard,
  todayStr, offsetDate, dayName, dayNum, monthShort, allMeals, computeTotals, computeStreak,
  deriveTargets, saveTargets,
  loadLog, saveLog, ensureSeed, ACCENT_OPTIONS, TWEAK_DEFAULTS });
