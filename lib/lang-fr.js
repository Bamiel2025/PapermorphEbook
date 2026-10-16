/* French interface for this book.
   The lesson engine (engine.js) ships en and ru; this file adds fr to its table and re-labels the frame it built at
   load. On the cover, contents.js keeps its own private table, so its English output is re-labelled by walking the
   finished DOM: call frContentsLabels() after Contents.book(). The shared engine copies themselves are not edited. */
'use strict';
const FR = {
  /* engine.js */
  decimalSign: ',', stageLabel: 'Animation de la leçon', stageLabelTitled: 'Animation de la leçon : {title}',
  shortcuts: 'Raccourcis clavier', lesson: 'Leçon', questions: 'Questions',
  helpPlay: 'Lecture ou pause', helpStep: 'Étape précédente ou suivante', helpStepInQuestion: 'Changer d’étape pendant une question',
  helpRestart: 'Recommencer', helpCaptions: 'Sous-titres activés ou non', helpSpeed: 'Ralentir ou accélérer',
  helpFullScreen: 'Plein écran', helpList: 'Afficher cette liste', helpChoose: 'Choisir une réponse', helpTrueFalse: 'Vrai ou faux',
  helpRows: 'Passer d’une ligne à l’autre', helpNumberLine: 'Se déplacer sur la droite numérique', helpEnter: 'Vérifier, puis continuer',
  helpShowAnswer: 'Afficher la réponse', helpLeaveBox: 'Quitter une zone de réponse', helpClose: 'Appuie sur {key} pour fermer.',
  paused: 'En pause. Appuie sur espace ou clique pour continuer.',
  soundFailed: 'Le son n’a pas pu être lu. La leçon continue avec le texte à l’écran.',
  startLesson: 'Commencer la leçon', coverKeys: 'Appuie sur {space} pour commencer, {help} pour les raccourcis.', spaceKey: 'Espace',
  chapterNumber: 'Chapitre {n}', aboutMinutes: 'Environ {n} minutes, avec le son et les vérifications.',
  allChapters: 'Tous les chapitres', playLabel: 'Lecture ou pause (espace)', backLabel: 'Étape précédente (flèche gauche)',
  restartLabel: 'Recommencer la leçon', volumeLabel: 'Régler le volume', volumeTitle: 'Volume (0 = silence)', volumeSlider: 'Volume',
  helpLabel: 'Raccourcis clavier (?)', speedLabel: 'Vitesse de lecture (< et >)', captionsLabel: 'Sous-titres (C)',
  fullScreenLabel: 'Plein écran', goToStep: 'Aller à l’étape {n} : {title}',
  quickCheck: 'Vérification rapide', countOf: '{k} sur {n}', check: 'Vérifier', showAnswer: 'Afficher la réponse',
  nextQuestion: 'Question suivante', continue: 'Continuer', correct: 'Correct. ', notQuite: 'Pas tout à fait. ',
  answerPrefix: 'Réponse : ', keysPrefix: 'Touches : ',
  hintMove: ' se déplacer, ', hintChoose: ' choisir', hintChooseOrClickGrid: ' choisir, ou cliquer dans la grille',
  hintMoveAlongLine: ' se déplacer sur la droite, ', hintChooseOrClick: ' choisir, ou cliquer', hintRow: ' ligne, ',
  hintTypeFraction: 'saisis des nombres comme 3/4 ou −2 1/4, ', hintTypeNumber: 'saisis le nombre, ',
  hintTypeDecimal: 'saisis le nombre, ', hintNextBox: ' case suivante, ', hintCheck: ' vérifier, ', hintLeaveBox: ' quitter la case',
  hintPickNumber: ' choisir un nombre, ', hintPickRing: ' choisir sa bague',
  rowsRight: '{r} sur {n} sont justes. Corrige les lignes marquées ✗ et revérifie.',
  choicesShown: 'les bonnes réponses sont maintenant sélectionnées.', numbersShown: 'les bons nombres sont maintenant saisis.',
  notPlacedYet: '{x} n’est pas encore placé.',
  realRingIsEmpty: '{x} : tout nombre réel est rationnel ou irrationnel, cet espace n’a donc pas de nombre à lui.',
  ringsRight: '{r} sur {n} dans la bonne bague.', ringsShown: 'chaque nombre est maintenant dans sa plus petite bague.',
  chipPlaced: '{x}, placé dans {ring}', chipNotPlaced: '{x}, non placé', pointLabel: 'Le point {v}', answerBox: 'Réponse',
  stepsLeftOfZero: '{n} pas à gauche de 0',
  natural: 'Naturels', whole: 'Entiers', integers: 'Relatifs', rational: 'Rationnels', irrational: 'Irrationnels',
  real: 'Réels', integerColumn: 'Relatifs', trueLabel: 'Vrai', falseLabel: 'Faux',
  chapterComplete: 'Chapitre {n} terminé', quickChecks: 'Vérifications rapides', chapterPractice: 'Pratique du chapitre',
  firstTryScore: '{name} : {r} sur {t} dès la première tentative.', notAttempted: '{name} : non tenté.',
  watchAgain: 'Revoir', nextChapter: 'Chapitre suivant',
  /* contents.js */
  open: 'Ouvrir le livre', toCover: 'Retour à la couverture', resume: 'Continuer · Chapitre {n}', unit: 'Partie {n}',
  minutes: '{n} min', meta: '{chapters}{samples} · {units} · avec le son',
  metaChapters: { one: '{n} chapitre', other: '{n} chapitres' }, metaUnits: { one: '{n} partie', other: '{n} parties' },
  metaSamples: ' + {n} essai', sampleUnit: ' · Chapitre d’essai, un autre style',
  chapterCount: { one: '{n} chapitre', other: '{n} chapitres' }, finished: '{done} sur {n} terminés',
  doneMark: '✓ Terminé · ', lastMark: ' · Dernier ouvert',
};
// Lessons: add fr to the engine's table (typeof keeps this file usable on the cover, where engine.js never loads).
if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS) TRANSLATIONS.fr = FR;
window.FR = FR;

