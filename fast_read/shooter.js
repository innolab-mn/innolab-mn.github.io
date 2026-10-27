import { profileStorage } from './profiles-store.js';
import { beginnerWordIds, wordLetters, missingLetterExercise, missingLetterIsCorrect, letterTargets, shooterStars } from './shooter-logic.js';

const KEY = 'fast-read-shooter-v1';
let saved = { learned: [], rounds: 0, best: 0 };
try {
  const value = JSON.parse(profileStorage.getItem(KEY));
  if (Array.isArray(value?.learned)) saved.learned = [...new Set(value.learned.filter(id => typeof id === 'string'))];
  if (Number.isInteger(value?.rounds) && value.rounds >= 0) saved.rounds = value.rounds;
  if ([1, 2, 3].includes(value?.best)) saved.best = value.best;
} catch { /* A new profile can play without storage. */ }
let main, hooks, words, round, events;
let moving = true, allWords = false;
const $ = selector => main.querySelector(selector);

function save() {
  try { profileStorage.setItem(KEY, JSON.stringify(saved)); }
  catch { hooks.toast('Ахиц хадгалагдсангүй. Тоглоомоо үргэлжлүүлж болно.'); }
}
export function resetShooter() {
  round = null;
  saved = { learned: [], rounds: 0, best: 0 };
  try { profileStorage.removeItem(KEY); } catch { /* The profile can still reset in memory. */ }
}
export function leaveShooter() {
  events?.abort();
  round = null;
}
export function renderShooter(collection, callbacks) {
  leaveShooter();
  words = collection; hooks = callbacks; main = callbacks.main;
  events = new AbortController();
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && round && !round.finished) setPaused(true);
  }, { signal: events.signal });
  lobby();
}
function lobby() {
  round = null;
  main.innerHTML = `<section class="shoot-intro"><div><span class="eyebrow">ОНИЛООД · ҮСГЭЭ СОНГООД · ҮГ БҮТЭЭЕ</span><h1>Үсгийн <em>одон харваа</em></h1><p>Дутуу ганц үсгийг олж харваарай.<br><strong>а*в</strong> → а → <strong>аав</strong>!</p><div class="shoot-example" aria-label="а, дутуу үсэг, в"><span>а</span><span>*</span><span>в</span><b>✦</b></div></div><div class="shoot-mascot" aria-hidden="true"><span>✧</span><b>а</b><i>✦</i></div></section>
    <div class="shoot-summary"><span><b>${saved.learned.filter(id => words.some(word => word.id === id)).length}</b> / ${words.length} бүтээсэн үг</span><span><b>${saved.rounds}</b> дуусгасан аялал</span><span><b>${saved.best ? '★'.repeat(saved.best) : '☆'}</b> шилдэг од</span></div>
    <section class="shoot-setup" aria-labelledby="shoot-setup-title"><h2 id="shoot-setup-title">Харваагаа бэлдэе</h2><div class="shoot-options"><label><input id="shoot-motion" type="checkbox" ${moving ? 'checked' : ''}> Үсгүүд хөвж хөдөлнө</label><label><input id="shoot-all" type="checkbox" ${allWords ? 'checked' : ''}> Бүх ${words.length} үгээр тоглоно <small>Эхлээд 5 хялбар үг</small></label></div><button id="shoot-start" class="primary-button">Харваж эхлэх ✦</button></section>
    <aside class="lesson-guide shoot-guide"><strong>Яаж тоглох вэ?</strong><p>Үгийн нэг үсэг * тэмдгээр нуугдана. Жишээ нь «а*в»-ийн дутуу «а» үсгийг харваарай. Зөв, буруу нь шууд мэдэгдэнэ. Буруу бол дахин оролдож, зөв бол дараагийн үг рүү шилжинэ. Хугацааны шахалтгүй.</p></aside>`;
  $('#shoot-motion').onchange = event => { moving = event.target.checked; };
  $('#shoot-all').onchange = event => { allWords = event.target.checked; };
  $('#shoot-start').onclick = () => {
    const pool = allWords ? words : beginnerWordIds.map(id => words.find(word => word.id === id)).filter(Boolean);
    round = { pool, index: 0, choice: null, mistakes: 0, solved: false, paused: false, finished: false };
    drawRound(); window.scrollTo(0, 0);
  };
}
function currentWord() { return round.pool[round.index]; }
function drawRound() {
  const word = currentWord();
  round.exercise = missingLetterExercise(word.text, (Math.floor(wordLetters(word.text).length / 2) + round.index) % wordLetters(word.text).length);
  const targets = letterTargets(round.exercise.answer);
  round.choice = null; round.solved = false; round.paused = false;
  main.innerHTML = `<section class="shoot-game"><header class="shoot-toolbar"><button class="secondary-button" id="shoot-exit">← Буцах</button><span>Үг <b>${round.index + 1} / ${round.pool.length}</b></span><button class="secondary-button" id="shoot-pause">Түр зогсоох</button></header><div class="shoot-progress" aria-label="Аяллын ахиц"><span style="width:${round.index / round.pool.length * 100}%"></span></div>
    <div class="shoot-prompt"><img src="${word.image}" alt="Дутуу үсгийг нь олох зураг"><div><span class="eyebrow">НЭГ ҮСЭГ ДУТУУ БАЙНА</span><h1>Дутуу үсгийг олъё</h1><p>Ганц үсэг харвана · Хариу шууд гарна</p></div></div>
    <div class="shoot-slots" role="group" aria-label="Дутуу үсэгтэй үг"></div>
    <div class="shoot-stage ${moving ? '' : 'is-still'}" style="--shoot-columns:${targets.length > 6 ? 4 : 3}"><span class="shoot-sky-star star-one" aria-hidden="true">✦</span><span class="shoot-sky-star star-two" aria-hidden="true">✧</span><span class="shoot-sky-star star-three" aria-hidden="true">✦</span><div class="shoot-targets" aria-label="Харвах үсгүүд">${targets.map((letter, index) => `<button class="shoot-target tone-${index % 4}" data-shoot-letter="${letter}" style="--float-delay:${-index * 0.7}s;--float-duration:${4 + index % 3}s" aria-label="${letter} үсгийг харвах"><span>${letter}</span><small aria-hidden="true">✧</small></button>`).join('')}</div><div class="shoot-launcher" aria-hidden="true"><span>✦</span><b>ОДОН ХАРВАА</b></div><div class="shoot-paused" hidden><b>Харваа түр зогссон</b><span>Үргэлжлүүлэх товчоо дараарай.</span></div></div>
    <div class="shoot-feedback" role="status" aria-live="polite"></div><div class="shoot-controls"><button id="shoot-next" class="primary-button" hidden>${round.index + 1 === round.pool.length ? 'Амжилтаа харах ✦' : 'Дараагийн үг →'}</button></div><p class="shoot-keyboard">Үсэг бүр товчтой. Tab-аар сонгоод Enter эсвэл зайгаар харваж болно.</p></section>`;
  main.querySelectorAll('[data-shoot-letter]').forEach(button => button.onclick = () => shoot(button));
  $('#shoot-next').onclick = () => {
    if (!round.solved) return;
    if (++round.index < round.pool.length) drawRound(); else finish();
  };
  $('#shoot-exit').onclick = lobby;
  $('#shoot-pause').onclick = () => setPaused(!round.paused);
  update();
}
function update() {
  const exercise = round.exercise;
  $('.shoot-slots').innerHTML = exercise.letters.map((letter, index) => {
    const gap = index === exercise.index;
    return `<span class="shoot-slot ${gap ? 'is-gap' : 'is-filled'} ${round.solved ? 'is-correct' : ''}">${gap && !round.solved ? '<i aria-hidden="true">*</i>' : letter}</span>`;
  }).join('');
  $('.shoot-slots').setAttribute('aria-label', round.solved ? `Зөв үг: ${exercise.letters.join('')}` : `Үсгүүд: ${exercise.letters.map((letter,index) => index === exercise.index ? 'дутуу үсэг' : letter).join(', ')}`);
  main.querySelectorAll('[data-shoot-letter]').forEach(button => { button.disabled = round.paused || round.solved; });
  $('#shoot-next').hidden = !round.solved;
  $('#shoot-next').disabled = round.paused;
  if (round.choice === null) $('.shoot-feedback').textContent = 'Одтой нүдэнд ямар үсэг орох вэ? Тэр үсгээ харваарай.';
}
function shoot(button) {
  if (!round || round.paused || round.solved) return;
  round.choice = button.dataset.shootLetter;
  main.querySelectorAll('.was-wrong').forEach(target => target.classList.remove('was-wrong'));
  const stage = $('.shoot-stage');
  const area = stage.getBoundingClientRect(), target = button.getBoundingClientRect();
  const startX = area.width / 2, startY = area.height - 40;
  const dx = target.left + target.width / 2 - area.left - startX;
  const dy = target.top + target.height / 2 - area.top - startY;
  const ray = document.createElement('span'); ray.className = 'shoot-ray'; ray.setAttribute('aria-hidden', 'true');
  ray.style.cssText = `left:${startX}px;top:${startY}px;width:${Math.hypot(dx, dy)}px;transform:rotate(${Math.atan2(dy, dx)}rad)`;
  stage.append(ray); ray.addEventListener('animationend', () => ray.remove(), { once: true });
  // Reduced-motion mode has no animationend event.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) ray.remove();
  check(button);
}
function check(button) {
  const correct = missingLetterIsCorrect(round.exercise, round.choice);
  hooks.chime(correct);
  if (correct) {
    round.solved = true;
    saved.learned = [...new Set([...saved.learned, currentWord().id])]; save(); update();
    $('.shoot-feedback').className = 'shoot-feedback is-success';
    $('.shoot-feedback').textContent = `✦ Зөв! «${round.choice}» үсэг орж «${round.exercise.letters.join('')}» боллоо!`;
    $('.shoot-stage').classList.add('is-solved');
    $('.shoot-prompt img').alt = currentWord().text;
  } else {
    round.mistakes++;
    button.classList.add('was-wrong');
    $('.shoot-feedback').className = 'shoot-feedback is-retry';
    $('.shoot-feedback').textContent = `«${round.choice}» тохирохгүй байна. Дутуу үсгийг дахин онилоорой!`;
  }
}
function setPaused(value) {
  if (!round || round.finished) return;
  round.paused = value;
  $('.shoot-stage').classList.toggle('is-paused', value);
  $('.shoot-paused').hidden = !value;
  $('#shoot-pause').textContent = value ? 'Үргэлжлүүлэх' : 'Түр зогсоох';
  update();
}
function finish() {
  round.finished = true;
  const stars = shooterStars(round.mistakes);
  saved.rounds++; saved.best = Math.max(saved.best, stars); save();
  main.innerHTML = `<section class="shoot-finish"><span class="eyebrow">ҮСГИЙН ОДОН ХАРВАА</span><div class="shoot-finish-star" aria-hidden="true">✦</div><h1>${round.pool.length} үгээ бүтээлээ!</h1><div class="shoot-earned" aria-label="${stars} од">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><p>Дутуу үсгүүдийг зөв олж чадлаа.<br>${round.mistakes ? `${round.mistakes} удаа засаад, бүх үгээ гүйцээлээ.` : 'Бүх дутуу үсгийг эхний харвалтаар зөв оллоо!'}</p><div class="shoot-word-recap">${round.pool.map(word => `<span>${word.text.toLocaleLowerCase('mn')}</span>`).join('')}</div><button id="shoot-again" class="primary-button">Дахин харвах ↻</button><a href="#home" class="secondary-button">Миний аялал</a></section>`;
  $('#shoot-again').onclick = lobby;
  window.scrollTo(0, 0);
}
