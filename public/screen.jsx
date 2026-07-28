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
    ring('Protein', totals.protein, TARGETS.protein, scaleColor(totals.protein / TARGETS.protein), 'g'),
    ring('Carbs',   totals.carbs,   TARGETS.carbs,   W.blue,  'g'),
    ring('Fat',     totals.fat,     TARGETS.fat,     W.amber, 'g'),
  ];

  // gap:0 — the flex columns are equal width, so shrinking the ring inside
  // them is what opens up the air between rings.
  return (
    <div style={{ display: 'flex', gap: 0, padding: '18px 12px 28px' }}>
      {rings.map(r => (
        <RingStat key={r.label} label={r.label} value={r.value} unit={r.unit} sub={r.sub}
          pct={r.pct} color={r.color} onPress={onToggle} size={88}/>
      ))}
    </div>
  );
}

// ─── monitors ───────────────────────────────────────────────────────────
function Monitors({ totals, onTargets }) {
  // Fiber is tracked but no longer surfaced, so it isn't counted here either.
  const macros = [
    ['protein', TARGETS.protein],
    ['carbs',   TARGETS.carbs],
    ['fat',     TARGETS.fat],
  ];
  const hit = macros.filter(([k, t]) => totals[k] >= t * 0.85).length;
  const all = macros.length;
  const started = totals.cals > 0;
  const macroColor = hit === all ? W.green : started ? W.yellow : W.neutral;
  const macroStatus = hit === all ? 'All hit' : started ? 'In progress' : 'Not started';

  const remaining = TARGETS.cals - totals.cals;
  const over = remaining < 0;
  const balColor = over ? W.red : totals.cals === 0 ? W.neutral : W.green;

  return (
    <div style={{ display: 'flex', gap: 8, padding: '0 16px' }}>
      <MonitorCard
        title="Macro Targets"
        badge={`${hit}/${all}`}
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

// ─── TEMPORARY viewport diagnostic ──────────────────────────────────────
// Remove once the PWA layout issue is settled. Reports what the device
// actually says, since env()/vh behave differently in a standalone PWA.
function DebugViewport() {
  const [m, setM] = uS(null);
  uE(() => {
    const read = () => {
      const probe = document.createElement('div');
      probe.style.cssText = 'position:absolute;visibility:hidden;'
        + 'top:env(safe-area-inset-top);bottom:env(safe-area-inset-bottom);'
        + 'height:100vh;width:100dvh';
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const insetTop = cs.top, insetBottom = cs.bottom;
      const vh100 = probe.getBoundingClientRect().height;
      probe.remove();

      const rootEl = document.getElementById('app-root');
      const root = rootEl ? rootEl.getBoundingClientRect() : { top: 0, bottom: 0 };
      const dock = [...document.querySelectorAll('div')]
        .find(d => getComputedStyle(d).position === 'absolute' && (d.textContent || '').includes('History'));
      const dr = dock ? dock.getBoundingClientRect() : null;
      const pill = dock && dock.firstElementChild
        ? dock.firstElementChild.getBoundingClientRect() : null;

      setM({
        standalone: String(window.navigator.standalone),
        innerH: window.innerHeight,
        screenH: window.screen.height,
        docClientH: document.documentElement.clientHeight,
        visualVH: window.visualViewport ? Math.round(window.visualViewport.height) : 'n/a',
        vh100: Math.round(vh100),
        insetTop, insetBottom,
        rootTop: Math.round(root.top), rootBottom: Math.round(root.bottom),
        dockBottom: dr ? Math.round(dr.bottom) : 'n/a',
        pillBottom: pill ? Math.round(pill.bottom) : 'n/a',
      });
    };
    read();
    window.addEventListener('resize', read);
    return () => window.removeEventListener('resize', read);
  }, []);

  if (!m) return null;
  return (
    <div style={{
      margin: '0 16px 12px', padding: 12, borderRadius: 12,
      background: '#3A1D1D', border: '1px solid #6B2E2E',
      fontSize: 11.5, lineHeight: 1.55, color: '#fff',
      fontFamily: 'ui-monospace, monospace',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>VIEWPORT DEBUG — screenshot this</div>
      {Object.entries(m).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
          <span style={{ opacity: 0.65 }}>{k}</span><span>{String(v)}</span>
        </div>
      ))}
    </div>
  );
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
  // TARGETS is a mutated global, so applying new targets needs an explicit
  // re-render nudge — same pattern as custom meals above.
  const [, bumpTargets] = uS(0);
  const [units, setUnits] = useStoredState('fft_hero_units', 'abs');
  const isWide = useMediaQuery('(min-width: 768px)');
  const scrollRef = uR(null);

  // Called both by the segmented control (passes a mode) and by tapping a
  // ring (passes a click event) — the latter just flips.
  const toggleUnits = (mode) =>
    setUnits(typeof mode === 'string' ? mode : (units === 'pct' ? 'abs' : 'pct'));

  uE(() => {
    fetchHistorySummary().then(({ log, targets }) => {
      setLog(log);
      if (targets) {
        // Server wins over the localStorage cache applied at boot.
        applyTargets(targets);
        bumpTargets(v => v + 1);
      } else if (localStorage.getItem(TARGETS_KEY)) {
        // Never synced: push the locally-saved targets up so this device's
        // choice becomes the server's.
        saveTargetsAPI(TARGETS).catch(e => console.error('Target migration failed:', e));
      }
    }).catch(e => console.error('Load failed:', e));
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
    // The Custom section is created on first use so it isn't sitting empty.
    let section = SECTIONS.find(s => s.name === 'Custom');
    if (!section) {
      section = { name: 'Custom', meals: [] };
      SECTIONS.push(section);
    }
    section.meals.push(meal);
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
      />

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <DebugViewport/>
        <RingTrio totals={totals} units={units} onToggle={toggleUnits}/>

        <Monitors totals={totals} onTargets={() => setTargetsOpen(true)}/>

        {/* My Day */}
        <div style={{ padding: '40px 20px 20px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.025em' }}>My Day</h2>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <WeightCard weight={weight} onSave={setWeight} accent={accent} trend={trend}/>

          <OutlookBanner headline={outlookHeadline(totals)}
            onPress={() => setProgressOpen(true)}/>

          <IntakeCard counts={counts} totals={totals} accent={accent} onAdd={addCustomItem}/>

          {/* Tablet and up: meal sections sit three across. */}
          <div style={{
            display: isWide ? 'grid' : 'flex',
            gridTemplateColumns: isWide ? 'repeat(3, 1fr)' : undefined,
            alignItems: isWide ? 'start' : undefined,
            flexDirection: isWide ? undefined : 'column',
            gap: 10,
          }}>
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
                      stacked={isWide}
                    />
                  ))}
                </div>
              </Card>
            ))}
          </div>

        </div>

        {/* Clearance for the floating dock — derived from the same token the
            dock pads itself with, so the two can't drift apart. */}
        <div style={{ height: W.dockClearance }}/>
      </div>

      <Dock
        onTargets={() => setTargetsOpen(true)}
        onHistory={() => setHistoryOpen(true)}
        onProgress={() => setProgressOpen(true)}
        onToday={goToday}
      />

      <HistorySheet open={historyOpen} onClose={() => setHistoryOpen(false)}
        log={log} accent={accent} onJump={setCurrentDate}/>
      <TargetsSheet open={targetsOpen} onClose={() => setTargetsOpen(false)}
        weightKg={latestWeight} accent={accent}
        onApply={(next) => { saveTargets(next); bumpTargets(v => v + 1); }}/>
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
