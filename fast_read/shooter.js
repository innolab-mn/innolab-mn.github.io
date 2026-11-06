import { profileStorage } from './profiles-store.js';
import { beginnerWordIds, wordLetters, missingLetterIsCorrect, shooterStars, createShooterPlan, createSentenceShooterPlan, SHOOTER_RANKS, shooterRank } from './shooter-logic.js';
import { createAudioSequence, shooterFeedbackClips, shooterWrongClips, shooterWordClip } from './shooter-audio.js';
import { actionVerbClip, actionSentenceClip, actionTokenClip } from './learning-audio.js';
import { pauseControlMarkup } from './play-controls.js';

const KEY = 'fast-read-shooter-v1';
let saved = { learned: [], rounds: 0, best: 0 };
try {
  const value = JSON.parse(profileStorage.getItem(KEY));
  if (Array.isArray(value?.learned)) saved.learned = [...new Set(value.learned.filter(id => typeof id === 'string'))];
  if (Number.isInteger(value?.rounds) && value.rounds >= 0) saved.rounds = value.rounds;
  if ([1, 2, 3].includes(value?.best)) saved.best = value.best;
} catch { /* A new profile can play without storage. */ }
let main, hooks, words, baseWords, verbs, round, events, rewardDialog;
const audioSequence=createAudioSequence();
let moving = true, poolMode = 'starter', includeVerbs=false, gameMode='letters', sentenceLength='short';
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
  if(!audioSequence.play([currentWord().actionId?actionVerbClip(currentWord().actionId):shooterWordClip(currentWord().id)],audioError))audioError();
}
function playFeedback(){
  if(!round||round.paused||!round.solved)return;
  if(!hooks.isSoundOn()){
    if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='Дууг тохиргооноос нээгээрэй.';
    return;
  }
  if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='';
  const clips=shooterFeedbackClips(round.exercise.answer,currentWord().id);
  if(currentWord().actionId)clips[3]=actionVerbClip(currentWord().actionId);
  if(!audioSequence.play(clips,audioError))audioError();
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
  baseWords=collection;hooks=callbacks;main=callbacks.main;
  verbs=hooks.actions.map(action=>({id:`verb-${action.id}`,actionId:action.id,text:action.verb,image:action.image}));
  words=[...baseWords,...verbs];
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
    <section class="shoot-setup" aria-labelledby="shoot-setup-title"><h2 id="shoot-setup-title">Харваагаа бэлдье</h2><div class="shoot-options"><label>Тоглох үе <select id="shoot-mode"><option value="letters" ${gameMode==='letters'?'selected':''}>1 · Үсэг харваж үг бүтээе</option><option value="sentences" ${gameMode==='sentences'?'selected':''}>2 · Үг харваж өгүүлбэр бүтээе</option></select></label><label><input id="shoot-motion" type="checkbox" ${moving ? 'checked' : ''}> Бай хөвж хөдөлнө</label><label id="shoot-pool-setting">Үгийн багц <select id="shoot-pool" aria-label="Үгийн багц"><option value="starter" ${poolMode==='starter'?'selected':''}>Эхний 5 хялбар үг</option><option value="classic" ${poolMode==='classic'?'selected':''}>Эхний 20 үг</option><option value="extra" ${poolMode==='extra'?'selected':''}>Шинэ 20 үг</option><option value="all" ${poolMode==='all'?'selected':''}>Бүх ${baseWords.length} үг</option><option value="verbs" ${poolMode==='verbs'?'selected':''}>Зөвхөн үйл үг</option></select></label><label id="shoot-verbs-setting"><input id="shoot-verbs" type="checkbox" ${includeVerbs?'checked':''}> Үйл үгсийг нэмэх (${verbs.length})</label><label id="shoot-length-setting">Өгүүлбэрийн урт <select id="shoot-length"><option value="short" ${sentenceLength==='short'?'selected':''}>3 үгтэй</option><option value="long" ${sentenceLength==='long'?'selected':''}>4 үгтэй</option></select></label></div><button id="shoot-start" class="primary-button">Харваж эхлэх ✦</button></section>
    <aside class="lesson-guide shoot-guide"><strong>Яаж тоглох вэ?</strong><p>1-р үед дутуу үсгийг харваж үг бүтээнэ. 2-р үед зургийг ажиглаж, тохирох үгсийг эхнээс нь дараалан харваж өгүүлбэр бүтээнэ. Өгүүлбэрээ сонсож болно. Үсэг харваж бүтээсэн өөр өөр үг цолын ахицад тооцогдоно. Хугацааны шахалтгүй.</p></aside>`;
  $('#shoot-motion').onchange = event => { moving = event.target.checked; };
  const updateOptions=()=>{const sentence=gameMode==='sentences';$('#shoot-pool-setting').hidden=sentence;$('#shoot-verbs-setting').hidden=sentence||poolMode==='verbs';$('#shoot-length-setting').hidden=!sentence;};
  $('#shoot-mode').onchange=event=>{gameMode=event.target.value;updateOptions();};
  $('#shoot-pool').onchange = event => { poolMode = event.target.value;updateOptions(); };
  $('#shoot-verbs').onchange=event=>{includeVerbs=event.target.checked;};
  $('#shoot-length').onchange=event=>{sentenceLength=event.target.value;};
  updateOptions();
  $('#shoot-start').onclick = () => {
    if(gameMode==='sentences'){
      const plan=createSentenceShooterPlan(hooks.actions,sentenceLength);
      round={mode:'sentences',plan,index:0,step:0,choice:null,mistakes:0,solved:false,paused:false,finished:false,length:sentenceLength};
      drawSentence();window.scrollTo(0,0);return;
    }
    const pool = poolMode==='verbs'?[...verbs]:poolMode==='all'?[...baseWords]:poolMode==='extra'?baseWords.filter(word=>word.id.startsWith('extra-')):poolMode==='classic'?baseWords.filter(word=>!word.id.startsWith('extra-')):beginnerWordIds.map(id => baseWords.find(word => word.id === id)).filter(Boolean);
    if(includeVerbs&&poolMode!=='verbs')pool.push(...verbs);
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
    <div class="shoot-stage ${moving ? '' : 'is-still'}" style="--shoot-columns:${targets.length > 6 ? 4 : 3}"><span class="shoot-sky-star star-one" aria-hidden="true">✦</span><span class="shoot-sky-star star-two" aria-hidden="true">✧</span><span class="shoot-sky-star star-three" aria-hidden="true">✦</span><div class="shoot-targets" aria-label="Харвах үсгүүд">${targets.map((letter, index) => `<button class="shoot-target tone-${index % 4}" data-shoot-letter="${letter}" style="--float-delay:${-index * 0.7}s;--float-duration:${4 + index % 3}s" aria-label="${letter} үсгийг харвах"><span>${letter}</span><small aria-hidden="true">✧</small></button>`).join('')}</div><div class="shoot-launcher" aria-hidden="true"><span>✦</span><b>ОДОН ХАРВАА</b></div><div class="shoot-paused" hidden role="region" aria-label="Харваа түр зогссон"><div class="kid-pause-card"><span class="kid-pause-symbol" aria-hidden="true">Ⅱ</span><b>Харваа түр зогслоо</b><p>Бэлэн болмогц үргэлжлүүлээрэй.</p><div class="kid-pause-actions"><button id="shoot-resume" class="kid-control kid-control-resume">${pauseControlMarkup(true)}</button><button id="shoot-paused-exit" class="kid-control kid-control-back"><span class="kid-control-icon" aria-hidden="true">←</span><span>Буцах</span></button></div></div></div></div>
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
  drawRay(button);
  check(button);
}
function drawRay(button){
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
function sentenceAudio(paths,manual=false){
  if(!round||round.paused)return;
  if(!hooks.isSoundOn()){
    if(manual&&$('.shoot-audio-status'))$('.shoot-audio-status').textContent='Дууг тохиргооноос нээгээрэй.';
    return;
  }
  if($('.shoot-audio-status'))$('.shoot-audio-status').textContent='';
  if(!audioSequence.play(Array.isArray(paths)?paths:[paths],audioError))audioError();
}
function drawSentence(){
  stopWordAudio();
  const item=round.plan[round.index],task=item.steps[round.step];
  round.choice=null;round.solved=false;round.paused=false;
  main.innerHTML=`<section class="shoot-game shoot-sentence-game"><header class="shoot-toolbar"><button class="kid-control kid-control-back" id="shoot-exit"><span class="kid-control-icon" aria-hidden="true">←</span><span>Буцах</span></button><span>Өгүүлбэр <b>${round.index+1} / ${round.plan.length}</b></span><button class="kid-control kid-control-pause" id="shoot-pause">${pauseControlMarkup(false)}</button></header><div class="shoot-progress" aria-label="Аяллын ахиц"><span style="width:${round.index/round.plan.length*100}%"></span></div>
  <div class="shoot-prompt"><img src="${item.action.image}" alt="Өгүүлбэр бүтээх зураг"><div><span class="eyebrow">ҮГ ${round.step+1} / ${item.steps.length} · ӨГҮҮЛБЭР БҮТЭЭЕ</span><h1>Дараагийн үгийг харвая</h1><p>Зургийг ажиглаад үгсийг дарааллаар харваарай.</p><button class="shoot-audio-button" id="shoot-audio" type="button">🔊 Өгүүлбэрийг сонсох</button><small class="shoot-audio-status" role="status"></small></div></div>
  <div class="shoot-slots shoot-sentence-slots" role="group" aria-label="Бүтээж байгаа өгүүлбэр"></div>
  <div class="shoot-stage ${moving?'':'is-still'}" style="--shoot-columns:3"><span class="shoot-sky-star star-one" aria-hidden="true">✦</span><span class="shoot-sky-star star-two" aria-hidden="true">✧</span><div class="shoot-targets shoot-word-targets" aria-label="Харвах үгс">${task.targets.map((word,index)=>`<button class="shoot-target shoot-word-target tone-${index%4}" data-shoot-word="${index}" style="--float-delay:${-index*.7}s;--float-duration:${4+index%3}s" aria-label="${word} гэдэг үгийг харвах"><span>${word}</span><small aria-hidden="true">✧</small></button>`).join('')}</div><div class="shoot-launcher" aria-hidden="true"><span>✦</span><b>ОДОН ХАРВАА</b></div><div class="shoot-paused" hidden role="region" aria-label="Харваа түр зогссон"><div class="kid-pause-card"><span class="kid-pause-symbol" aria-hidden="true">Ⅱ</span><b>Харваа түр зогслоо</b><p>Бэлэн болмогц үргэлжлүүлээрэй.</p><div class="kid-pause-actions"><button id="shoot-resume" class="kid-control kid-control-resume">${pauseControlMarkup(true)}</button><button id="shoot-paused-exit" class="kid-control kid-control-back"><span class="kid-control-icon" aria-hidden="true">←</span><span>Буцах</span></button></div></div></div></div>
  <div class="shoot-feedback" role="status" aria-live="polite"></div><div class="shoot-controls"><button id="shoot-next" class="primary-button" hidden>${round.step+1<item.steps.length?'Дараагийн үг →':round.index+1===round.plan.length?'Амжилтаа харах ✦':'Дараагийн өгүүлбэр →'}</button></div><p class="shoot-keyboard">Tab-аар үг сонгоод Enter эсвэл зайгаар харваж болно.</p></section>`;
  main.querySelectorAll('[data-shoot-word]').forEach(button=>button.onclick=()=>shootSentenceWord(button));
  $('#shoot-audio').onclick=()=>sentenceAudio(actionSentenceClip(item.action.id,round.length),true);
  $('#shoot-exit').onclick=lobby;$('#shoot-paused-exit').onclick=lobby;
  $('#shoot-resume').onclick=()=>setPaused(false);$('#shoot-pause').onclick=()=>setPaused(!round.paused);
  $('#shoot-next').onclick=()=>{
    if(!round.solved)return;
    if(++round.step<item.steps.length){drawSentence();return;}
    round.step=0;
    if(++round.index<round.plan.length)drawSentence();else finishSentence();
  };
  updateSentence();
}
function updateSentence(){
  const item=round.plan[round.index];
  $('.shoot-slots').innerHTML=item.steps.map((step,index)=>{
    const revealed=index<round.step||(index===round.step&&round.solved);
    const current=index===round.step&&!round.solved;
    return `<span class="shoot-slot ${revealed?'is-filled is-correct':current?'is-gap':''}">${revealed?step.word:current?'✦':'...'}</span>`;
  }).join('');
  $('.shoot-slots').setAttribute('aria-label',`Өгүүлбэр: ${item.steps.map((step,index)=>index<round.step||(index===round.step&&round.solved)?step.word:'дутуу үг').join(' ')}`);
  main.querySelectorAll('[data-shoot-word]').forEach(button=>button.disabled=round.paused||round.solved);
  $('#shoot-next').hidden=!round.solved;$('#shoot-next').disabled=round.paused;$('#shoot-audio').disabled=round.paused;
  if(round.choice===null)$('.shoot-feedback').textContent='Одтой нүдэнд орох дараагийн үгийг харваарай.';
}
function shootSentenceWord(button){
  if(!round||round.paused||round.solved)return;
  const item=round.plan[round.index],task=item.steps[round.step];
  const choice=task.targets[Number(button.dataset.shootWord)];
  if(!choice)return;
  round.choice=choice;main.querySelectorAll('.was-wrong').forEach(target=>target.classList.remove('was-wrong'));drawRay(button);
  if(choice.normalize('NFC').toLocaleLowerCase('mn')===task.answer){
    round.solved=true;updateSentence();$('.shoot-stage').classList.add('is-solved');
    const complete=round.step+1===item.steps.length;
    $('.shoot-feedback').className='shoot-feedback is-success';
    $('.shoot-feedback').textContent=complete?`✦ Өгүүлбэр бүтлээ! ${item.steps.map(step=>step.word).join(' ')}`:`✦ Зөв! «${choice}» гэдэг үг орлоо.`;
    sentenceAudio(complete?actionSentenceClip(item.action.id,round.length):actionTokenClip(choice));
  }else{
    round.mistakes++;button.classList.add('was-wrong');
    $('.shoot-feedback').className='shoot-feedback is-retry';
    $('.shoot-feedback').textContent=`«${choice}» энэ байрлалд тохирохгүй. Дахин оролдоорой!`;
    sentenceAudio([actionTokenClip(choice),'assets/shooter-feedback/mismatch.mp3?v=2']);
  }
}
function finishSentence(){
  stopWordAudio();round.finished=true;
  const stars=shooterStars(round.mistakes);saved.rounds++;saved.best=Math.max(saved.best,stars);save();
  main.innerHTML=`<section class="shoot-finish"><span class="eyebrow">ҮГИЙН ОДОН ХАРВАА</span><div class="shoot-finish-star" aria-hidden="true">✦</div><h1>${round.plan.length} өгүүлбэр бүтээлээ!</h1><div class="shoot-earned" aria-label="${stars} од">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><p>${round.mistakes?`${round.mistakes} удаа засаад, бүх өгүүлбэрээ бүтээлээ.`:'Бүх үгийг эхний харвалтаар зөв оллоо!'}</p><div class="shoot-word-recap">${round.plan.map(item=>`<span>${item.steps.map(step=>step.word).join(' ')}</span>`).join('')}</div><button id="shoot-again" class="primary-button">Дахин харвах ↻</button><a href="#home" class="secondary-button">Миний аялал</a></section>`;
  $('#shoot-again').onclick=lobby;window.scrollTo(0,0);
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
  if(round.mode==='sentences')updateSentence();else update();
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
