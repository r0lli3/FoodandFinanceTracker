// Whoop-inspired design tokens.
// Deep blue-grey surfaces, translucent cards with no hard borders, saturated
// status colors reserved for data (never chrome).
window.W = {
  // surfaces
  bg:        '#0E1216',
  bgTop:     '#1B222A',
  bgMid:     '#11161B',
  card:      'rgba(255,255,255,0.055)',
  cardHi:    'rgba(255,255,255,0.085)',
  cardSolid: '#191F26',
  line:      'rgba(255,255,255,0.07)',
  track:     'rgba(255,255,255,0.10)',

  // text
  text: '#FFFFFF',
  t2:   'rgba(255,255,255,0.62)',
  t3:   'rgba(255,255,255,0.40)',
  t4:   'rgba(255,255,255,0.26)',
  // solid neutral — use wherever a color gets an appended alpha suffix
  // (`${c}26`), since rgba() strings can't take one.
  neutral: '#93A0AC',

  // data colors (Whoop's recovery / strain / sleep families)
  green:  '#16EC06',
  yellow: '#FFDE00',
  red:    '#FF0026',
  blue:   '#0093E7',
  sleep:  '#7BA3C7',
  amber:  '#FF8A3D',

  radius: 18,
  radiusSm: 12,
};

// Whoop's recovery scale: green when you're on it, yellow mid, red when you're not.
window.scaleColor = (pct) => {
  if (pct >= 0.85) return W.green;
  if (pct >= 0.5)  return W.yellow;
  return W.red;
};

// A macro is "in range" between 85% and 110% of its target.
window.inRange = (value, target) => {
  if (!target) return false;
  const p = value / target;
  return p >= 0.85 && p <= 1.10;
};

// Shared type ramp. Whoop leans on one family with heavy uppercase labels.
window.T = {
  // wide uppercase eyebrow / section label
  label: (size = 11, color = 'rgba(255,255,255,0.62)') => ({
    fontSize: size, fontWeight: 700, color,
    letterSpacing: '0.09em', textTransform: 'uppercase',
  }),
  // big tabular readout
  num: (size = 32, color = '#FFFFFF') => ({
    fontSize: size, fontWeight: 700, color,
    letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  }),
};
