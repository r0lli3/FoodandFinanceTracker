// Main screen + tweaks wiring
const { useState: uS, useEffect: uE, useMemo: uM } = React;

function HeroBlock({ totals, accent, mode }) {
  const calsPct = Math.min(1, totals.cals / TARGETS.cals);
  const remaining = Math.max(0, TARGETS.cals - totals.cals);
  const over = totals.cals > TARGETS.cals;

  if (mode === 'bar') {
    // Alternative hero: stacked horizontal bars
    return (
      <div style={{ padding: '4px 20px 14px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4,
        }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 56, fontWeight: 600,
            color: '#fff', letterSpacing: '-0.05em', lineHeight: 0.95,
          }}>{Math.round(totals.cals)}</span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: 'rgba(255,255,255,0.4)',
            letterSpacing: '-0.02em',
          }}>/ {TARGETS.cals} kcal</span>
        </div>
        <div style={{
          fontFamily: 'Sora, sans-serif', fontSize: 11, fontWeight: 600,
          color: over ? '#FF6B4A' : accent, letterSpacing: '0.14em', textTransform: 'uppercase',
          marginBottom: 14,
        }}>
          {over ? `${Math.round(totals.cals - TARGETS.cals)} over target` : `${Math.round(remaining)} remaining`}
        </div>
        {/* segmented bar */}
        <div style={{ height: 6, borderRadius: 3, background: '#141414', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{
            height: '100%', width: `${calsPct*100}%`, background: accent,
            transition: 'width 500ms cubic-bezier(0.2,0.8,0.2,1)',
          }}/>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { k: 'protein', l: 'Protein', c: accent },
            { k: 'carbs',   l: 'Carbs',   c: '#7AB7FF' },
            { k: 'fat',     l: 'Fat',     c: '#FFB04A' },
          ].map(m => {
            const pct = Math.min(1, totals[m.k] / TARGETS[m.k]);
            return (
              <div key={m.k} style={{ flex: 1, padding: '10px 12px', borderRadius: 12, background: '#0c0c0c', border: '1px solid #161616' }}>
                <div style={{
                  fontFamily: 'Sora, sans-serif', fontSize: 9, fontWeight: 700,
                  color: 'rgba(255,255,255,0.45)', letterSpacing: '0.16em', textTransform: 'uppercase',
                }}>{m.l}</div>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 600,
                  color: '#fff', letterSpacing: '-0.04em', marginTop: 2,
                }}>{Math.round(totals[m.k])}<span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>g</span></div>
                <div style={{ height: 3, borderRadius: 2, background: '#141414', marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct*100}%`, background: m.c, transition: 'width 400ms' }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ring mode (default)
  return (
    <div style={{ padding: '4px 0 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <Ring size={210} stroke={11} value={totals.cals} target={TARGETS.cals} color={accent}>
          <div style={{
            fontFamily: 'Sora, sans-serif', fontSize: 9.5, fontWeight: 700,
            color: 'rgba(255,255,255,0.4)', letterSpacing: '0.22em', textTransform: 'uppercase',
          }}>Calories</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 48, fontWeight: 600,
            color: '#fff', letterSpacing: '-0.05em', lineHeight: 1, marginTop: 4,
          }}>{Math.round(totals.cals)}</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)',
            letterSpacing: '-0.02em', marginTop: 6,
          }}>of {TARGETS.cals}</div>
          <div style={{
            fontFamily: 'Sora, sans-serif', fontSize: 9.5, fontWeight: 700, marginTop: 8,
            color: over ? '#FF6B4A' : accent, letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>{over ? `+${Math.round(totals.cals - TARGETS.cals)} over` : `${Math.round(remaining)} left`}</div>
        </Ring>
      </div>
      <div style={{ display: 'flex', gap: 6, padding: '14px 20px 0' }}>
        <MiniDial label="Protein" value={totals.protein} target={TARGETS.protein} color={accent}/>
        <MiniDial label="Carbs"   value={totals.carbs}   target={TARGETS.carbs}   color="#7AB7FF"/>
        <MiniDial label="Fat"     value={totals.fat}     target={TARGETS.fat}     color="#FFB04A"/>
        <MiniDial label="Fiber"   value={totals.fiber}   target={TARGETS.fiber}   color="#7CF8C0"/>
      </div>
    </div>
  );
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [log, setLog] = uS({});
  const [currentDate, setCurrentDate] = uS(() => todayStr());
  const [historyOpen, setHistoryOpen] = uS(false);
  const [targetsOpen, setTargetsOpen] = uS(false);
  const [progressOpen, setProgressOpen] = uS(false);
  const [customVersion, bumpCustom] = uS(0);

  // Fetch from server on mount
  uE(() => {
    fetchHistorySummary().then(setLog).catch(e => console.error('Load failed:', e));
  }, []);

  const today = todayStr();
  const counts = log[currentDate] || {};
  const totals = uM(() => computeTotals(counts), [counts, customVersion]);
  const weight = log[currentDate]?._kg ?? null;

  // weight trend vs most-recent prior weight
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
    : new Date(currentDate+'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' });
  const dateSubLabel = new Date(currentDate+'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const accent = t.accent;

  // latest weight for targets sheet (from any day, prefer current)
  const latestWeight = uM(() => {
    const dates = Object.keys(log).filter(k => !k.startsWith('_') && log[k]?._kg != null).sort().reverse();
    return dates.length ? log[dates[0]]._kg : null;
  }, [log]);

  return (
    <div style={{
      width: '100%', height: '100%', background: '#000',
      fontFamily: 'Sora, sans-serif', color: '#fff',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: 'max(env(safe-area-inset-top), 16px) 20px 0',
      }}>
        <div style={{
          fontFamily: 'Sora, sans-serif', fontSize: 9.5, fontWeight: 700,
          color: 'rgba(255,255,255,0.4)', letterSpacing: '0.24em', textTransform: 'uppercase',
        }}>FUEL · {dateSubLabel}</div>
        <div style={{
          fontFamily: 'Sora, sans-serif', fontSize: 28, fontWeight: 600,
          color: '#fff', letterSpacing: '-0.025em', marginTop: 3,
        }}>{dateLabel}</div>
      </div>

      {/* Day strip */}
      <DayStrip currentDate={currentDate} onPick={setCurrentDate} log={log} accent={accent}/>

      {/* Scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <HeroBlock totals={totals} accent={accent} mode={t.heroMode}/>

        {/* Weight */}
        <div style={{ padding: '10px 16px 0' }}>
          <SectionHeader title="Weight"/>
          <WeightCard weight={weight} onSave={setWeight} accent={accent} trend={trend}/>
        </div>

        {/* Meal sections */}
        {sectionsCounts.map(section => (
          <div key={section.name} style={{ padding: '14px 16px 0' }}>
            <SectionHeader title={section.name} count={section.count} accent={accent}/>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {section.meals.map(meal => (
                <MealCard key={meal.id} meal={meal}
                  count={counts[meal.id] || 0}
                  onChange={(n) => updateCount(meal.id, n)}
                  accent={accent}
                  dense={t.density === 'compact'}
                  showSub={t.showSubtitles}
                  editable={!!meal.custom}
                  onMacroChange={meal.custom ? (k, v) => updateCustomMacro(meal.id, k, v) : undefined}
                />
              ))}
              {section.name === 'Misc' && (
                <button onClick={addCustomItem} style={{
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px dashed #2a2a2a',
                  borderRadius: 14,
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'Sora, sans-serif',
                  fontSize: 11, fontWeight: 700,
                  letterSpacing: '0.16em', textTransform: 'uppercase',
                  cursor: 'pointer',
                  marginTop: 2,
                }}>+ Add Custom</button>
              )}
            </div>
          </div>
        ))}
        <div style={{ height: 24 }}/>
      </div>

      {/* Dock */}
      <Dock
        accent={accent}
        onTargets={() => setTargetsOpen(true)}
        onHistory={() => setHistoryOpen(true)}
        onProgress={() => setProgressOpen(true)}
      />

      <HistorySheet open={historyOpen} onClose={() => setHistoryOpen(false)}
        log={log} accent={accent} onJump={setCurrentDate}/>
      <TargetsSheet open={targetsOpen} onClose={() => setTargetsOpen(false)}
        weightKg={latestWeight} accent={accent}/>
      <ProgressSheet open={progressOpen} onClose={() => setProgressOpen(false)}
        log={log} accent={accent}/>

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Color">
          <TweakColor label="Accent" value={t.accent} onChange={(v) => setTweak('accent', v)}
            options={ACCENT_OPTIONS}/>
        </TweakSection>
        <TweakSection title="Layout">
          <TweakRadio label="Hero" value={t.heroMode} onChange={(v) => setTweak('heroMode', v)}
            options={[{ value: 'ring', label: 'Ring' }, { value: 'bar', label: 'Bar' }]}/>
          <TweakRadio label="Density" value={t.density} onChange={(v) => setTweak('density', v)}
            options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]}/>
          <TweakToggle label="Show source labels" value={t.showSubtitles} onChange={(v) => setTweak('showSubtitles', v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

window.App = App;
