/* Book library for "Ã‰pidÃ©mie de rougeole aux Ã‰tats-Unis" â€” elements shared by its chapters.
   Loaded after lib/engine.js, before audio/<lang>/timings.js.
   Colours follow style.json look.meaning:
   virus / alerte #e5533d (COL.bad) Â· vaccination / immunitÃ© #4cc3d9 (COL.task) Â· cas #f2c14e (COL.int) Â· seuil #8fd6b0 (COL.good) */
'use strict';

const C_VIRUS = COL.bad, C_VAC = COL.task, C_CAS = COL.int, C_SEUIL = COL.good, C_EXTRA = COL.nat;

const vxLerp = (a, b, k) => a + (b - a) * k;
const vxSm = (t, a, b) => io(Math.max(0, Math.min(1, (t - a) / (b - a))));
// Deterministic pseudo-random number in [0,1) from an integer seed, so replays and seeks match.
function vxHash(i, salt = 0) {
  let h = (i * 374761393 + salt * 668265263) | 0;
  h = (Math.imul(h ^ (h >>> 13), 1274126177)) | 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
const vxNum = n => n.toLocaleString('fr-FR');
/* A number that counts up inside a text element. vxCount(el, from, to, t0, dur). */
function vxCount(el, from, to, t0, dur) {
  let last = -1;
  prog(q => {
    const v = Math.round(vxLerp(from, to, q));
    if (v === last) return;
    last = v;
    el.textContent = vxNum(v);
  }, t0, dur, out);
}

/* Vertical bar chart of case counts.
   o = {x, y, w, h, max, data:[{label, n, fill, note}], vs, ls}
   ch = casBars(p, o); casBarsIn(ch, i, t0) grows bar i at t0. */
function casBars(p, o) {
  const base = o.y + o.h, n = o.data.length, slot = o.w / n, BW = Math.min(118, slot * .5);
  draw(path(p, `M${o.x - 24} ${base}H${o.x + o.w + 24}`, { stroke: COL.dim, 'stroke-width': 3 }, { d: 0 }), 0, .7);
  const ch = { base, cx: [], bars: [], vals: [], labs: [], notes: [], h: [] };
  o.data.forEach((d, i) => {
    const cx = o.x + slot * (i + .5), bh = Math.max(3, Math.round(o.h * d.n / o.max));
    ch.cx.push(cx); ch.h.push(bh);
    ch.bars.push(mk('rect', { x: cx - BW / 2, y: base, width: BW, height: 0, rx: 9, fill: d.fill || C_CAS }, p));
    ch.vals.push(T(p, vxNum(d.n), { x: cx, y: base - bh - 24, size: o.vs || 46, fill: d.fill || C_CAS, anchor: 'middle', weight: 700, o: 0 }));
    ch.labs.push(T(p, d.label, { x: cx, y: base + 56, size: o.ls || 38, fill: COL.chalk, anchor: 'middle', weight: 600, o: 0 }));
    ch.notes.push(d.note ? T(p, d.note, { x: cx, y: base + 102, size: 25, fill: COL.dim, anchor: 'middle', o: 0 }) : null);
  });
  return ch;
}
function casBarsIn(ch, i, t0, dur = .9) {
  tw(ch.bars[i], { a_height: ch.h[i], a_y: ch.base - ch.h[i] }, t0, dur, back);
  show(ch.vals[i], t0 + dur * .45, .3); show(ch.labs[i], t0 + .1, .3);
  if (ch.notes[i]) show(ch.notes[i], t0 + dur * .6, .3);
}

/* A strip of 50 state dots, two rows of 25; the start state stands out.
   o = {x, y, r, gap, start: index (0-based) or -1}
   vxStateIn(st, i, t0, col) lights dot i. */
function stateStrip(p, o) {
  const st = { dots: [], start: o.start ?? -1 };
  for (let i = 0; i < 50; i++) {
    const row = i < 25 ? 0 : 1, k = i % 25;
    const cx = o.x + k * (2 * o.r + o.gap), cy = o.y + row * (2 * o.r + o.gap + 16);
    const isStart = i === st.start;
    st.dots.push(mk('circle', {
      cx, cy, r: isStart ? o.r * 1.5 : o.r,
      fill: isStart ? C_VIRUS : 'none',
      stroke: isStart ? C_VIRUS : COL.faint,
      'stroke-width': isStart ? 3 : 2, opacity: isStart ? .95 : .8,
    }, p));
  }
  return st;
}
function vxStateIn(st, i, t0, col = C_CAS) {
  const d = st.dots[i];
  tw(d, { c_fill: col, c_stroke: col }, t0, .3);
  pop(d, t0);
  return d;
}

/* A ring swept like a clock hand: pct of the circle in the given colour.
   o = {x, y, r, pct (0..1), color, w}   Returns the sweep path; draw it to animate. */
function pctRing(p, o) {
  const { x, y, r, pct, color } = o, w = o.w || 30;
  const a0 = -Math.PI / 2, a1 = a0 + pct * Math.PI * 2, big = pct > .5 ? 1 : 0;
  mk('circle', { cx: x, cy: y, r, fill: 'none', stroke: COL.faint, 'stroke-width': w }, p);
  return path(p, `M${x} ${y - r}A${r} ${r} 0 ${big} 1 ${x + r * Math.cos(a1)} ${y + r * Math.sin(a1)}`,
    { stroke: color, 'stroke-width': w, fill: 'none', 'stroke-linecap': 'round' }, { d: 0 });
}

/* A coverage gauge: a 0â€“100 % bar with a fill to pct and a dashed line at the 95 % threshold.
   o = {x, y, w, pct, lab: '77 %'}   vxGaugeIn(g, t0, dur) animates the fill and shows the labels. */
function covGauge(p, o) {
  const { x, y, w, pct } = o, h = 46, xPct = x + w * pct, xSeuil = x + w * .95;
  mk('rect', { x, y, width: w, height: h, rx: h / 2, fill: COL.board, stroke: COL.faint, 'stroke-width': 2 }, p);
  const fill = mk('rect', { x, y, width: 0, height: h, rx: h / 2, fill: C_VAC }, p);
  const dash = path(p, `M${xSeuil} ${y - 24}V${y + h + 24}`, { stroke: C_SEUIL, 'stroke-width': 4, 'stroke-dasharray': '10 8' }, { d: 0 });
  const marker = mk('circle', { cx: xPct, cy: y + h / 2, r: 12, fill: COL.chalk, opacity: 0 }, p);
  const labSeuil = T(p, 'seuil d’immunité collective : 95 %', { x: xSeuil, y: y - 46, size: 26, fill: C_SEUIL, anchor: 'middle', weight: 600, o: 0 });
  const labPct = T(p, o.lab || Math.round(pct * 100) + ' %', { x: xPct, y: y + h + 96, size: 36, fill: C_VAC, anchor: 'middle', weight: 700, o: 0 });
  draw(path(p, `M${xPct} ${y + h + 12}V${y + h + 62}`, { stroke: C_VAC, 'stroke-width': 3 }, { d: 0 }), .05, .3);
  T(p, '0 %', { x, y: y + h + 54, size: 24, fill: COL.dim, anchor: 'end' });
  T(p, '100 %', { x: x + w, y: y + h + 54, size: 24, fill: COL.dim, anchor: 'start' });
  return { fill, marker, dash, labSeuil, labPct, xPct, w, pct };
}
function vxGaugeIn(g, t0, dur = 1.1) {
  tw(g.fill, { a_width: g.w * g.pct }, t0, dur, out);
  show(g.marker, t0, .3); show(g.labSeuil, t0, .3); show(g.labPct, t0 + .25, .3);
}

/* One person: head and body in one colour. */
function vxPerson(p, x, y, col = COL.chalk, s = 1) {
  const g = G(p, { x, y, s, o: 0 });
  mk('circle', { cx: 0, cy: -26, r: 11, fill: col }, g);
  path(g, 'M-13 4 q 0 -16 13 -16 q 13 0 13 16 z', { fill: col }, g);
  return g;
}

/* Cause â†’ consequence chips laid in a row, with an arrow between each.
   items = [{t: text, col}] ; vxChainIn(chain, i, t0) pops chip i and draws its arrow. */
function causeChain(p, items, x, y, size = 29) {
  const chain = { chips: [], arrows: [] };
  let cx = x;
  items.forEach((it, i) => {
    if (i) {
      const a = G(p, { o: 0 });
      path(a, `M${cx + 12} ${y}H${cx + 58}`, { stroke: COL.dim, 'stroke-width': 4 }, { d: 0 });
      path(a, `M${cx + 48} ${y - 9}L${cx + 58} ${y}L${cx + 48} ${y + 9}`, { stroke: COL.dim, 'stroke-width': 4 }, { d: 0 });
      chain.arrows.push(a); cx += 70;
    } else chain.arrows.push(null);
    const w = textW(it.t, size) + 44;
    const chip = mk('rect', { x: cx, y: y - 34, width: w, height: 68, rx: 34, fill: it.col, opacity: .16, stroke: it.col, 'stroke-width': 2 }, p);
    const label = T(p, it.t, { x: cx + w / 2, y: y + 11, size, fill: COL.chalk, anchor: 'middle', weight: 600 });
    chain.chips.push({ chip, label }); cx += w;
  });
  return chain;
}
function vxChainIn(chain, i, t0) {
  const c = chain.chips[i];
  pop(c.chip, t0); show(c.label, t0 + .1, .3);
  if (chain.arrows[i]) show(chain.arrows[i], t0 + .35, .3);
}

/* The vaccination wall: virus particles fly in from the left; a vaccinated brick stops them,
   a hole lets them through to the community. Every frame is a pure function of t, so replays match.
   o = {x, y, lanes, cw, ch, cov, D, wave, speed, reff (''≈ 3,4'' etc.), note}
   Layout: wall at o.x (o.y..o.y+o.ch); the community under it; the stats row lower; the panel on the right.
   Returns {casEl, blockedEl, statusEl}. */
function wallSim(p, o) {
  const lanes = o.lanes, cw = o.cw, wx = o.x, wy = o.y, wcx = wy + o.ch / 2;
  const nh = Math.max(1, Math.round((1 - o.cov) * lanes)), holeLanes = new Set();
  for (let k = 0; k < nh; k++) holeLanes.add(Math.min(lanes - 1, Math.floor((k + .5) * lanes / nh)));
  const flash = [];
  for (let l = 0; l < lanes; l++) {
    const hole = holeLanes.has(l);
    mk('rect', { x: wx + l * cw + 2, y: wy, width: cw - 4, height: o.ch, rx: 8,
      fill: hole ? 'none' : C_VAC, stroke: hole ? COL.faint : 'none',
      'stroke-dasharray': hole ? '5 6' : 'none', opacity: hole ? .55 : .9 }, p);
    flash.push(mk('rect', { x: wx + l * cw + 2, y: wy, width: cw - 4, height: o.ch, rx: 8, fill: '#ffffff', opacity: 0 }, p));
  }
  // the community behind the wall: 18 people in 3 rows of 6, under the wall
  const persons = [];
  for (let i = 0; i < 18; i++) {
    const px = 360 + (i % 6) * 46, py = 470 + ((i / 6) | 0) * 80;
    const g = vxPerson(p, px, py, COL.chalk, .8);
    show(g, .3, .5);
    persons.push({ g, parts: [g.firstChild, g.lastChild], x: px, y: py });
  }
  const waves = Math.max(4, Math.floor((o.D - .3) / o.wave));
  const parts = [];
  for (let i = 0; i < waves; i++) parts.push({ i, el: mk('circle', { r: 9, fill: C_VIRUS, opacity: 0 }, p) });
  // stats under the community
  const TX1 = 420, TY1 = 660;
  const casLab = T(p, 'personnes contaminées', { x: TX1, y: TY1, size: 28, fill: C_VIRUS, weight: 700, o: 0 });
  const casEl = T(p, '0', { x: TX1, y: TY1 + 72, size: 68, fill: C_VIRUS, weight: 700, o: 0 });
  const blkLab = T(p, 'passages arrêtés par le mur', { x: 920, y: TY1, size: 28, fill: C_VAC, weight: 700, o: 0 });
  const blockedEl = T(p, '0', { x: 920, y: TY1 + 72, size: 68, fill: C_VAC, weight: 700, o: 0 });
  show(casLab, .2, .5); show(casEl, .2, .5); show(blkLab, .2, .5); show(blockedEl, .2, .5);
  const statusEl = T(p, '', { x: 660, y: 830, size: 38, weight: 700, anchor: 'middle', o: 0 });
  // right panel: effective reproduction + legend
  const PX = 1250;
  const reffBox = mk('rect', { x: PX, y: 300, width: 290, height: 190, rx: 18, fill: COL.board, stroke: COL.faint, 'stroke-width': 2, opacity: 0 }, p);
  const reffT = T(p, 'Taux de reproduction', { x: PX + 24, y: 338, size: 26, fill: COL.dim, weight: 600, o: 0 });
  const reffV = T(p, o.reff || '', { x: PX + 24, y: 408, size: 58, fill: COL.chalk, weight: 700, o: 0 });
  const reffN = T(p, o.note || 'un malade contamine en moyenne', { x: PX + 24, y: 452, size: 24, fill: COL.dim, o: 0 });
  show(reffBox, .4, .5); show(reffT, .5, .4); show(reffV, .6, .4); show(reffN, .7, .4);
  const l1 = G(p, { o: 0 }), l2 = G(p, { o: 0 });
  mk('rect', { x: PX, y: 542, width: 30, height: 30, rx: 7, fill: C_VAC }, l1);
  T(l1, 'vacciné : le virus s’arrête', { x: PX + 44, y: 565, size: 25, fill: COL.dim });
  mk('rect', { x: PX, y: 592, width: 30, height: 30, rx: 7, fill: 'none', stroke: COL.faint, 'stroke-dasharray': '5 6', 'stroke-width': 2 }, l2);
  T(l2, 'non vacciné : le virus passe', { x: PX + 44, y: 615, size: 25, fill: COL.dim });
  const noteA = T(p, 'chaque passage = une personne malade,', { x: PX, y: 680, size: 24, fill: COL.dim, o: 0 });
  const noteB = T(p, 'qui peut en contaminer 12 à 18.', { x: PX, y: 712, size: 24, fill: COL.dim, o: 0 });
  show(noteA, .8, .4); show(noteB, .8, .4);
  show(l1, .9, .4); show(l2, .9, .4);
  const startX = 130, speed = o.speed || 240;
  clockRun(t => {
    let cas = 0, blocked = 0;
    const sick = new Set();
    for (const { i, el } of parts) {
      const t0 = .3 + i * o.wave, tt = t - t0;
      if (tt <= 0) { el.setAttribute('opacity', 0); continue; }
      const lane = Math.floor(vxHash(i, 7) * lanes), hole = holeLanes.has(lane);
      const wallX = wx + lane * cw + cw / 2;
      if (!hole) {
        const x = Math.min(startX + speed * tt, wallX - 30);
        el.setAttribute('cx', x); el.setAttribute('cy', wcx);
        if (x >= wallX - 31) {
          blocked++;
          const age = tt - (wallX - 30 - startX) / speed;
          const f = Math.max(0, 1 - Math.max(0, age) * 2.2);
          flash[lane].setAttribute('opacity', (f * .85).toFixed(3));
          el.setAttribute('opacity', f.toFixed(3));
        } else el.setAttribute('opacity', 1);
      } else {
        const x = startX + speed * tt, person = persons[Math.floor(vxHash(i, 11) * persons.length)];
        el.setAttribute('cx', x); el.setAttribute('cy', wcx);
        if (x > wallX + 30) {
          if (x > person.x + 14) { el.setAttribute('opacity', 0); cas++; sick.add(person); }
          else el.setAttribute('opacity', 1);
        } else el.setAttribute('opacity', 1);
      }
    }
    for (const ps of persons) {
      const col = sick.has(ps) ? C_VIRUS : COL.chalk;
      put(ps.parts[0], { c_fill: col }); put(ps.parts[1], { c_fill: col });
    }
    casEl.textContent = vxNum(cas); blockedEl.textContent = vxNum(blocked);
    statusEl.textContent = o.cov >= .95 ? 'Le virus passe rarement : chaque chaîne finit par s’éteindre.'
      : o.cov >= .9 ? 'La propagation est freinée, mais des foyers persistent.'
      : 'Épidémie hors de contrôle : le virus traverse les trous du mur.';
    put(statusEl, { c_fill: o.cov >= .95 ? C_SEUIL : o.cov >= .9 ? C_CAS : C_VIRUS, o: 1 });
  }, o.D);
  return { casEl, blockedEl, statusEl };
}
/* A virus: a spiky circle. vxVirus(p, x, y, r, col, {spikes}). */
function vxVirus(p, x, y, r, col, spikes = 12) {
  const g = G(p, { x, y, o: 0 });
  for (let i = 0; i < spikes; i++) {
    const a = i / spikes * Math.PI * 2;
    path(g, `M${(r - 4) * Math.cos(a)} ${(r - 4) * Math.sin(a)}L${(r + 14) * Math.cos(a)} ${(r + 14) * Math.sin(a)}`,
      { stroke: col, 'stroke-width': 7, 'stroke-linecap': 'round' }, g);
  }
  mk('circle', { r, fill: col, opacity: .9 }, g);
  [[-.3, -.2, .22], [.3, .1, .18], [-.1, .35, .14]].forEach(([dx, dy, rr]) => {
    mk('circle', { cx: r * dx, cy: r * dy, r: r * rr, fill: COL.board, opacity: .55 }, g);
  });
  return g;
}
/* Ebook SVT components — panels, big numbers, chip rows/columns for notions & chains. */
function pcard(p, x, y, w, h, colr = COL.faint) {
  return mk('rect', { x, y, width: w, height: h, rx: 18, fill: COL.board, stroke: colr, 'stroke-width': 2, opacity: 0 }, p);
}
function ptitle(p, str, x, y, t0, { size = 34, fill = COL.chalk, anchor = 'start', weight = 600 } = {}) {
  const e = T(p, str, { x, y, size, fill, anchor, weight, o: 0 }); show(e, t0); return e;
}
function pbody(p, str, x, y, t0, { size = 26, fill = COL.dim, anchor = 'start', weight = 500, lineGap = 34 } = {}) {
  const els = [];
  str.split('\n').forEach((s, i) => { const e = T(p, s, { x, y: y + i * lineGap, size, fill, anchor, weight, o: 0 }); show(e, t0 + i * .15); els.push(e); });
  return els;
}
function pnum(p, x, y, num, label, colr, t0) {
  const c = pcard(p, x, y, 300, 130, colr); show(c, t0, .4);
  const n = T(p, num, { x: x + 150, y: y + 60, size: 64, fill: colr, anchor: 'middle', weight: 700, o: 0 }); show(n, t0 + .15, .4);
  const l = T(p, label, { x: x + 150, y: y + 102, size: 26, fill: COL.chalk, anchor: 'middle', weight: 600, o: 0 }); show(l, t0 + .3, .3);
  return { card: c, num: n, lab: l };
}
/* Two stacked bands (e.g. lithosphere / asthenosphere). bandsIn(g, t0) grows them. */
function bands(p, x, y, w, h, o) {
  const th = Math.max(30, Math.round(h * o.topShare || .34)), bh = h - th;
  g = { th, bh, x, y, w };
  g.top = mk('rect', { x, y, width: w, height: 0, rx: 12, fill: o.topCol || COL.task, opacity: 0 }, p);
  g.bot = mk('rect', { x, y: y + th, width: w, height: 0, rx: 12, fill: 'none', stroke: COL.faint, 'stroke-dasharray': '5 6', 'stroke-width': 3, opacity: 0 }, p);
  g.topT = T(p, o.topLabel, { x: x + w / 2, y: y + th / 2 + 8, size: 26, fill: COL.board, anchor: 'middle', weight: 700, o: 0 }, p);
  g.botT = T(p, o.botLabel, { x: x + w / 2, y: y + th + bh / 2 + 8, size: 22, fill: COL.dim, anchor: 'middle', weight: 600, o: 0 }, p);
  return g;
}
function bandsIn(g, t0, dur = 1) {
  tw(g.top, { a_height: g.th }, t0, dur); tw(g.bot, { a_height: g.bh, a_y: g.y + g.th }, t0, dur);
  show(g.topT, t0 + .35, .3); show(g.botT, t0 + .35, .3);
}
/* Horizontal chips row with drawable arrows between. chipsIn(row, i, t0) pops chip i + its arrow. */
function chipsRow(p, items, x, y, { size = 28, gap = 70 } = {}) {
  const row = { chips: [], arrows: [] }; let cx = x;
  items.forEach((it, i) => {
    if (i) {
      const sh = path(p, `M${cx + 10} ${y}H${cx + 50}`, { stroke: COL.dim, 'stroke-width': 4 }, { d: 0 });
      const hd = path(p, `M${cx + 40} ${y - 9}L${cx + 50} ${y}L${cx + 40} ${y + 9}`, { stroke: COL.dim, 'stroke-width': 4 }, { d: 0 });
      row.arrows.push({ sh, hd }); cx += gap;
    } else row.arrows.push(null);
    const w = textW(it.t, size) + 44;
    const chip = mk('rect', { x: cx, y: y - 30, width: w, height: 60, rx: 30, fill: it.col, opacity: .14, stroke: it.col, 'stroke-width': 2 }, p);
    const lab = T(p, it.t, { x: cx + w / 2, y: y + 6, size, fill: COL.chalk, anchor: 'middle', weight: 600 });
    row.chips.push({ chip, lab }); cx += w;
  });
  return row;
}
function chipsIn(row, i, t0) {
  const ch = row.chips[i]; pop(ch.chip, t0); show(ch.lab, t0 + .1, .3);
  const ar = row.arrows[i]; if (ar) { draw(ar.sh, t0 + .35, .35); draw(ar.hd, t0 + .35, .35); }
}
/* Vertical chips column (neural path, digestion...). chipsColIn(col, i, t0). */
function chipsCol(p, items, x, y, { size = 26, gap = 100 } = {}) {
  const col = { chips: [], arrows: [] }; let cy = y;
  items.forEach((it, i) => {
    if (i) {
      const sh = path(p, `M${x} ${cy - 22}V${cy - 8}`, { stroke: COL.dim, 'stroke-width': 4 }, { d: 0 });
      const hd = path(p, `M${x - 8} ${cy - 14}L${x} ${cy - 22}L${x + 8} ${cy - 14}`, { stroke: COL.dim, 'stroke-width': 4 }, { d: 0 });
      col.arrows.push({ sh, hd }); cy += 30;
    }
    const w = textW(it.t, size) + 44;
    const chip = mk('rect', { x: x - w / 2, y: cy - 26, width: w, height: 52, rx: 26, fill: it.col, opacity: .14, stroke: it.col, 'stroke-width': 2 }, p);
    const lab = T(p, it.t, { x, y: cy + 4, size, fill: COL.chalk, anchor: 'middle', weight: 600 });
    col.chips.push({ chip, lab }); cy += gap;
  });
  return col;
}
function chipsColIn(col, i, t0) {
  const ch = col.chips[i]; pop(ch.chip, t0); show(ch.lab, t0 + .1, .3);
  const ar = col.arrows[i]; if (ar) { draw(ar.sh, t0 + .35, .35); draw(ar.hd, t0 + .35, .35); }
}