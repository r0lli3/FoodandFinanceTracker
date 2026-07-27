// Sheet overlays (history, targets, progress) + bottom nav
const { useState: useState2, useEffect: useEffect2, useMemo: useMemo2 } = React;

function Sheet({ open, onClose, title, children, height = '82vh' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      pointerEvents: open ? 'auto' : 'none',
      background: open ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
      backdropFilter: open ? 'blur(2px)' : 'none',
      transition: 'background 240ms',
      display: 'flex', alignItems: 'flex-end',
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%', color: W.text,
        background: `linear-gradient(180deg, ${W.bgTop} 0%, ${W.bg} 26%)`,
        borderRadius: '26px 26px 0 0',
        height,
        transform: open ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 340ms cubic-bezier(0.2,0.8,0.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 2px' }}>
          <div style={{ width: 38, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.18)' }}/>
        </div>
        <div style={{
          padding: '10px 20px 14px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={T.label(13, W.text)}>{title}</div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 999, border: 'none',
            background: 'rgba(255,255,255,0.10)',
            color: W.t2, cursor: 'pointer', fontSize: 15, lineHeight: 1, padding: 0,
          }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── bottom nav ─────────────────────────────────────────────────────────
function Dock({ accent, onTargets, onHistory, onProgress, onToday, isToday }) {
  const Btn = ({ icon, label, onClick, active }) => (
    <button onClick={onClick} style={{
      flex: 1, padding: '7px 4px 6px', borderRadius: 14, border: 'none',
      background: 'transparent', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    }}>
      {icon(active ? W.text : 'rgba(255,255,255,0.55)')}
      <span style={{
        fontSize: 10, fontWeight: 600, letterSpacing: '0.01em',
        color: active ? W.text : 'rgba(255,255,255,0.55)',
      }}>{label}</span>
    </button>
  );
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '22px 12px calc(10px + env(safe-area-inset-bottom))',
      background: `linear-gradient(to top, ${W.bg} 42%, rgba(14,18,22,0))`,
      pointerEvents: 'none',
    }}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', pointerEvents: 'auto',
        background: 'rgba(30,37,45,0.88)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRadius: 999, padding: '4px 6px',
      }}>
        <Btn icon={HomeIcon}   label="Home"     onClick={onToday} active/>
        <Btn icon={TrendIcon}  label="Progress" onClick={onProgress}/>
        <Btn icon={DialIcon}   label="Targets"  onClick={onTargets}/>
        <Btn icon={ListIcon}   label="History"  onClick={onHistory}/>
      </div>
      <button onClick={onToday} aria-label="Jump to today" style={{
        flex: '0 0 auto', width: 50, height: 50, borderRadius: 999, cursor: 'pointer',
        pointerEvents: 'auto',
        border: `1.5px solid ${isToday ? 'rgba(255,255,255,0.14)' : accent}`,
        background: 'radial-gradient(circle at 30% 20%, #2A3B57 0%, #17202C 70%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
          color: isToday ? W.t2 : accent,
        }}>NOW</span>
      </button>
    </div>
  );
}

