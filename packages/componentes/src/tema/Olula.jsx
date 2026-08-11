// Olula.jsx — drop-in React components for the olula logo system.
//
// Exports:
//   <OlulaWordmark color bowlColor className style />
//     Extended wordmark (the 5 letters in a row, the chosen variant).
//
//   <OlulaStacked color accent oFill aFill stroke className style />
//     The "stacked" icon — frame t=0 of the Pila intro, all 5 letters
//     overlapped. Natural aspect ratio is 120:168 (taller than wide).
//
//   <OlulaIntro color durationSec={4} className style />
//     The Pila intro animation. Letters start stacked, then OL slide
//     left and LA slide right around the U. Loops forever with a soft
//     fade between cycles.
//
// All components render scale-clean SVG; size them by setting width or
// height on a parent (or via the style prop).
//
// MIT — copy freely.

import React, { useEffect, useState } from 'react';

const INK = '#1a1714';
const TERRA = '#c25d3a';

// ─── Static wordmark ───────────────────────────────────────────────
export function OlulaWordmark({
  color = INK,
  bowlColor = TERRA,
  className,
  style,
}) {
  const H = 168, h = 168, w = 120, s = 14, g = 30, pad = 18;
  const r = (w - s) / 2;
  const gAfterL = g + r;
  const baseline = pad + H;
  const top = baseline - h;

  const xs = {};
  let x = pad;
  xs.o = x; x += w + g;
  xs.l1 = x; x += s + gAfterL;
  xs.u = x; x += w + g;
  xs.l2 = x; x += s + gAfterL;
  xs.a = x; x += w;
  const totalW = x + pad;
  const totalH = baseline + pad;

  const lD = (lx) => {
    const xLeft = lx + s/2;
    const xRight = lx + s/2 + r;
    return `M ${xLeft} ${top + s/2} V ${baseline - s/2 - r} A ${r} ${r} 0 0 0 ${xRight} ${baseline - s/2}`;
  };
  const uTop = top + s/2 + r;
  const uMid = baseline - s/2 - r;
  const uD = `M ${xs.u + s/2} ${uTop} V ${uMid} A ${r} ${r} 0 0 0 ${xs.u + w - s/2} ${uMid} V ${uTop}`;
  const cx = xs.a + w/2;
  const cy = baseline - r - s/2;
  const tailX = cx + r;

  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalW} ${totalH}`}
    >
      <rect
        x={xs.o + s/2} y={top + s/2}
        width={w - s} height={h - s}
        rx={r} ry={r}
        fill="none" stroke={bowlColor} strokeWidth={s}
      />
      <path d={lD(xs.l1)} fill="none" stroke={color} strokeWidth={s}
            strokeLinecap="round" strokeLinejoin="round" />
      <path d={uD} fill="none" stroke={bowlColor} strokeWidth={s}
            strokeLinecap="round" strokeLinejoin="round" />
      <path d={lD(xs.l2)} fill="none" stroke={color} strokeWidth={s}
            strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={cx} cy={cy} r={r}
              fill="none" stroke={bowlColor} strokeWidth={s} />
      <line x1={tailX} y1={cy} x2={tailX} y2={baseline - s/2}
            stroke={bowlColor} strokeWidth={s} strokeLinecap="round" />
    </svg>
  );
}

// ─── Stacked icon ──────────────────────────────────────────────────
export function OlulaStacked({
  color = INK,
  accent = null,
  oFill = null,
  aFill = null,
  stroke = 14,
  className,
  style,
}) {
  const aspect = 168 / 120;
  const width = 200;
  const W = width;
  const H = Math.round(width * aspect);
  const s = stroke;
  const pad = 14;
  const xL = pad + s/2;
  const xR = W - pad - s/2;
  const yT = pad + s/2;
  const yB = H - pad - s/2;
  const r = (xR - xL) / 2;
  const cx = W / 2;
  const aCy = yB - r;
  const accColor = accent || color;

  const oPath = `M ${cx} ${yT} A ${r} ${r} 0 0 1 ${xR} ${yT + r} V ${yB - r} A ${r} ${r} 0 0 1 ${cx} ${yB} A ${r} ${r} 0 0 1 ${xL} ${yB - r} V ${yT + r} A ${r} ${r} 0 0 1 ${cx} ${yT}`;
  const lPath = `M ${xL} ${yT} V ${yB - r} A ${r} ${r} 0 0 0 ${xL + r} ${yB}`;
  const uPath = `M ${xL} ${yT + r + s/2} V ${yB - r} A ${r} ${r} 0 0 0 ${xR} ${yB - r} V ${yT + r + s/2}`;
  const aCircle = `M ${cx} ${aCy - r} A ${r} ${r} 0 0 1 ${xR} ${aCy} A ${r} ${r} 0 0 1 ${cx} ${aCy + r} A ${r} ${r} 0 0 1 ${xL} ${aCy} A ${r} ${r} 0 0 1 ${cx} ${aCy - r}`;
  const aTail = `M ${xR} ${aCy} V ${yB}`;

  return (
    <svg
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${H}`}
    >
      {oFill && <path d={oPath} fill={oFill} stroke="none" />}
      {aFill && <path d={aCircle} fill={aFill} stroke="none" />}
      <g strokeWidth={s} strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d={oPath} stroke={color} />
        <path d={uPath} stroke={color} />
        <path d={lPath} stroke={color} />
        <path d={aCircle} stroke={accColor} />
        <path d={aTail} stroke={accColor} />
      </g>
    </svg>
  );
}

