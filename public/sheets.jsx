// Sheet overlays (history, targets), section header, dock
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2 } = React;

function Sheet({ open, onClose, title, children, height = '78vh' }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100,
      pointerEvents: open ? 'auto' : 'none',
      background: open ? 'rgba(0,0,0,0.55)' : 'rgba(0,0,0,0)',
      transition: 'background 240ms',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', background: '#070707', color: '#fff',
        borderRadius: '24px 24px 0 0',
        borderTop: '1px solid #1a1a1a',
        height,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 320ms cubic-bezier(0.2,0.8,0.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 4, background: '#222' }}/>
        </div>
        <div style={{
          padding: '8px 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid #111',
        }}>
          <div style={{ fontFamily: 'Sora, sans-serif', fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>{title}</div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 999, border: '1px solid #1c1c1c', background: '#0d0d0d',
            color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14, lineHeight: 1,
          }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, count, accent }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
      padding: '0 20px 8px', marginTop: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{
          fontFamily: 'Sora, sans-serif', fontSize: 10, fontWeight: 700,
          color: 'rgba(255,255,255,0.55)', letterSpacing: '0.22em', textTransform: 'uppercase',
        }}>{title}</span>
        {count > 0 && (
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 600,
            color: accent, letterSpacing: '-0.02em',
          }}>· {count} logged</span>
        )}
      </div>
    </div>
  );
}

function Dock({ accent, onTargets, onHistory, currentDate, onPrev, onNext, atToday }) {
  const Btn = ({ icon, label, onClick, primary }) => (
    <button onClick={onClick} style={{
      flex: 1, padding: '11px 8px', borderRadius: 14,
      border: '1px solid #161616',
      background: primary ? '#fff' : '#0c0c0c',
      color: primary ? '#000' : 'rgba(255,255,255,0.75)',
      cursor: 'pointer', fontFamily: 'Sora, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase' }}>{label}</span>
    </button>
  );
  return (
    <div style={{
      display: 'flex', gap: 8, padding: '12px 16px 8px',
      background: 'linear-gradient(to top, #000 60%, rgba(0,0,0,0))',
    }}>
      <button onClick={onPrev} style={{
        width: 46, padding: '11px 8px', borderRadius: 14, border: '1px solid #161616',
        background: '#0c0c0c', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
        fontSize: 16, fontFamily: 'Sora, sans-serif',
      }}>←</button>
      <Btn icon={<DialIcon color={accent}/>} label="Targets" onClick={onTargets}/>
      <Btn icon={<ListIcon color="rgba(255,255,255,0.75)"/>} label="History" onClick={onHistory}/>
      <button onClick={onNext} disabled={atToday} style={{
        width: 46, padding: '11px 8px', borderRadius: 14, border: '1px solid #161616',
        background: '#0c0c0c', color: atToday ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)',
        cursor: atToday ? 'default' : 'pointer',
        fontSize: 16, fontFamily: 'Sora, sans-serif',
      }}>→</button>
    </div>
  );
}

function DialIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.25" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5"/>
      <path d="M8 1.75 A6.25 6.25 0 0 1 13.4 11" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <circle cx="8" cy="8" r="1.4" fill={color}/>
    </svg>
  );
}
function ListIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3.25" width="12" height="1.5" rx="0.75" fill={color}/>
      <rect x="2" y="7.25" width="9" height="1.5" rx="0.75" fill={color}/>
      <rect x="2" y="11.25" width="11" height="1.5" rx="0.75" fill={color}/>
    </svg>
  );
}

