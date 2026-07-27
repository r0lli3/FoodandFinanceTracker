// Home screen — Whoop-style: ring trio, monitors, "My Day" stack
const { useState: uS, useEffect: uE, useMemo: uM, useRef: uR } = React;

// ─── hero: three rings ──────────────────────────────────────────────────
// `units` is 'pct' (83%) or 'abs' (115 over / 155g).
function RingTrio({ totals, units, onToggle }) {
  const abs = units === 'abs';
  const ring = (label, value, target, color, unit) => {
    const pct = target ? value / target : 0;
    return {
      label, pct, color,
      value: abs ? Math.round(value) : Math.round(pct * 100),
      unit:  abs ? '' : '%',
      sub:   abs ? `/ ${target}${unit}` : null,
    };
  };
  const rings = [
    ring('Calories', totals.cals,    TARGETS.cals,    W.sleep, ''),
    ring('Protein',  totals.protein, TARGETS.protein, scaleColor(totals.protein / TARGETS.protein), 'g'),
    ring('Carbs',    totals.carbs,   TARGETS.carbs,   W.blue, 'g'),
  ];

  return (
    <div style={{ display: 'flex', gap: 4, padding: '10px 12px 20px' }}>
      {rings.map(r => (
        <RingStat key={r.label} label={r.label} value={r.value} unit={r.unit} sub={r.sub}
          pct={r.pct} color={r.color} onPress={onToggle}/>
      ))}
    </div>
  );
}

// ─── monitors ───────────────────────────────────────────────────────────
function Monitors({ totals, onTargets }) {
  const macros = [
    ['protein', TARGETS.protein],
    ['carbs',   TARGETS.carbs],
    ['fat',     TARGETS.fat],
    ['fiber',   TARGETS.fiber],
  ];
  const hit = macros.filter(([k, t]) => totals[k] >= t * 0.85).length;
  const started = totals.cals > 0;
  const macroColor = hit === 4 ? W.green : started ? W.yellow : W.neutral;
  const macroStatus = hit === 4 ? 'All hit' : started ? 'In progress' : 'Not started';

  const remaining = TARGETS.cals - totals.cals;
  const over = remaining < 0;
  const balColor = over ? W.red : totals.cals === 0 ? W.neutral : W.sleep;

  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 16px' }}>
      <MonitorCard
        title="Macro Targets"
        badge={`${hit}/4`}
        badgeColor={macroColor}
        status={macroStatus}
        sub="Macros at target"
        onPress={onTargets}
      />
      <MonitorCard
        title="Calories"
        badge={Math.abs(Math.round(remaining))}
        badgeColor={balColor}
        status={over ? 'Over target' : 'Remaining'}
        sub={`of ${TARGETS.cals} kcal`}
        onPress={onTargets}
      />
    </div>
  );
}

