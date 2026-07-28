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

// The dock floats over the scroll area, so the spacer at the end of the
// content has to mirror the dock's height exactly. They were two independent
// magic numbers; deriving both from one value stops them drifting.
//
// Below the 56px pill we want ~28px of breathing room on a device with a home
// indicator — Whoop leaves about that much, and the pill is allowed to sit
// inside the safe-area band since the indicator is only an overlay. Adding a
// flat 10px *on top of* the full 34px inset (the old value) gave 44px, which
// is what read as dead space at the bottom of the screen.
window.W.dockPadBottom = 'max(10px, calc(env(safe-area-inset-bottom) - 6px))';
// 56 pill + 12 gap above it + whatever sits below it.
window.W.dockClearance = `calc(68px + ${window.W.dockPadBottom})`;

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
