import { profileStorage } from './profiles-store.js';
import { beginnerWordIds, wordLetters, missingLetterIsCorrect, shooterStars, createShooterPlan, SHOOTER_RANKS, shooterRank } from './shooter-logic.js';
import { createAudioSequence, shooterFeedbackClips, shooterWrongClips, shooterWordClip } from './shooter-audio.js';
import { pauseControlMarkup } from './play-controls.js';

const KEY = 'fast-read-shooter-v1';
let saved = { learned: [], rounds: 0, best: 0 };
try {
  const value = JSON.parse(profileStorage.getItem(KEY));
  if (Array.isArray(value?.learned)) saved.learned = [...new Set(value.learned.filter(id => typeof id === 'string'))];
  if (Number.isInteger(value?.rounds) && value.rounds >= 0) saved.rounds = value.rounds;
  if ([1, 2, 3].includes(value?.best)) saved.best = value.best;
} catch { /* A new profile can play without storage. */ }
let main, hooks, words, round, events, rewardDialog;
const audioSequence=createAudioSequence();
let moving = true, poolMode = 'starter';
const $ = selector => main.querySelector(selector);

function save() {
  try { profileStorage.setItem(KEY, JSON.stringify(saved)); }
  catch { hooks.toast('Ахиц хадгалагдсангүй. Тоглоомоо үргэлжлүүлж болно.'); }
}
export function resetShooter() {
  stopWordAudio();
  round = null;
  saved = { learned: [], rounds: 0, best: 0 };
  try { profileStorage.removeItem(KEY); } catch { /* The profile can still reset in memory. */ }
}
export function leaveShooter() {
  events?.abort();
  stopWordAudio();
  if(rewardDialog?.open)rewardDialog.close();
  round = null;
}
function stopWordAudio(){ audioSequence.stop(); }
function audioError(){
  if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='Дуу тоглоогүй бол дахин сонсох товчийг дараарай.';
}
function playWord(){
  if(!round||round.paused)return;
  if(!hooks.isSoundOn()){
    if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='Дууг тохиргооноос нээгээрэй.';
    return;
  }
  if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='';
  if(!audioSequence.play([shooterWordClip(currentWord().id)],audioError))audioError();
}
function playFeedback(){
  if(!round||round.paused||!round.solved)return;
  if(!hooks.isSoundOn()){
    if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='Дууг тохиргооноос нээгээрэй.';
    return;
  }
  if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='';
  if(!audioSequence.play(shooterFeedbackClips(round.exercise.answer,currentWord().id),audioError))audioError();
}
function playWrongFeedback(){
  if(!round||round.paused||round.solved||round.choice===null)return;
  if(!hooks.isSoundOn()){
    if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='Дууг тохиргооноос нээгээрэй.';
    return;
  }
  if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='';
  if(!audioSequence.play(shooterWrongClips(round.choice),audioError))audioError();
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
  stopWordAudio();
  round = null;
  const {count,rank}=shooterRank(saved.learned,words);
  const next=SHOOTER_RANKS[rank===null?0:rank+1];
  main.innerHTML = `<section class="shoot-intro"><div><span class="eyebrow">ОНИЛООД · ҮСГЭЭ СОНГООД · ҮГ БҮТЭЭЕ</span><h1>Үсгийн <em>одон харваа</em></h1><p>Дутуу ганц үсгийг олж харваарай.<br><strong>а*в</strong> → а → <strong>аав</strong>!</p><div class="shoot-example" aria-label="а, дутуу үсэг, в"><span>а</span><span>*</span><span>в</span><b>✦</b></div></div><div class="shoot-mascot" aria-hidden="true"><span>✧</span><b>а</b><i>✦</i></div></section>
    <div class="shoot-summary"><span><b>${count}</b> / ${words.length} бүтээсэн үг</span><span><b>${saved.rounds}</b> дуусгасан аялал</span><span><b>${saved.best ? '★'.repeat(saved.best) : '☆'}</b> шилдэг од</span></div><section class="shoot-rank" aria-label="Одон харвааны цол"><span class="shoot-rank-icon">${rank===null?'🏹':SHOOTER_RANKS[rank].icon}</span><div><small>ОДОН ХАРВААНЫ ЦОЛ · ${rank===null?'ЭХЭЛЦГЭЭЕ':`${rank+1} / 9`}</small><h2>${rank===null?'Эхний үгээ бүтээгээрэй':SHOOTER_RANKS[rank].name}</h2><p>${next?`Дараагийн цол: ${next.name} · ${next.min} өөр үг`:'Бүх цолыг хүртлээ!'}</p></div><details><summary>9 цолыг харах</summary><ol>${SHOOTER_RANKS.map(item=>`<li>${item.icon} ${item.name} · ${item.min} үг</li>`).join('')}</ol></details></section>
    <section class="shoot-setup" aria-labelledby="shoot-setup-title"><h2 id="shoot-setup-title">Харваагаа бэлдэе</h2><div class="shoot-options"><label><input id="shoot-motion" type="checkbox" ${moving ? 'checked' : ''}> Үсгүүд хөвж хөдөлнө</label><label>Үгийн багц <select id="shoot-pool" aria-label="Үгийн багц"><option value="starter" ${poolMode==='starter'?'selected':''}>Эхний 5 хялбар үг</option><option value="classic" ${poolMode==='classic'?'selected':''}>Эхний 20 үг</option><option value="extra" ${poolMode==='extra'?'selected':''}>Шинэ 20 үг</option><option value="all" ${poolMode==='all'?'selected':''}>Бүх ${words.length} үг</option></select></label></div><button id="shoot-start" class="primary-button">Харваж эхлэх ✦</button></section>
    <aside class="lesson-guide shoot-guide"><strong>Яаж тоглох вэ?</strong><p>Үгийн нэг үсэг * тэмдгээр нуугдана. Жишээ нь «а*в»-ийн дутуу «а» үсгийг харваарай. Үгийн бүх байрлалын үсгийг ээлжлэн олно. Үг бүрийг дуусгахад цолын ахиц нэмэгдэнэ. Хугацааны шахалтгүй.</p></aside>`;
  $('#shoot-motion').onchange = event => { moving = event.target.checked; };
  $('#shoot-pool').onchange = event => { poolMode = event.target.value; };
  $('#shoot-start').onclick = () => {
    const pool = poolMode==='all'?words:poolMode==='extra'?words.filter(word=>word.id.startsWith('extra-')):poolMode==='classic'?words.filter(word=>!word.id.startsWith('extra-')):beginnerWordIds.map(id => words.find(word => word.id === id)).filter(Boolean);
    const plan=createShooterPlan(pool);
    round = { plan,pool:plan.map(item=>item.word), index: 0, letterStep:0, choice: null, mistakes: 0, solved: false, paused: false, finished: false };
    drawRound(); window.scrollTo(0, 0);
  };
}
function currentWord() { return round.pool[round.index]; }
function drawRound() {
  const word = currentWord();
  const length=wordLetters(word.text).length;
  const task=round.plan[round.index].steps[round.letterStep];
  round.exercise = task.exercise;
  const targets = task.targets;
  round.choice = null; round.solved = false; round.paused = false;
  main.innerHTML = `<section class="shoot-game"><header class="shoot-toolbar"><button class="kid-control kid-control-back" id="shoot-exit"><span class="kid-control-icon" aria-hidden="true">←</span><span>Буцах</span></button><span>Үг <b>${round.index + 1} / ${round.pool.length}</b></span><button class="kid-control kid-control-pause" id="shoot-pause">${pauseControlMarkup(false)}</button></header><div class="shoot-progress" aria-label="Аяллын ахиц"><span style="width:${round.index / round.pool.length * 100}%"></span></div>
    <div class="shoot-prompt"><img src="${word.image}" alt="Дутуу үсгийг нь олох зураг"><div><span class="eyebrow">ҮСЭГ ${round.letterStep+1} / ${length} · НЭГ ҮСЭГ ДУТУУ</span><h1>Дутуу үсгийг олъё</h1><p>Үгийн бүх үсгийг ээлжлэн харвана</p><button class="shoot-audio-button" type="button" id="shoot-audio">🔊 Үгийг сонсох</button><small class="shoot-audio-status" role="status"></small></div></div>
    <div class="shoot-slots" role="group" aria-label="Дутуу үсэгтэй үг"></div>
    <div class="shoot-stage ${moving ? '' : 'is-still'}" style="--shoot-columns:${targets.length > 6 ? 4 : 3}"><span class="shoot-sky-star star-one" aria-hidden="true">✦</span><span class="shoot-sky-star star-two" aria-hidden="true">✧</span><span class="shoot-sky-star star-three" aria-hidden="true">✦</span><div class="shoot-targets" aria-label="Харвах үсгүүд">${targets.map((letter, index) => `<button class="shoot-target tone-${index % 4}" data-shoot-letter="${letter}" style="--float-delay:${-index * 0.7}s;--float-duration:${4 + index % 3}s" aria-label="${letter} үсгийг харвах"><span>${letter}</span><small aria-hidden="true">✧</small></button>`).join('')}</div><div class="shoot-launcher" aria-hidden="true"><span>✦</span><b>ОДОН ХАРВАА</b></div><div class="shoot-paused" hidden role="region" aria-label="Харваа түр зогссон"><div class="kid-pause-card"><span class="kid-pause-symbol" aria-hidden="true">Ⅱ</span><b>Харваа түр зогслоо</b><p>Бэлэн болвол үргэлжлүүлээрэй.</p><div class="kid-pause-actions"><button id="shoot-resume" class="kid-control kid-control-resume">${pauseControlMarkup(true)}</button><button id="shoot-paused-exit" class="kid-control kid-control-back"><span class="kid-control-icon" aria-hidden="true">←</span><span>Буцах</span></button></div></div></div></div>
    <div class="shoot-feedback" role="status" aria-live="polite"></div><div class="shoot-controls"><button id="shoot-next" class="primary-button" hidden>${round.letterStep+1<length?'Дараагийн үсэг →':round.index + 1 === round.pool.length ? 'Амжилтаа харах ✦' : 'Дараагийн үг →'}</button></div><p class="shoot-keyboard">Үсэг бүр товчтой. Tab-аар сонгоод Enter эсвэл зайгаар харваж болно.</p></section>`;
  main.querySelectorAll('[data-shoot-letter]').forEach(button => button.onclick = () => shoot(button));
  $('#shoot-next').onclick = () => {
    if (!round.solved) return;
    if (++round.letterStep < length) { drawRound(); return; }
    round.letterStep=0;
    if (++round.index < round.pool.length) drawRound(); else finish();
  };
  $('#shoot-audio').onclick = playWord;
  $('#shoot-exit').onclick = lobby;
  $('#shoot-paused-exit').onclick = lobby;
  $('#shoot-resume').onclick = () => setPaused(false);
  $('#shoot-pause').onclick = () => setPaused(!round.paused);
  update();
  playWord();
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
  $('#shoot-audio').disabled = round.paused;
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
  if (correct) {
    round.solved = true;
    const before=shooterRank(saved.learned,words).rank;
    if(round.letterStep+1===round.exercise.letters.length) {
      saved.learned = [...new Set([...saved.learned, currentWord().id])]; save();
    }
    const after=shooterRank(saved.learned,words).rank;
    update();
    $('.shoot-feedback').className = 'shoot-feedback is-success';
    $('.shoot-feedback').textContent = `✦ Зөв! «${round.choice}» үсэг орж «${round.exercise.letters.join('')}» боллоо!`;
    $('.shoot-stage').classList.add('is-solved');
    $('.shoot-prompt img').alt = currentWord().text;
    $('#shoot-audio').textContent='🔊 Хариуг дахин сонсох';
    $('#shoot-audio').onclick=playFeedback;
    playFeedback();
    if(after!==null&&(before===null||after>before))celebrateShooter(after);
  } else {
    round.mistakes++;
    button.classList.add('was-wrong');
    $('.shoot-feedback').className = 'shoot-feedback is-retry';
    $('.shoot-feedback').textContent = `«${round.choice}» тохирохгүй байна. Дутуу үсгийг дахин онилоорой!`;
    $('#shoot-audio').textContent='🔊 Хариуг дахин сонсох';
    $('#shoot-audio').onclick=playWrongFeedback;
    playWrongFeedback();
  }
}
function setPaused(value) {
  if (!round || round.finished) return;
  const fromPanel=!value&&document.activeElement===$('#shoot-resume');
  round.paused = value;
  if(value)stopWordAudio();
  $('.shoot-stage').classList.toggle('is-paused', value);
  $('.shoot-paused').hidden = !value;
  $('#shoot-pause').innerHTML = pauseControlMarkup(value);
  $('#shoot-pause').classList.toggle('kid-control-resume',value);
  $('#shoot-pause').classList.toggle('kid-control-pause',!value);
  update();
  if(fromPanel)$('#shoot-pause').focus({preventScroll:true});
}
function finish() {
  stopWordAudio();
  round.finished = true;
  const stars = shooterStars(round.mistakes);
  saved.rounds++; saved.best = Math.max(saved.best, stars); save();
  main.innerHTML = `<section class="shoot-finish"><span class="eyebrow">ҮСГИЙН ОДОН ХАРВАА</span><div class="shoot-finish-star" aria-hidden="true">✦</div><h1>${round.pool.length} үгээ бүтээлээ!</h1><div class="shoot-earned" aria-label="${stars} од">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div><p>Дутуу үсгүүдийг зөв олж чадлаа.<br>${round.mistakes ? `${round.mistakes} удаа засаад, бүх үгээ гүйцээлээ.` : 'Бүх дутуу үсгийг эхний харвалтаар зөв оллоо!'}</p><div class="shoot-word-recap">${round.pool.map(word => `<span>${word.text.toLocaleLowerCase('mn')}</span>`).join('')}</div><button id="shoot-again" class="primary-button">Дахин харвах ↻</button><a href="#home" class="secondary-button">Миний аялал</a></section>`;
  $('#shoot-again').onclick = lobby;
  window.scrollTo(0, 0);
}
function celebrateShooter(index){
  const rank=SHOOTER_RANKS[index];
  const dialog=document.createElement('dialog');
  rewardDialog=dialog;
  dialog.className='rank-celebration';
  dialog.setAttribute('aria-labelledby','shoot-rank-title');
  dialog.innerHTML=`<div class="rank-confetti" aria-hidden="true">${Array.from({length:20},(_,i)=>`<i style="left:${i*5}%;animation-delay:-${i*.17}s"></i>`).join('')}</div><div class="rank-celebration-content"><span class="rank-celebration-eyebrow">ОДОН ХАРВААНЫ ШИНЭ ЦОЛ · ${index+1} / 9</span><div class="rank-celebration-medal" aria-hidden="true">${rank.icon}</div><h2 id="shoot-rank-title">Баяр хүргэе!</h2><p>Чи <strong>${rank.name}</strong> цол хүртлээ!</p><p class="rank-celebration-note">Үсэг бүрийг олж, шинэ үгсээ бүтээцгээе.</p><button class="primary-button" autofocus>Үргэлжлүүлэх ✨</button></div>`;
  document.body.append(dialog);
  dialog.addEventListener('close',()=>{dialog.remove();if(rewardDialog===dialog)rewardDialog=undefined;$('#shoot-next')?.focus({preventScroll:true});},{once:true});
  dialog.querySelector('button').onclick=()=>dialog.close();
  dialog.showModal();
}