// ─── HISTORY SHEET ──────────────────────────────────────────────────────
function HistorySheet({ open, onClose, log, accent, onJump }) {
  const dates = Object.keys(log).filter(k => !k.startsWith('_')).sort((a,b) => b.localeCompare(a));
  const today = todayStr();

  return (
    <Sheet open={open} onClose={onClose} title="History" height="78vh">
      {dates.length === 0 ? (
        <div style={{ padding: 32, color: 'rgba(255,255,255,0.4)', fontFamily: 'Sora, sans-serif', fontSize: 13 }}>
          No history yet.
        </div>
      ) : (
        <div style={{ padding: '12px 16px 24px' }}>
          {dates.map((d) => {
            const totals = computeTotals(log[d]);
            const kg = log[d]._kg;
            const hasFood = totals.cals > 0;
            const calsPct = Math.min(1, totals.cals / TARGETS.cals);
            return (
              <div key={d} onClick={() => { onJump(d); onClose(); }} style={{
                padding: '14px 14px', borderRadius: 14, background: '#0c0c0c',
                border: '1px solid #161616', marginBottom: 8, cursor: 'pointer',
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
              }}>
                <div style={{
                  width: 44, textAlign: 'center',
                }}>
                  <div style={{
                    fontFamily: 'Sora, sans-serif', fontSize: 9, fontWeight: 600,
                    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.14em', textTransform: 'uppercase',
                  }}>{dayName(d)}</div>
                  <div style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 600,
                    color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.05,
                  }}>{dayNum(d)}</div>
                  <div style={{
                    fontFamily: 'Sora, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.3)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                  }}>{monthShort(d)}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  {hasFood ? (
                    <>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600,
                        color: '#fff', letterSpacing: '-0.03em',
                      }}>
                        {Math.round(totals.cals)}<span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 4 }}>kcal</span>
                      </div>
                      <div style={{
                        display: 'flex', gap: 9, marginTop: 4,
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(255,255,255,0.5)',
                      }}>
                        <span>P {Math.round(totals.protein)}g</span>
                        <span>C {Math.round(totals.carbs)}g</span>
                        <span>F {Math.round(totals.fat)}g</span>
                      </div>
                      <div style={{
                        marginTop: 7, height: 3, borderRadius: 2, background: '#181818', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${calsPct*100}%`, background: accent,
                        }}/>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontFamily: 'Sora, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                      No meals logged
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {kg != null && (
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 600,
                      color: 'rgba(255,255,255,0.85)', letterSpacing: '-0.02em',
                    }}>{kg}<span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>kg</span></div>
                  )}
                  {d === today && (
                    <div style={{
                      fontFamily: 'Sora, sans-serif', fontSize: 8.5, fontWeight: 700,
                      color: accent, letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4,
                    }}>Today</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}

// ─── TARGETS SHEET ──────────────────────────────────────────────────────
const TARGET_BANDS = [
  { mult: 18, cat: 'Aggressive Gain',  cls: '#7CF8C0' },
  { mult: 17, cat: 'Lean Bulk',        cls: '#7CF8C0' },
  { mult: 16, cat: 'Lean Bulk',        cls: '#7CF8C0' },
  { mult: 15, cat: 'Maintenance',      cls: '#D6FF3D' },
  { mult: 14, cat: 'Maintenance',      cls: '#D6FF3D' },
  { mult: 13, cat: 'Recomp',           cls: '#D6FF3D' },
  { mult: 12, cat: 'Moderate Cut',     cls: '#FFB04A' },
  { mult: 11, cat: 'Moderate Cut',     cls: '#FFB04A' },
  { mult: 10, cat: 'Aggressive Cut',   cls: '#FF6B4A' },
];

function TargetsSheet({ open, onClose, weightKg, accent }) {
  const lbs = weightKg ? weightKg * 2.20462 : null;
  return (
    <Sheet open={open} onClose={onClose} title="Calorie Targets" height="74vh">
      {!weightKg ? (
        <div style={{ padding: 32, color: 'rgba(255,255,255,0.4)', fontFamily: 'Sora, sans-serif', fontSize: 13 }}>
          Log your weight to see calorie targets.
        </div>
      ) : (
        <div style={{ padding: '14px 16px 20px' }}>
          <div style={{
            padding: '12px 14px', borderRadius: 12, background: '#0c0c0c', border: '1px solid #161616',
            marginBottom: 14, display: 'flex', alignItems: 'baseline', gap: 8,
          }}>
            <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 10.5, color: 'rgba(255,255,255,0.55)',
              textTransform: 'uppercase', letterSpacing: '0.16em' }}>Based on</span>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 15, fontWeight: 600, color: '#fff',
              letterSpacing: '-0.03em',
            }}>{weightKg} kg</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
              · {lbs.toFixed(1)} lb
            </span>
          </div>
          {TARGET_BANDS.map(b => {
            const cals = Math.round(lbs * b.mult);
            return (
              <div key={b.mult} style={{
                display: 'grid', gridTemplateColumns: '36px 1fr auto', gap: 12, alignItems: 'center',
                padding: '10px 14px', borderRadius: 12, marginBottom: 6,
                background: '#0a0a0a', border: '1px solid #161616',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 8, bottom: 8, width: 3,
                  borderRadius: 2, background: b.cls,
                }}/>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600,
                  color: '#fff', letterSpacing: '-0.04em', textAlign: 'center',
                }}>×{b.mult}</div>
                <div style={{
                  fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 600,
                  color: 'rgba(255,255,255,0.7)', letterSpacing: '0.1em', textTransform: 'uppercase',
                }}>{b.cat}</div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 600,
                  color: '#fff', letterSpacing: '-0.03em',
                }}>{cals.toLocaleString()}<span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginLeft: 3 }}>kcal</span></div>
              </div>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}

Object.assign(window, { Sheet, SectionHeader, Dock, HistorySheet, TargetsSheet, TARGET_BANDS });