// ─── Animated intro (Pila · L sobre O) ─────────────────────────────
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeInOutCubic = (t) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function cycleOpacity(t, inEnd = 0.04, outStart = 0.90, outEnd = 0.99) {
  const a = easeOutCubic(clamp01(t / inEnd));
  const b = 1 - easeOutCubic(clamp01((t - outStart) / (outEnd - outStart)));
  return Math.min(a, b);
}

function useLoopTime(durationSec) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf;
    const startMs = performance.now();
    const tick = (now) => {
      const elapsed = ((now - startMs) / 1000) % durationSec;
      setT(elapsed / durationSec);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationSec]);
  return t;
}

function getOlulaPaths(pad = 14, w = 64, s = 9, g = 12, H = 100) {
  const r = (w - s) / 2;
  const gAfterL = g + r;
  const baseline = pad + H;
  const positions = {};
  let x = pad;
  positions.o = x; x += w + g;
  positions.l1 = x; x += s + gAfterL;
  positions.u = x; x += w + g;
  positions.l2 = x; x += s + gAfterL;
  positions.a = x; x += w;
  const totalW = x + pad;
  const totalH = baseline + pad;

  const ox = positions.o;
  const oPath = `M ${ox + s/2 + r} ${pad + s/2} A ${r} ${r} 0 0 1 ${ox + w - s/2} ${pad + s/2 + r} V ${baseline - s/2 - r} A ${r} ${r} 0 0 1 ${ox + s/2 + r} ${baseline - s/2} A ${r} ${r} 0 0 1 ${ox + s/2} ${baseline - s/2 - r} V ${pad + s/2 + r} A ${r} ${r} 0 0 1 ${ox + s/2 + r} ${pad + s/2}`;

  const l1x = positions.l1;
  const l1Path = `M ${l1x + s/2} ${pad + s/2} V ${baseline - s/2 - r} A ${r} ${r} 0 0 0 ${l1x + s/2 + r} ${baseline - s/2}`;
  const ux = positions.u;
  const uPath = `M ${ux + s/2} ${pad + s/2 + r} V ${baseline - s/2 - r} A ${r} ${r} 0 0 0 ${ux + w - s/2} ${baseline - s/2 - r} V ${pad + s/2 + r}`;
  const l2x = positions.l2;
  const l2Path = `M ${l2x + s/2} ${pad + s/2} V ${baseline - s/2 - r} A ${r} ${r} 0 0 0 ${l2x + s/2 + r} ${baseline - s/2}`;
  const ax = positions.a;
  const cx = ax + w/2;
  const cy = baseline - r - s/2;
  const aCirclePath = `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy + r} A ${r} ${r} 0 0 1 ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`;
  const aTailPath = `M ${cx + r} ${cy} L ${cx + r} ${baseline - s/2}`;

  return { totalW, totalH, oPath, l1Path, uPath, l2Path, aCirclePath, aTailPath, positions, w, s };
}

export function OlulaIntro({
  color = INK,
  durationSec = 4,
  className,
  style,
}) {
  const t = useLoopTime(durationSec);
  const paths = getOlulaPaths();
  const wrap = cycleOpacity(t);

  const cO  = paths.positions.o  + paths.w / 2;
  const cL1 = paths.positions.l1 + paths.s / 2;
  const cU  = paths.positions.u  + paths.w / 2;
  const cL2 = paths.positions.l2 + paths.s / 2;
  const cA  = paths.positions.a  + paths.w / 2;

  // L's stack on the O's left vertical (inside the stacked O).
  const lStartCenter = cU - paths.w / 2 + paths.s / 2;

  const holdEnd = 0.22;
  const slideEnd = 0.62;
  const slide = easeInOutCubic(clamp01((t - holdEnd) / (slideEnd - holdEnd)));
  const rem = 1 - slide;

  const txO  = (cU - cO ) * rem;
  const txL1 = (lStartCenter - cL1) * rem;
  const txL2 = (lStartCenter - cL2) * rem;
  const txA  = (cU - cA ) * rem;

  const stroke = (d, color, tx) => (
    <g transform={`translate(${tx}, 0)`}>
      <path d={d} fill="none" stroke={color} strokeWidth={paths.s}
            strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );

  return (
    <svg
      className={className}
      style={{ opacity: wrap, ...style }}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${paths.totalW} ${paths.totalH}`}
    >
      {stroke(paths.oPath, color, txO)}
      {stroke(paths.l1Path, color, txL1)}
      <path d={paths.uPath} fill="none" stroke={color} strokeWidth={paths.s}
            strokeLinecap="round" strokeLinejoin="round" />
      {stroke(paths.l2Path, color, txL2)}
      <g transform={`translate(${txA}, 0)`}>
        <path d={paths.aCirclePath} fill="none" stroke={color} strokeWidth={paths.s}
              strokeLinecap="round" strokeLinejoin="round" />
        <path d={paths.aTailPath} fill="none" stroke={color} strokeWidth={paths.s}
              strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
