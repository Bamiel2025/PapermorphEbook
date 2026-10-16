'use strict';
(() => {
  let k = 0;
  const P = (d, cls = '', extra = '') => `<path class="d ${cls}" pathLength="1" style="--k:${k++}" d="${d}" ${extra}/>`;
  const Tx = (x, y, s, size = 24, cls = '', anchor = 'start') => `<text class="t ${cls}" style="--k:${k++}" x="${x}" y="${y}" font-size="${size}" text-anchor="${anchor}">${s}</text>`;
  const C = (cx, cy, r, cls = '') => `<circle class="d ${cls}" pathLength="1" style="--k:${k++}" cx="${cx}" cy="${r + cy}" r="${r}"/>`;
  const reset = s => { k = 0; return s; };
  // Unité 1 : globe et plaques (dorsale en hausse, fosse en baisse)
  window.UNIT_ART = [
    reset(
      `<circle cx="300" cy="90" r="70" fill="none" stroke="currentColor" stroke-width="3" style="--k:${k++}"/>` +
      `<path d="M270 160 Q300 140 330 160" fill="none" stroke="currentColor" stroke-width="3" style="--k:${k++}"/>` +
      `<path d="M250 120 L300 180 L350 120" fill="none" stroke="currentColor" stroke-width="3" style="--k:${k++}"/>` +
      Tx(300, 30, 'la Terre active', 22, 'a') +
      Tx(180, 150, 'séismes · volcans', 16, 'a') +
      Tx(420, 150, 'dorsales · subduction', 16, 'a')
    ),
    // Unité 2 : ADN (double hélice schématique)
    reset(
      `<path d="M240 60 Q260 40 280 60 T320 60 T360 60" fill="none" stroke="currentColor" stroke-width="3" style="--k:${k++}"/>` +
      `<path d="M240 120 Q260 140 280 120 T320 120 T360 120" fill="none" stroke="currentColor" stroke-width="3" style="--k:${k++}"/>` +
      Array.from({length: 6}, (_, i) => {
        const x = 240 + i * 24;
        return `<path d="M${x} 60 L${x} 120" stroke="currentColor" stroke-width="2" style="--k:${++k}"/>`;
      }).join('') +
      Tx(300, 20, 'ADN · gènes · allèles', 22, 'a') +
      Tx(180, 150, '23 paires de chromosomes', 16, 'a') +
      Tx(420, 150, 'méiose · fécondation', 16, 'a')
    ),
    // Unité 3 : cœur / neurone schématique
    reset(
      `<path d="M220 80 Q260 40 300 80 T340 80 T380 80 Q360 40 340 80" fill="none" stroke="currentColor" stroke-width="3" style="--k:${k++}"/>` +
      `<circle cx="300" cy="90" r="4" fill="currentColor" style="--k:${++k}"/>` +
      `<path d="M300 90 L300 140" stroke="currentColor" stroke-width="3" style="--k:${++k}"/>` +
      `<circle cx="280" cy="150" r="6" fill="currentColor" style="--k:${++k}"/>` +
      `<circle cx="320" cy="150" r="6" fill="currentColor" style="--k:${++k}"/>` +
      Tx(300, 20, 'neurones · hormones · reproduction', 22, 'a') +
      Tx(180, 150, 'cerveau · synapses', 16, 'a') +
      Tx(420, 150, 'puberté · cycles', 16, 'a')
    ),
  ];
})();
