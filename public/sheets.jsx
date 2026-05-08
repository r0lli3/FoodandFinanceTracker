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

function Dock({ accent, onTargets, onHistory, onProgress, currentDate, onPrev, onNext, atToday }) {
  const Btn = ({ icon, label, onClick, primary }) => (
    <button onClick={onClick} style={{
      flex: 1, padding: '11px 6px', borderRadius: 14,
      border: '1px solid #161616',
      background: primary ? '#fff' : '#0c0c0c',
      color: primary ? '#000' : 'rgba(255,255,255,0.75)',
      cursor: 'pointer', fontFamily: 'Sora, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</span>
    </button>
  );
  return (
    <div style={{
      display: 'flex', gap: 6, padding: '12px 16px 8px',
      background: 'linear-gradient(to top, #000 60%, rgba(0,0,0,0))',
    }}>
      <button onClick={onPrev} style={{
        width: 42, padding: '11px 8px', borderRadius: 14, border: '1px solid #161616',
        background: '#0c0c0c', color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
        fontSize: 16, fontFamily: 'Sora, sans-serif',
      }}>←</button>
      <Btn icon={<DialIcon color={accent}/>} label="Targets" onClick={onTargets}/>
      <Btn icon={<TrendIcon color={accent}/>} label="Progress" onClick={onProgress}/>
      <Btn icon={<ListIcon color="rgba(255,255,255,0.75)"/>} label="History" onClick={onHistory}/>
      <button onClick={onNext} disabled={atToday} style={{
        width: 42, padding: '11px 8px', borderRadius: 14, border: '1px solid #161616',
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
function TrendIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polyline points="2,11 5,8 8,9.5 11,5 14,3"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="14" cy="3" r="1.4" fill={color}/>
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

// ─── PROGRESS SHEET ─────────────────────────────────────────────────────
const PROGRESS_RATE_PER_WEEK = 0.0025;
const PROGRESS_ROLLING_DAYS = 28;
const PROGRESS_ANCHOR_KEY = 'fft_progress_anchor';

function getProgressAnchor() {
  try {
    const raw = localStorage.getItem(PROGRESS_ANCHOR_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (p && p.date && typeof p.kg === 'number') return p;
  } catch (_) {}
  return null;
}
function saveProgressAnchor(a) {
  localStorage.setItem(PROGRESS_ANCHOR_KEY, JSON.stringify(a));
}
function diffDaysISO(a, b) {
  const d1 = new Date(a + 'T00:00:00Z');
  const d2 = new Date(b + 'T00:00:00Z');
  return Math.round((d2 - d1) / 86400000);
}
function rollingAverages(weightsAsc, windowDays) {
  return weightsAsc.map((w, i) => {
    const cutoff = new Date(w.date + 'T00:00:00Z');
    cutoff.setUTCDate(cutoff.getUTCDate() - (windowDays - 1));
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    let sum = 0, n = 0;
    for (let j = i; j >= 0; j--) {
      if (weightsAsc[j].date < cutoffStr) break;
      sum += weightsAsc[j].kg;
      n++;
    }
    return { date: w.date, kg: n > 0 ? sum / n : null };
  });
}

function ProgressSheet({ open, onClose, log, accent }) {
  const [anchor, setAnchor] = useState2(() => getProgressAnchor());

  const weightsAsc = useMemo2(() =>
    Object.keys(log)
      .filter(k => !k.startsWith('_') && log[k]?._kg != null)
      .sort()
      .map(date => ({ date, kg: log[date]._kg })),
    [log]
  );

  useEffect2(() => {
    if (!anchor && weightsAsc.length > 0) {
      const first = { date: weightsAsc[0].date, kg: weightsAsc[0].kg };
      saveProgressAnchor(first);
      setAnchor(first);
    }
  }, [anchor, weightsAsc]);

  const resetToLatest = () => {
    if (!weightsAsc.length) return;
    const latest = weightsAsc[weightsAsc.length - 1];
    const next = { date: latest.date, kg: latest.kg };
    saveProgressAnchor(next);
    setAnchor(next);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Weight Progress" height="80vh">
      {weightsAsc.length === 0 || !anchor ? (
        <div style={{ padding: 32, color: 'rgba(255,255,255,0.4)', fontFamily: 'Sora, sans-serif', fontSize: 13 }}>
          Log a weight to see progress.
        </div>
      ) : (
        <ProgressBody weightsAsc={weightsAsc} anchor={anchor} accent={accent} onResetAnchor={resetToLatest}/>
      )}
    </Sheet>
  );
}

function ProgressBody({ weightsAsc, anchor, accent, onResetAnchor }) {
  const today = todayStr();
  const phaseWeights = weightsAsc.filter(w => w.date >= anchor.date);
  const latest = phaseWeights.length ? phaseWeights[phaseWeights.length - 1] : { date: anchor.date, kg: anchor.kg };
  const rollingAll = rollingAverages(weightsAsc, PROGRESS_ROLLING_DAYS);
  const rollingInPhase = rollingAll.filter(r => r.date >= anchor.date && r.kg != null);

  const idealAt = (dateStr) => {
    const days = diffDaysISO(anchor.date, dateStr);
    if (days < 0) return null;
    return anchor.kg * Math.pow(1 + PROGRESS_RATE_PER_WEEK, days / 7);
  };

  const idealAtLatest = idealAt(latest.date);
  const totalGain = latest.kg - anchor.kg;
  const weeksElapsed = diffDaysISO(anchor.date, latest.date) / 7;
  const actualPctPerWeek = weeksElapsed > 0 ? Math.pow(latest.kg / anchor.kg, 1 / weeksElapsed) - 1 : 0;
  const deltaVsIdeal = latest.kg - idealAtLatest;

  const W = 360, H = 220;
  const padL = 36, padR = 16, padT = 14, padB = 28;
  const innerW = W - padL - padR, innerH = H - padT - padB;

  const xStart = anchor.date;
  const xEnd = today >= latest.date ? today : latest.date;
  const totalDays = Math.max(1, diffDaysISO(xStart, xEnd));
  const xAt = (ds) => padL + (diffDaysISO(xStart, ds) / totalDays) * innerW;

  const idealEndKg = idealAt(xEnd);
  const yVals = [
    ...phaseWeights.map(w => w.kg),
    ...rollingInPhase.map(r => r.kg),
    anchor.kg, idealEndKg,
  ];
  let yMin = Math.min(...yVals);
  let yMax = Math.max(...yVals);
  const range = Math.max(0.5, yMax - yMin);
  yMin -= range * 0.1;
  yMax += range * 0.1;
  const yAt = (kg) => padT + (1 - (kg - yMin) / (yMax - yMin)) * innerH;

  const actualPts = phaseWeights.map(w => `${xAt(w.date).toFixed(1)},${yAt(w.kg).toFixed(1)}`).join(' ');
  const rollingPts = rollingInPhase.map(r => `${xAt(r.date).toFixed(1)},${yAt(r.kg).toFixed(1)}`).join(' ');
  const idealX1 = xAt(anchor.date), idealY1 = yAt(anchor.kg);
  const idealX2 = xAt(xEnd), idealY2 = yAt(idealEndKg);

  const yTicks = [yMax, (yMin + yMax) / 2, yMin];
  const [ay, am, ad] = anchor.date.split('-');
  const trackingColor = Math.abs(deltaVsIdeal) < 0.3 ? 'rgba(255,255,255,0.55)'
    : (deltaVsIdeal < 0 ? '#FFB04A' : '#7CF8C0');

  return (
    <div style={{ padding: '14px 16px 24px' }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
        <ProgressStat label="Latest"  value={latest.kg.toFixed(1)} unit="kg"/>
        <ProgressStat label="Phase Δ" value={`${totalGain >= 0 ? '+' : ''}${totalGain.toFixed(1)}`} unit="kg"
          color={totalGain >= 0 ? '#7CF8C0' : '#FF6B4A'}/>
        <ProgressStat label="Rate/wk" value={(actualPctPerWeek * 100).toFixed(2)} unit="%"/>
      </div>

      {/* Chart */}
      <div style={{ background: '#0a0a0a', border: '1px solid #161616', borderRadius: 14, padding: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
             style={{ width: '100%', height: 220, display: 'block' }}>
          <line x1={padL} y1={padT} x2={padL} y2={H - padB} stroke="#1d1d1d" strokeWidth="1"/>
          <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="#1d1d1d" strokeWidth="1"/>
          <line x1={padL} y1={padT + innerH/2} x2={W - padR} y2={padT + innerH/2}
                stroke="#141414" strokeWidth="1" strokeDasharray="2,4"/>
          <text x={padL - 6} y={padT + 4} fill="rgba(255,255,255,0.35)" fontSize="9"
                fontFamily="JetBrains Mono, monospace" textAnchor="end">{yTicks[0].toFixed(1)}</text>
          <text x={padL - 6} y={padT + innerH/2 + 3} fill="rgba(255,255,255,0.35)" fontSize="9"
                fontFamily="JetBrains Mono, monospace" textAnchor="end">{yTicks[1].toFixed(1)}</text>
          <text x={padL - 6} y={H - padB + 3} fill="rgba(255,255,255,0.35)" fontSize="9"
                fontFamily="JetBrains Mono, monospace" textAnchor="end">{yTicks[2].toFixed(1)}</text>
          <text x={padL} y={H - padB + 16} fill="rgba(255,255,255,0.35)" fontSize="9"
                fontFamily="JetBrains Mono, monospace" textAnchor="start">{xStart.slice(5)}</text>
          <text x={W - padR} y={H - padB + 16} fill="rgba(255,255,255,0.35)" fontSize="9"
                fontFamily="JetBrains Mono, monospace" textAnchor="end">{xEnd.slice(5)}</text>
          <line x1={idealX1.toFixed(1)} y1={idealY1.toFixed(1)}
                x2={idealX2.toFixed(1)} y2={idealY2.toFixed(1)}
                stroke="#7AB7FF" strokeWidth="1.5" strokeDasharray="4,3"/>
          {actualPts  && <polyline points={actualPts}  fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1"/>}
          {rollingPts && <polyline points={rollingPts} fill="none" stroke={accent} strokeWidth="2"/>}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap',
        fontFamily: 'Sora, sans-serif', fontSize: 9.5, color: 'rgba(255,255,255,0.55)',
        letterSpacing: '0.12em', textTransform: 'uppercase',
      }}>
        <ProgressLegend swatch="rgba(255,255,255,0.35)" label="Daily"/>
        <ProgressLegend swatch={accent}                  label="4-wk Avg"/>
        <ProgressLegend swatch="#7AB7FF"                 label="Ideal +0.25%/wk" dashed/>
      </div>

      {/* Phase info */}
      <div style={{
        marginTop: 14, padding: '10px 12px', borderRadius: 12,
        background: '#0a0a0a', border: '1px solid #161616',
        fontFamily: 'Sora, sans-serif', fontSize: 11.5, color: 'rgba(255,255,255,0.65)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
      }}>
        <span>Phase from <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>{ad}/{am}/{ay}</span> @ <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#fff' }}>{anchor.kg.toFixed(1)}kg</span></span>
        <span style={{ whiteSpace: 'nowrap' }}>vs ideal:&nbsp;
          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: trackingColor, fontWeight: 600 }}>
            {deltaVsIdeal >= 0 ? '+' : ''}{deltaVsIdeal.toFixed(2)}kg
          </span>
        </span>
      </div>

      {/* Reset */}
      <button onClick={onResetAnchor} style={{
        marginTop: 12, width: '100%', padding: '11px',
        borderRadius: 12, border: '1px dashed #2a2a2a', background: '#0a0a0a',
        color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
        fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
      }}>Set new phase from latest</button>
    </div>
  );
}

function ProgressStat({ label, value, unit, color }) {
  return (
    <div style={{
      background: '#0c0c0c', border: '1px solid #161616', borderRadius: 12,
      padding: '10px 8px', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'Sora, sans-serif', fontSize: 9, fontWeight: 700,
        color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em', textTransform: 'uppercase',
      }}>{label}</div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600,
        color: color || '#fff', letterSpacing: '-0.04em', marginTop: 4,
      }}>
        {value}
        {unit && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  );
}

function ProgressLegend({ swatch, label, dashed }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        display: 'inline-block', width: 16, height: 0,
        borderTop: dashed ? `2px dashed ${swatch}` : `2px solid ${swatch}`,
      }}/>
      {label}
    </span>
  );
}

Object.assign(window, { Sheet, SectionHeader, Dock, HistorySheet, TargetsSheet, ProgressSheet, TARGET_BANDS });