/* engine.js built its frame with English labels at load; re-label the static nodes once. */
(function relabelFrame() {
  if (!document.querySelector('#stage')) return;   // the cover has no #frame
  const qa = s => document.querySelectorAll(s);
  qa('.paused-mark div').forEach(el => { el.textContent = FR.paused; });
  const note = document.querySelector('#soundNote');
  if (note) note.textContent = FR.soundFailed;
  const stage = document.querySelector('#stage');
  stage.setAttribute('aria-label', FR.stageLabel);
  const help = document.querySelector('#help');
  if (help) {
    help.setAttribute('aria-label', FR.shortcuts);
    const hs = help.querySelectorAll('h2, h3');
    if (hs[0]) hs[0].textContent = FR.shortcuts;
    if (hs[1]) hs[1].textContent = FR.lesson;
    if (hs[2]) hs[2].textContent = FR.questions;
    ['helpPlay', 'helpStep', 'helpStepInQuestion', 'helpRestart', 'helpCaptions', 'helpSpeed', 'helpFullScreen',
      'helpList', 'helpChoose', 'helpTrueFalse', 'helpRows', 'helpNumberLine', 'helpEnter', 'helpShowAnswer', 'helpLeaveBox']
      .forEach((k, i) => { const dd = help.querySelectorAll('dd')[i]; if (dd) dd.textContent = FR[k]; });
    const close = help.querySelector('.help-close');
    if (close) close.innerHTML = FR.helpClose.replace('{key}', '<kbd>Échap</kbd>');
  }
  const cover = document.querySelector('#cover');
  if (cover) {
    const go = cover.querySelector('.go');
    if (go && go.lastChild) go.lastChild.textContent = ' ' + FR.startLesson;
    const small = cover.querySelector('small');
    if (small) small.innerHTML = '<span id="coverMeta"></span> ' + FR.coverKeys.replace('{space}', '<kbd>Espace</kbd>').replace('{help}', '<kbd>?</kbd>');
  }
})();

/* The cover and contents are built by contents.js with its own English strings; re-label the finished DOM.
   Call it after Contents.book() on the cover. */
function frContentsLabels() {
  const rules = [
    [/^Open the book$/, FR.open], [/^Back to the cover$/, FR.toCover],
    [/^Unit (\d+)$/, 'Partie $1'],
    [/(\d+) chapters?\b/g, '$1 chapitres'], [/(\d+) units?\b/g, '$1 parties'], [/(\d+) parts?\b/g, '$1 parties'],
    [/· with sound/, '· avec le son'],
    [/(\d+) of (\d+) finished/, '$1 sur $2 terminés'],
    [/^Continue · Chapter (\d+)$/, 'Continuer · Chapitre $1'],
    [/^✓ Finished · /, FR.doneMark], [/^ · Last opened$/, FR.lastMark],
    [/^Sample chapter, another look$/, 'Chapitre d’essai, un autre style'],
  ];
  const fix = node => {
    for (const n of node.childNodes) {
      if (n.nodeType === 3) {
        let v = n.nodeValue;
        for (const [re, to] of rules) v = v.replace(re, to);
        n.nodeValue = v;
      } else if (n.nodeType === 1 && n.childNodes.length) fix(n);
    }
  };
  fix(document.body);
}