// ─── macro breakdown ────────────────────────────────────────────────────
function MacroBar({ label, value, target, color, unit = 'g' }) {
  const pct = target ? Math.min(1, value / target) : 0;
  return (
    <div style={{ padding: '9px 0' }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 8, marginBottom: 7,
      }}>
        <span style={T.label(10.5, W.t2)}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={T.num(15)}>{Math.round(value)}</span>
          <span style={{ fontSize: 11, fontWeight: 500, color: W.t3 }}>/ {target}{unit}</span>
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct * 100}%`, background: color, borderRadius: 3,
          transition: 'width 500ms cubic-bezier(0.2,0.8,0.2,1)',
        }}/>
      </div>
    </div>
  );
}

function MacroCard({ totals }) {
  return (
      <Card>
        <CardHead title="Macros"/>
        <MacroBar label="Protein" value={totals.protein} target={TARGETS.protein}
          color={scaleColor(totals.protein / TARGETS.protein)}/>
        <MacroBar label="Carbs"   value={totals.carbs}   target={TARGETS.carbs}   color={W.blue}/>
        <MacroBar label="Fat"     value={totals.fat}     target={TARGETS.fat}     color={W.amber}/>
        <MacroBar label="Fiber"   value={totals.fiber}   target={TARGETS.fiber}   color={W.green}/>
      </Card>
  );
}

// ─── today's intake summary ─────────────────────────────────────────────
function IntakeCard({ counts, totals, accent, onAdd }) {
  const logged = allMeals()
    .filter(m => (counts[m.id] || 0) > 0)
    .map(m => ({ meal: m, n: counts[m.id] }));

  return (
    <Card>
      <CardHead title="Today's Intake" right={
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span style={T.num(16)}>{Math.round(totals.cals)}</span>
          <span style={{ fontSize: 10, fontWeight: 600, color: W.t3 }}>KCAL</span>
        </span>
      }/>
      {logged.length === 0 ? (
        <div style={{
          padding: '18px 0 6px', textAlign: 'center', fontSize: 13, color: W.t3,
        }}>Nothing logged yet</div>
      ) : (
        <div>
          {logged.map(({ meal, n }, i) => (
            <div key={meal.id} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0',
              borderBottom: i === logged.length - 1 ? 'none' : `1px solid ${W.line}`,
            }}>
              <div style={{
                flex: '0 0 auto', width: 56, height: 40, borderRadius: 9, background: accent,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: 14, fontWeight: 700, color: '#04212E', letterSpacing: '-0.03em', lineHeight: 1,
                }}>{meal.cals * n}</span>
                <span style={{
                  fontSize: 8, fontWeight: 600, color: 'rgba(4,33,46,0.65)', letterSpacing: '0.08em',
                  marginTop: 2,
                }}>KCAL</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 600, color: W.text, letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{meal.name}</div>
                <div style={{ fontSize: 11.5, color: W.t3, marginTop: 2 }}>
                  P {Math.round(meal.protein * n)} · C {Math.round(meal.carbs * n)} · F {Math.round(meal.fat * n)}
                </div>
              </div>
              {n > 1 && (
                <span style={{
                  ...T.label(10, W.t2), background: 'rgba(255,255,255,0.08)',
                  padding: '4px 8px', borderRadius: 6,
                }}>×{n}</span>
              )}
            </div>
          ))}
        </div>
      )}
      <button onClick={onAdd} style={{
        width: '100%', marginTop: 12, padding: '11px', borderRadius: W.radiusSm, border: 'none',
        background: 'rgba(255,255,255,0.08)', color: W.text, cursor: 'pointer',
        ...T.label(11, W.text),
      }}>+ Add Custom</button>
    </Card>
  );
}

// ─── outlook copy ───────────────────────────────────────────────────────
function outlookHeadline(totals) {
  const remaining = Math.round(TARGETS.cals - totals.cals);
  const pPct = Math.round((totals.protein / TARGETS.protein) * 100);
  if (remaining < 0) return `${Math.abs(remaining)} kcal over · protein ${pPct}%`;
  return `${remaining} kcal left · protein ${pPct}%`;
}

// ─── app ────────────────────────────────────────────────────────────────
function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [log, setLog] = uS({});
  const [currentDate, setCurrentDate] = uS(() => todayStr());
  const [historyOpen, setHistoryOpen] = uS(false);
  const [targetsOpen, setTargetsOpen] = uS(false);
  const [progressOpen, setProgressOpen] = uS(false);
  const [customVersion, bumpCustom] = uS(0);
  const [units, setUnits] = useStoredState('fft_hero_units', 'pct');
  const scrollRef = uR(null);

  // Called both by the segmented control (passes a mode) and by tapping a
  // ring (passes a click event) — the latter just flips.
  const toggleUnits = (mode) =>
    setUnits(typeof mode === 'string' ? mode : (units === 'pct' ? 'abs' : 'pct'));

  uE(() => {
    fetchHistorySummary().then(setLog).catch(e => console.error('Load failed:', e));
  }, []);

  const today = todayStr();
  const counts = log[currentDate] || {};
  const totals = uM(() => computeTotals(counts), [counts, customVersion]);
  const weight = log[currentDate]?._kg ?? null;
  const streak = uM(() => computeStreak(log), [log]);

  const trend = uM(() => {
    if (weight == null) return null;
    const dates = Object.keys(log).filter(k => !k.startsWith('_') && k < currentDate && log[k]?._kg != null).sort().reverse();
    if (!dates.length) return null;
    return Math.round((weight - log[dates[0]]._kg) * 10) / 10;
  }, [weight, log, currentDate]);

  const updateCount = (mealId, n) => {
    setLog(prev => {
      const d = { ...(prev[currentDate] || {}) };
      if (n <= 0) delete d[mealId]; else d[mealId] = n;
      return { ...prev, [currentDate]: d };
    });
    saveCountAPI(currentDate, mealId, n).catch(e => console.error('Save count failed:', e));
  };
  const setWeight = (kg) => {
    if (isNaN(kg) || kg <= 0) return;
    const rounded = Math.round(kg * 10) / 10;
    setLog(prev => ({ ...prev, [currentDate]: { ...(prev[currentDate] || {}), _kg: rounded } }));
    saveWeightAPI(currentDate, rounded).catch(e => console.error('Save weight failed:', e));
  };

  const addCustomItem = () => {
    const id = 'custom-' + Date.now();
    const meal = { id, name: 'Custom', sub: 'Custom', protein: 0, carbs: 0, fat: 0, fiber: 0, cals: 0, custom: true };
    const misc = SECTIONS.find(s => s.name === 'Misc');
    if (misc) misc.meals.push(meal);
    bumpCustom(v => v + 1);
    updateCount(id, 1);
  };
  const updateCustomMacro = (mealId, key, value) => {
    const meal = allMeals().find(m => m.id === mealId);
    if (!meal) return;
    meal[key] = value;
    meal.cals = Math.round(meal.protein * 4 + meal.carbs * 4 + meal.fat * 9);
    bumpCustom(v => v + 1);
  };

  const sectionsCounts = SECTIONS.map(s => ({
    ...s, count: s.meals.reduce((acc, m) => acc + (counts[m.id] || 0), 0),
  }));

  const dateLabel = currentDate === today ? 'Today'
    : currentDate === offsetDate(today, -1) ? 'Yesterday'
    : new Date(currentDate+'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const accent = t.accent;

  const latestWeight = uM(() => {
    const dates = Object.keys(log).filter(k => !k.startsWith('_') && log[k]?._kg != null).sort().reverse();
    return dates.length ? log[dates[0]]._kg : null;
  }, [log]);

  const goToday = () => {
    setCurrentDate(today);
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(180deg, ${W.bgTop} 0%, ${W.bgMid} 22%, ${W.bg} 46%)`,
      color: W.text, display: 'flex', flexDirection: 'column', overflow: 'hidden',
      position: 'relative',
    }}>
      <TopBar
        dateLabel={dateLabel}
        onPrev={() => setCurrentDate(d => offsetDate(d, -1))}
        onNext={() => setCurrentDate(d => offsetDate(d, 1))}
        canNext={currentDate < today}
        streak={streak}
        weight={weight ?? latestWeight}
      />

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <RingTrio totals={totals} units={units} onToggle={toggleUnits}/>

        <Monitors totals={totals} onTargets={() => setTargetsOpen(true)}/>

        {/* My Day */}
        <div style={{ padding: '30px 20px 14px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.025em' }}>My Day</h2>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <WeightCard weight={weight} onSave={setWeight} accent={accent} trend={trend}/>

          <OutlookBanner headline={outlookHeadline(totals)}
            onPress={() => setProgressOpen(true)}/>

          <IntakeCard counts={counts} totals={totals} accent={accent} onAdd={addCustomItem}/>

          <MacroCard totals={totals}/>

          {sectionsCounts.map(section => (
            <Card key={section.name}>
              <CardHead title={section.name} accentCount={section.count} accent={accent}/>
              <div>
                {section.meals.map((meal, i) => (
                  <MealRow key={meal.id} meal={meal}
                    count={counts[meal.id] || 0}
                    onChange={(n) => updateCount(meal.id, n)}
                    accent={accent}
                    dense={t.density === 'compact'}
                    showSub={t.showSubtitles}
                    editable={!!meal.custom}
                    onMacroChange={meal.custom ? (k, v) => updateCustomMacro(meal.id, k, v) : undefined}
                    last={i === section.meals.length - 1}
                  />
                ))}
              </div>
            </Card>
          ))}

        </div>

        {/* clearance for the floating dock */}
        <div style={{ height: 92 }}/>
      </div>

      <Dock
        accent={accent}
        isToday={currentDate === today}
        onTargets={() => setTargetsOpen(true)}
        onHistory={() => setHistoryOpen(true)}
        onProgress={() => setProgressOpen(true)}
        onToday={goToday}
      />

      <HistorySheet open={historyOpen} onClose={() => setHistoryOpen(false)}
        log={log} accent={accent} onJump={setCurrentDate}/>
      <TargetsSheet open={targetsOpen} onClose={() => setTargetsOpen(false)}
        weightKg={latestWeight} accent={accent}/>
      <ProgressSheet open={progressOpen} onClose={() => setProgressOpen(false)}
        log={log} accent={accent}/>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Color">
          <TweakColor label="Accent" value={t.accent} onChange={(v) => setTweak('accent', v)}
            options={ACCENT_OPTIONS}/>
        </TweakSection>
        <TweakSection title="Layout">
          <TweakRadio label="Density" value={t.density} onChange={(v) => setTweak('density', v)}
            options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]}/>
          <TweakToggle label="Show source labels" value={t.showSubtitles} onChange={(v) => setTweak('showSubtitles', v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

window.App = App;