function HomeIcon(color) {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <path d="M3 8.4 10 3l7 5.4V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8.4Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
      <path d="M6.4 12.4 8.6 10.2l2 1.6 3-3.4" stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function DialIcon(color) {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7.2" stroke={color} strokeWidth="1.6"/>
      <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="1.6"/>
      <circle cx="10" cy="10" r="1" fill={color}/>
    </svg>
  );
}
function ListIcon(color) {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4.6" width="14" height="1.7" rx="0.85" fill={color}/>
      <rect x="3" y="9.15" width="10" height="1.7" rx="0.85" fill={color}/>
      <rect x="3" y="13.7" width="12.5" height="1.7" rx="0.85" fill={color}/>
    </svg>
  );
}
function TrendIcon(color) {
  return (
    <svg width="19" height="19" viewBox="0 0 20 20" fill="none">
      <polyline points="3,14 7,9.5 10.5,11.5 17,4"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="12.6,4 17,4 17,8.4"
        stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

// ─── HISTORY SHEET ──────────────────────────────────────────────────────
function HistorySheet({ open, onClose, log, accent, onJump }) {
  const dates = Object.keys(log).filter(k => !k.startsWith('_')).sort((a,b) => b.localeCompare(a));
  const today = todayStr();

  return (
    <Sheet open={open} onClose={onClose} title="History">
      {dates.length === 0 ? (
        <div style={{ padding: 32, color: W.t3, fontSize: 13 }}>No history yet.</div>
      ) : (
        <div style={{ padding: '4px 16px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dates.map((d) => {
            const totals = computeTotals(log[d]);
            const kg = log[d]._kg;
            const hasFood = totals.cals > 0;
            const calsPct = Math.min(1, totals.cals / TARGETS.cals);
            return (
              <Card key={d} pad={14} onClick={() => { onJump(d); onClose(); }} style={{
                display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 14, alignItems: 'center',
              }}>
                <div style={{ width: 42, textAlign: 'center' }}>
                  <div style={T.label(9, W.t3)}>{dayName(d)}</div>
                  <div style={{ ...T.num(22), marginTop: 2 }}>{dayNum(d)}</div>
                  <div style={{ ...T.label(9, W.t4), marginTop: 3 }}>{monthShort(d)}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  {hasFood ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={T.num(18)}>{Math.round(totals.cals)}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: W.t3 }}>KCAL</span>
                      </div>
                      <div style={{
                        display: 'flex', gap: 10, marginTop: 4,
                        fontSize: 11, fontWeight: 500, color: W.t2,
                      }}>
                        <span><span style={{ color: W.t4 }}>P</span> {Math.round(totals.protein)}</span>
                        <span><span style={{ color: W.t4 }}>C</span> {Math.round(totals.carbs)}</span>
                        <span><span style={{ color: W.t4 }}>F</span> {Math.round(totals.fat)}</span>
                      </div>
                      <div style={{
                        marginTop: 8, height: 3, borderRadius: 2,
                        background: 'rgba(255,255,255,0.10)', overflow: 'hidden',
                      }}>
                        <div style={{ height: '100%', width: `${calsPct*100}%`, background: accent }}/>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: 12.5, color: W.t3 }}>No meals logged</div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  {kg != null && (
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, justifyContent: 'flex-end' }}>
                      <span style={T.num(14)}>{kg}</span>
                      <span style={{ fontSize: 9.5, fontWeight: 600, color: W.t3 }}>KG</span>
                    </div>
                  )}
                  {d === today && (
                    <div style={{ ...T.label(8.5, accent), marginTop: 5 }}>Today</div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Sheet>
  );
}

// ─── TARGETS SHEET ──────────────────────────────────────────────────────
const TARGET_BANDS = [
  { mult: 18, cat: 'Aggressive Gain',  cls: '#16EC06' },
  { mult: 17, cat: 'Lean Bulk',        cls: '#16EC06' },
  { mult: 16, cat: 'Lean Bulk',        cls: '#16EC06' },
  { mult: 15, cat: 'Maintenance',      cls: '#FFDE00' },
  { mult: 14, cat: 'Maintenance',      cls: '#FFDE00' },
  { mult: 13, cat: 'Recomp',           cls: '#FFDE00' },
  { mult: 12, cat: 'Moderate Cut',     cls: '#FF8A3D' },
  { mult: 11, cat: 'Moderate Cut',     cls: '#FF8A3D' },
  { mult: 10, cat: 'Aggressive Cut',   cls: '#FF0026' },
];

function TargetsSheet({ open, onClose, weightKg, accent }) {
  const lbs = weightKg ? weightKg * 2.20462 : null;
  return (
    <Sheet open={open} onClose={onClose} title="Calorie Targets" height="80vh">
      {!weightKg ? (
        <div style={{ padding: 32, color: W.t3, fontSize: 13 }}>
          Log your weight to see calorie targets.
        </div>
      ) : (
        <div style={{ padding: '4px 16px 28px' }}>
          <Card pad={14} style={{
            marginBottom: 12, display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
          }}>
            <span style={T.label(10.5, W.t2)}>Based on</span>
            <span style={T.num(17)}>{weightKg} kg</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: W.t3 }}>· {lbs.toFixed(1)} lb</span>
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {TARGET_BANDS.map(b => {
              const cals = Math.round(lbs * b.mult);
              return (
                <div key={b.mult} style={{
                  display: 'grid', gridTemplateColumns: '4px 40px 1fr auto', gap: 12,
                  alignItems: 'center', padding: '11px 14px 11px 10px',
                  borderRadius: W.radiusSm, background: W.card,
                }}>
                  <span style={{
                    width: 4, height: 26, borderRadius: 2, background: b.cls, display: 'block',
                  }}/>
                  <span style={{ ...T.num(17), textAlign: 'center' }}>×{b.mult}</span>
                  <span style={T.label(10.5, W.t2)}>{b.cat}</span>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                    <span style={T.num(16)}>{cals.toLocaleString()}</span>
                    <span style={{ fontSize: 9.5, fontWeight: 600, color: W.t3 }}>KCAL</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ─── PROGRESS SHEET ─────────────────────────────────────────────────────
const PROGRESS_GOALS = [
  { id: 'aggressive_cut', label: 'Aggressive cut', rate: -0.010,  blurb: '−1.0%/wk' },
  { id: 'cut',            label: 'Cut',            rate: -0.005,  blurb: '−0.5%/wk' },
  { id: 'recomp',         label: 'Recomp',         rate:  0,      blurb: '0%/wk'    },
  { id: 'lean_bulk',      label: 'Lean bulk',      rate:  0.0025, blurb: '+0.25%/wk'},
  { id: 'bulk',           label: 'Bulk',           rate:  0.005,  blurb: '+0.5%/wk' },
  { id: 'novice_bulk',    label: 'Novice bulk',    rate:  0.0075, blurb: '+0.75%/wk'},
];
const PROGRESS_DEFAULT_GOAL = 'lean_bulk';
const PROGRESS_ROLLING_DAYS = 28;
const PROGRESS_FORECAST_DAYS = 28;
const PROGRESS_ANCHOR_KEY = 'fft_progress_anchor';   // legacy, single-phase
const PROGRESS_PHASES_KEY = 'fft_progress_phases';   // current, ordered list

function getGoal(id) {
  return PROGRESS_GOALS.find(g => g.id === id)
      || PROGRESS_GOALS.find(g => g.id === PROGRESS_DEFAULT_GOAL);
}

function getProgressPhases() {
  try {
    const raw = localStorage.getItem(PROGRESS_PHASES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return arr
          .filter(p => p && p.date && typeof p.kg === 'number')
          .map(p => ({ goal: PROGRESS_DEFAULT_GOAL, ...p }))
          .sort((a, b) => a.date.localeCompare(b.date));
      }
    }
  } catch (_) {}
  try {
    const raw = localStorage.getItem(PROGRESS_ANCHOR_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p && p.date && typeof p.kg === 'number') {
        const migrated = [{ date: p.date, kg: p.kg, goal: p.goal || PROGRESS_DEFAULT_GOAL }];
        saveProgressPhases(migrated);
        return migrated;
      }
    }
  } catch (_) {}
  return [];
}
function saveProgressPhases(phases) {
  localStorage.setItem(PROGRESS_PHASES_KEY, JSON.stringify(phases));
}
function diffDaysISO(a, b) {
  const d1 = new Date(a + 'T00:00:00Z');
  const d2 = new Date(b + 'T00:00:00Z');
  return Math.round((d2 - d1) / 86400000);
}
function addDaysISO(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
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
  const [phases, setPhases] = useState2(() => getProgressPhases());
  const [selectedIdx, setSelectedIdx] = useState2(() => Math.max(0, getProgressPhases().length - 1));

  const weightsAsc = useMemo2(() =>
    Object.keys(log)
      .filter(k => !k.startsWith('_') && log[k]?._kg != null)
      .sort()
      .map(date => ({ date, kg: log[date]._kg })),
    [log]
  );

  useEffect2(() => {
    if (phases.length === 0 && weightsAsc.length > 0) {
      const first = { date: weightsAsc[0].date, kg: weightsAsc[0].kg, goal: PROGRESS_DEFAULT_GOAL };
      const next = [first];
      saveProgressPhases(next);
      setPhases(next);
      setSelectedIdx(0);
    }
  }, [phases.length, weightsAsc]);

  const persist = (nextPhases, nextIdx) => {
    saveProgressPhases(nextPhases);
    setPhases(nextPhases);
    if (typeof nextIdx === 'number') setSelectedIdx(Math.max(0, Math.min(nextIdx, nextPhases.length - 1)));
  };

  const newPhaseFromLatest = () => {
    if (!weightsAsc.length) return;
    const latest = weightsAsc[weightsAsc.length - 1];
    const currentGoal = phases[phases.length - 1]?.goal || PROGRESS_DEFAULT_GOAL;
    // guard: don't create a duplicate phase starting on the same date as the existing last one
    if (phases.length && phases[phases.length - 1].date === latest.date) {
      const next = phases.slice(0, -1).concat([{ date: latest.date, kg: latest.kg, goal: currentGoal }]);
      persist(next, next.length - 1);
      return;
    }
    const next = phases.concat([{ date: latest.date, kg: latest.kg, goal: currentGoal }]);
    persist(next, next.length - 1);
  };

  const setGoal = (goalId) => {
    if (!phases[selectedIdx]) return;
    const next = phases.map((p, i) => i === selectedIdx ? { ...p, goal: goalId } : p);
    persist(next, selectedIdx);
  };

  const deleteSelectedPhase = () => {
    if (phases.length <= 1) return;
    const next = phases.filter((_, i) => i !== selectedIdx);
    persist(next, Math.min(selectedIdx, next.length - 1));
  };

  return (
    <Sheet open={open} onClose={onClose} title="Weight Progress" height="86vh">
      {weightsAsc.length === 0 || phases.length === 0 ? (
        <div style={{ padding: 32, color: W.t3, fontSize: 13 }}>Log a weight to see progress.</div>
      ) : (
        <ProgressBody
          weightsAsc={weightsAsc}
          phases={phases}
          selectedIdx={Math.min(selectedIdx, phases.length - 1)}
          onSelectIdx={setSelectedIdx}
          accent={accent}
          onNewPhase={newPhaseFromLatest}
          onSetGoal={setGoal}
          onDeletePhase={deleteSelectedPhase}
        />
      )}
    </Sheet>
  );
}

function ProgressBody({ weightsAsc, phases, selectedIdx, onSelectIdx, accent, onNewPhase, onSetGoal, onDeletePhase }) {
  const [pickingGoal, setPickingGoal] = useState2(false);
  const [confirmingNew, setConfirmingNew] = useState2(false);
  const [confirmingDelete, setConfirmingDelete] = useState2(false);
  useEffect2(() => { setConfirmingNew(false); setConfirmingDelete(false); setPickingGoal(false); }, [selectedIdx]);

  const today = todayStr();
  const phase = phases[selectedIdx];
  const nextPhase = phases[selectedIdx + 1] || null;
  const isCurrent = selectedIdx === phases.length - 1;
  const goal = getGoal(phase.goal);
  const ratePerWeek = goal.rate;
  const isCut = ratePerWeek < 0;

  const phaseEndDate = isCurrent
    ? today
    : addDaysISO(nextPhase.date, -1);
  const phaseWeights = weightsAsc.filter(w => w.date >= phase.date && w.date <= phaseEndDate);
  const latest = phaseWeights.length ? phaseWeights[phaseWeights.length - 1] : { date: phase.date, kg: phase.kg };
  const rollingAll = rollingAverages(weightsAsc, PROGRESS_ROLLING_DAYS);
  const rollingInPhase = rollingAll.filter(r => r.date >= phase.date && r.date <= phaseEndDate && r.kg != null);

  const idealAt = (dateStr) => {
    const days = diffDaysISO(phase.date, dateStr);
    if (days < 0) return null;
    if (ratePerWeek === 0) return phase.kg;
    return phase.kg * Math.pow(1 + ratePerWeek, days / 7);
  };

  const idealAtLatest = idealAt(latest.date);
  const totalGain = latest.kg - phase.kg;
  const weeksElapsed = diffDaysISO(phase.date, latest.date) / 7;
  const actualPctPerWeek = weeksElapsed > 0 ? Math.pow(latest.kg / phase.kg, 1 / weeksElapsed) - 1 : 0;
  const deltaVsIdeal = latest.kg - idealAtLatest;

  const CW = 360, CH = 220;
  const padL = 36, padR = 16, padT = 14, padB = 28;
  const innerW = CW - padL - padR, innerH = CH - padT - padB;

  const xStart = phase.date;
  const nowDate = isCurrent
    ? (today >= latest.date ? today : latest.date)
    : phaseEndDate;
  const xEnd = isCurrent
    ? addDaysISO(nowDate, PROGRESS_FORECAST_DAYS)
    : phaseEndDate;
  const totalDays = Math.max(1, diffDaysISO(xStart, xEnd));
  const xAt = (ds) => padL + (diffDaysISO(xStart, ds) / totalDays) * innerW;

  const idealEndKg = idealAt(xEnd);
  const yVals = [
    ...phaseWeights.map(w => w.kg),
    ...rollingInPhase.map(r => r.kg),
    phase.kg, idealEndKg,
  ];
  let yMin = Math.min(...yVals);
  let yMax = Math.max(...yVals);
  const range = Math.max(0.5, yMax - yMin);
  yMin -= range * 0.1;
  yMax += range * 0.1;
  const yAt = (kg) => padT + (1 - (kg - yMin) / (yMax - yMin)) * innerH;

  const actualPts = phaseWeights.map(w => `${xAt(w.date).toFixed(1)},${yAt(w.kg).toFixed(1)}`).join(' ');
  const rollingPts = rollingInPhase.map(r => `${xAt(r.date).toFixed(1)},${yAt(r.kg).toFixed(1)}`).join(' ');
  const idealX1 = xAt(phase.date), idealY1 = yAt(phase.kg);
  const idealX2 = xAt(xEnd), idealY2 = yAt(idealEndKg);
  const nowX = xAt(nowDate);
  const forecastKg = idealEndKg;

  const yTicks = [yMax, (yMin + yMax) / 2, yMin];
  const [ay, am, ad] = phase.date.split('-');
  const onTrackDelta = isCut ? -deltaVsIdeal : deltaVsIdeal;
  const trackingColor = Math.abs(deltaVsIdeal) < 0.3 ? W.t2
    : (onTrackDelta >= 0 ? W.green : W.yellow);
  const phaseDeltaColor = ratePerWeek === 0
    ? (Math.abs(totalGain) < 0.5 ? W.green : W.yellow)
    : ((isCut ? totalGain <= 0 : totalGain >= 0) ? W.green : W.red);

  const phaseLabel = isCurrent ? 'Current' : `Phase ${selectedIdx + 1}/${phases.length}`;
  const phaseRangeLabel = isCurrent
    ? `from ${ad}/${am}/${ay}`
    : `${ad}/${am}/${ay} → ${phaseEndDate.split('-').reverse().join('/')}`;

  const ghostBtn = (on, onColor) => ({
    padding: '12px', borderRadius: W.radiusSm, cursor: 'pointer', border: 'none',
    background: on ? `${onColor}1F` : 'rgba(255,255,255,0.06)',
    color: on ? onColor : W.t2,
    ...T.label(10.5, on ? onColor : W.t2),
  });

  return (
    <div style={{ padding: '4px 16px 28px' }}>
      {/* Phase navigator */}
      <div style={{
        display: 'grid', gridTemplateColumns: '36px 1fr 36px', alignItems: 'center', gap: 8,
        marginBottom: 12, padding: '10px', borderRadius: W.radiusSm, background: W.card,
      }}>
        <button onClick={() => onSelectIdx(selectedIdx - 1)} disabled={selectedIdx === 0}
          aria-label="Previous phase" style={{
            width: 36, height: 32, borderRadius: 8, border: 'none',
            cursor: selectedIdx === 0 ? 'default' : 'pointer',
            background: 'rgba(255,255,255,0.06)',
            color: selectedIdx === 0 ? W.t4 : W.t2, fontSize: 14, padding: 0,
          }}>←</button>
        <div style={{ textAlign: 'center', lineHeight: 1.3 }}>
          <div style={T.label(10, isCurrent ? accent : W.t2)}>{phaseLabel} · {goal.label}</div>
          <div style={{ fontSize: 11.5, fontWeight: 500, color: W.t2, marginTop: 3 }}>{phaseRangeLabel}</div>
        </div>
        <button onClick={() => onSelectIdx(selectedIdx + 1)} disabled={isCurrent}
          aria-label="Next phase" style={{
            width: 36, height: 32, borderRadius: 8, border: 'none',
            cursor: isCurrent ? 'default' : 'pointer',
            background: 'rgba(255,255,255,0.06)',
            color: isCurrent ? W.t4 : W.t2, fontSize: 14, padding: 0,
          }}>→</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        <ProgressStat label="Latest"  value={latest.kg.toFixed(1)} unit="kg"/>
        <ProgressStat label="Phase Δ" value={`${totalGain >= 0 ? '+' : ''}${totalGain.toFixed(1)}`} unit="kg"
          color={phaseDeltaColor}/>
        <ProgressStat label="Rate/wk" value={(actualPctPerWeek * 100).toFixed(2)} unit="%"/>
      </div>

      {/* Chart */}
      <div style={{ background: W.card, borderRadius: W.radius, padding: 10 }}>
        <svg viewBox={`0 0 ${CW} ${CH}`} preserveAspectRatio="none"
             style={{ width: '100%', height: 220, display: 'block' }}>
          <line x1={padL} y1={padT} x2={padL} y2={CH - padB} stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
          <line x1={padL} y1={CH - padB} x2={CW - padR} y2={CH - padB} stroke="rgba(255,255,255,0.10)" strokeWidth="1"/>
          <line x1={padL} y1={padT + innerH/2} x2={CW - padR} y2={padT + innerH/2}
                stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="2,4"/>
          <text x={padL - 6} y={padT + 4} fill={W.t3} fontSize="9" textAnchor="end">{yTicks[0].toFixed(1)}</text>
          <text x={padL - 6} y={padT + innerH/2 + 3} fill={W.t3} fontSize="9" textAnchor="end">{yTicks[1].toFixed(1)}</text>
          <text x={padL - 6} y={CH - padB + 3} fill={W.t3} fontSize="9" textAnchor="end">{yTicks[2].toFixed(1)}</text>
          <text x={padL} y={CH - padB + 16} fill={W.t3} fontSize="9" textAnchor="start">{xStart.slice(5)}</text>
          <text x={CW - padR} y={CH - padB + 16} fill={W.t3} fontSize="9" textAnchor="end">{xEnd.slice(5)}</text>
          <line x1={idealX1.toFixed(1)} y1={idealY1.toFixed(1)}
                x2={idealX2.toFixed(1)} y2={idealY2.toFixed(1)}
                stroke={W.sleep} strokeWidth="1.5" strokeDasharray="4,3"/>
          {/* now / forecast divider (current phase only) */}
          {isCurrent && (<>
            <line x1={nowX.toFixed(1)} y1={padT} x2={nowX.toFixed(1)} y2={CH - padB}
                  stroke="rgba(255,255,255,0.14)" strokeWidth="1" strokeDasharray="2,3"/>
            <text x={nowX.toFixed(1)} y={padT - 3} fill={W.t3} fontSize="8" textAnchor="middle">NOW</text>
          </>)}
          {actualPts  && <polyline points={actualPts}  fill="none" stroke="rgba(255,255,255,0.30)" strokeWidth="1"/>}
          {rollingPts && <polyline points={rollingPts} fill="none" stroke={accent} strokeWidth="2.5"/>}
        </svg>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: 14, marginTop: 10, flexWrap: 'wrap',
        ...T.label(9.5, W.t2),
      }}>
        <ProgressLegend swatch="rgba(255,255,255,0.30)" label="Daily"/>
        <ProgressLegend swatch={accent}                 label="4-wk Avg"/>
        <ProgressLegend swatch={W.sleep}                label={`Ideal ${goal.blurb}`} dashed/>
      </div>

      {/* Phase info */}
      <div style={{
        marginTop: 12, padding: '12px 14px', borderRadius: W.radiusSm, background: W.card,
        fontSize: 12, color: W.t2, display: 'flex', flexDirection: 'column', gap: 7,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <span>Started <b style={{ color: W.text, fontWeight: 600 }}>{ad}/{am}/{ay}</b> @ <b style={{ color: W.text, fontWeight: 600 }}>{phase.kg.toFixed(1)}kg</b></span>
          <span style={{ whiteSpace: 'nowrap' }}>vs ideal:&nbsp;
            <b style={{ color: trackingColor, fontWeight: 700 }}>
              {deltaVsIdeal >= 0 ? '+' : ''}{deltaVsIdeal.toFixed(2)}kg
            </b>
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, color: W.t3, fontSize: 11.5 }}>
          <span>{goal.label} · {goal.blurb}</span>
          {isCurrent ? (
            <span style={{ whiteSpace: 'nowrap' }}>In {Math.round(PROGRESS_FORECAST_DAYS / 7)} wks ideal:&nbsp;
              <b style={{ color: W.t2, fontWeight: 600 }}>{forecastKg.toFixed(1)}kg</b>
            </span>
          ) : (
            <span style={{ whiteSpace: 'nowrap' }}>Ended:&nbsp;
              <b style={{ color: W.t2, fontWeight: 600 }}>{latest.kg.toFixed(1)}kg</b>
            </span>
          )}
        </div>
      </div>

      {/* Goal picker */}
      {pickingGoal && (
        <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {PROGRESS_GOALS.map(g => {
            const active = g.id === goal.id;
            return (
              <button key={g.id}
                onClick={() => { onSetGoal(g.id); setPickingGoal(false); }}
                style={{
                  padding: '11px 10px', borderRadius: W.radiusSm, cursor: 'pointer', border: 'none',
                  background: active ? `${accent}26` : 'rgba(255,255,255,0.06)',
                  color: active ? accent : W.t2,
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3,
                  textAlign: 'left', fontSize: 12, fontWeight: 600,
                }}>
                <span>{g.label}</span>
                <span style={{ fontSize: 10.5, opacity: 0.75, fontWeight: 500 }}>{g.blurb}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Actions */}
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <button onClick={() => setPickingGoal(p => !p)} style={ghostBtn(pickingGoal, accent)}>
          {pickingGoal ? 'Done' : 'Change goal'}
        </button>
        <button
          onClick={() => {
            if (!confirmingNew) { setConfirmingNew(true); return; }
            setConfirmingNew(false);
            onNewPhase();
          }}
          onBlur={() => setConfirmingNew(false)}
          style={ghostBtn(confirmingNew, accent)}>
          {confirmingNew ? 'Tap to confirm' : 'New phase from latest'}
        </button>
      </div>

      {/* Discard (only when there's history to fall back to) */}
      {phases.length > 1 && (
        <button
          onClick={() => {
            if (!confirmingDelete) { setConfirmingDelete(true); return; }
            setConfirmingDelete(false);
            onDeletePhase();
          }}
          onBlur={() => setConfirmingDelete(false)}
          style={{
            marginTop: 8, width: '100%', padding: '11px', borderRadius: W.radiusSm, border: 'none',
            background: confirmingDelete ? `${W.red}1F` : 'transparent',
            color: confirmingDelete ? W.red : W.t3, cursor: 'pointer',
            ...T.label(10, confirmingDelete ? W.red : W.t3),
          }}>
          {confirmingDelete
            ? 'Tap to confirm discard'
            : (isCurrent ? 'Discard current phase (undo new phase)' : 'Discard this phase')}
        </button>
      )}
    </div>
  );
}

function ProgressStat({ label, value, unit, color }) {
  return (
    <div style={{ background: W.card, borderRadius: W.radiusSm, padding: '12px 8px', textAlign: 'center' }}>
      <div style={T.label(9, W.t3)}>{label}</div>
      <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
        <span style={T.num(19, color || W.text)}>{value}</span>
        {unit && <span style={{ fontSize: 10, fontWeight: 600, color: W.t3 }}>{unit}</span>}
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

Object.assign(window, { Sheet, Dock, HistorySheet, TargetsSheet, ProgressSheet, TARGET_BANDS });
