import { profileStorage } from './profiles-store.js';
import { lessons, getLessonLetters, getLetterChoices } from './alphabet-lessons.js';
import { alphabetPromptClips, createWordSpeaker } from './alphabet-audio.js';
import { PICTURE_SHOT_RANKS, pictureShotRank, pictureShotPlan, pictureShotAtRank, pictureShotBoard } from './alphabet-star.js';
import { playLearningAudio, playAnswerFeedback, stopLearningAudio } from './learning-audio.js';
import { drawRay, initShotStage, clearShotEffects } from './shot-ray.js';
const speaker = createWordSpeaker();
const $ = (selector, root = document) => root.querySelector(selector);
const KEY = 'fast-read-alphabet-v1';
const modes = [
  {id:'art',title:'Дүрсээс үсгээ олъё',text:'Дүрс дотор ямар үсэг нуугдсан бэ?',choices:3,icon:'А'},
  {id:'font',title:'Өөр хувцастай ижил үсэг',text:'Фонт нь өөр ч нэг л үсэг. Ижил үсгээ олоорой.',choices:4,icon:'М'},
  {id:'case',title:'Том, жижиг хоёр найз',text:'Том үсгийн жижиг найзыг нь олоорой.',choices:3,icon:'а'},
  {id:'star',title:'Одон харваа',text:'Зургийг нэрлээд, эхний үсгийг нь харваарай.',icon:'✦'},
];
let state = {learned:[],rounds:0,best:{},starHits:0};
let data, hooks, main, dialog, round, ticker, advanceTimer;
let selectedFont = 'nunito';
let selectedLesson = 'beginner';
let group = 'all';
let questionCount = 5;
try {
  const saved = JSON.parse(profileStorage.getItem(KEY));
  if (saved && Array.isArray(saved.learned)) state.learned = [...new Set(saved.learned.filter(id => typeof id === 'string'))];
  if (Number.isInteger(saved?.rounds) && saved.rounds >= 0) state.rounds = saved.rounds;
  if (saved?.best && typeof saved.best === 'object') state.best = saved.best;
  state.starHits = pictureShotRank(saved?.starHits).hits;
} catch { /* A fresh independent alphabet profile is always available. */ }
function persist() {
  try { profileStorage.setItem(KEY,JSON.stringify(state)); }
  catch { hooks.toast('Үсгийн ахицыг хадгалж чадсангүй. Тоглоомоо үргэлжлүүлж болно.'); }
}
export function resetAlphabet() {
  stop();speaker.stop();stopLearningAudio();round=null;
  state = {learned:[],rounds:0,best:{},starHits:0};
  try { profileStorage.removeItem(KEY); } catch { /* Session reset still works. */ }
}
function shuffle(items) {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
function time(seconds) { return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }
function stop() { clearInterval(ticker); ticker=undefined; clearTimeout(advanceTimer); advanceTimer=undefined; }
function highlighted(letter) { return [...letter.word].map((character,index)=>index===letter.highlightIndex?`<b>${character}</b>`:character).join(''); }
function usageText(letter) { return ({initial:'Үгийн эхэнд',inside:'Үгийн дунд',ending:'Үгийн төгсгөлд',shape:'Хэлбэрээр нь таниарай'})[letter.usage]; }
function frame(title, body, closeLabel='Хаах') {
  $('#alphabet-content').innerHTML=`<div class="game-head"><h2 id="alphabet-title">${title}</h2><button class="close-button" aria-label="${closeLabel}">×</button></div>${body}`;
  $('#alphabet-content .close-button').onclick=()=>dialog.close();
  dialog.classList.toggle('question-dialog', !!$('#alphabet-content .letter-game'));
  dialog.classList.toggle('result-dialog', !!$('#alphabet-content .result-title'));
  dialog.scrollTop=0;
  if(!dialog.open) dialog.showModal();
}
export function renderAlphabet(collection, callbacks) {
  data=collection; hooks=callbacks; main=callbacks.main;
  if(!dialog) {
    dialog=$('#alphabet-dialog');
    dialog.addEventListener('close',()=>{stop();speaker.stop();stopLearningAudio();clearShotEffects($('.star-range'));round=null;if(location.hash==='#alphabet')renderAlphabet(data,hooks);});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  }
  const fonts = data.fonts;
  const starRank = pictureShotRank(state.starHits);
  const availableModes = selectedLesson === 'beginner' ? modes : modes.filter(mode => mode.id !== 'star');
  const pool = getLessonLetters(data,selectedLesson);
  const lesson = lessons.find(item=>item.id===selectedLesson);
  const visible=pool.filter(letter=>group==='all'||letter.kind===group);
  const activeCount=Math.min(questionCount,pool.length);
  const counts=[...new Set([3,5,10,pool.length])].filter(count=>count<=pool.length).sort((a,b)=>a-b);
  const heroArt=selectedLesson==='beginner'?['a','l','sh']:selectedLesson==='context'?['v','yo','short-i']:['k','f','shch'];
  const title=selectedLesson==='beginner'?'Үсэг бүр<br><em>танил зурагтай.</em>':selectedLesson==='context'?'Танил үгээс<br><em>үсгээ олъё.</em>':'Онцгой найзуудтай<br><em>тайван танилцъя.</em>';
  main.innerHTML=`
    <section class="alphabet-hero"><div><span class="eyebrow">${lesson.title.toUpperCase()} · ${pool.length} ҮСЭГ · ${fonts.length} ФОНТ</span><h1>${title}</h1><p>${lesson.description}<br>Бага багаар, өөрийн хурдаар.</p></div><div class="alphabet-hero-art" aria-hidden="true">${heroArt.map((id,index)=>`<img src="${data.letters.find(letter=>letter.id===id).variants[fonts[index].id].illustrated}" alt="">`).join('')}</div></section>
    <div class="alphabet-overview"><span><b>${pool.filter(letter=>state.learned.includes(letter.id)).length} / ${pool.length}</b> энэ хэсэгт танил болсон</span><span><b>${fonts.length}</b> өөр фонт</span><span><b>${state.rounds}</b> дуусгасан дасгал</span></div>
    <div class="lesson-tabs" aria-label="Сурах хэсэг">${lessons.map(item=>`<button data-lesson="${item.id}" aria-pressed="${selectedLesson===item.id}"><small>${item.badge}</small><strong>${item.title}</strong><span>${getLessonLetters(data,item.id).length} үсэг</span></button>`).join('')}</div>
    <div class="lesson-guide" role="status">${lesson.description}${selectedLesson==='beginner'?' Үгийн дунд ордог болон хэцүү үсгүүд энэ дасгалын асуулт, сонголтод орохгүй.':selectedLesson==='context'?' Үг дотор хайж буй үсгийг өнгөөр тодруулсан.':' Щ-г Ш үсэгтэй харьцуулж, бусдыг танил зураг, үгтэй нь нэг нэгээр нь үзээрэй.'}</div>
    <div class="alphabet-font-strip"><span>Үсгийн фонт</span><div class="alphabet-fonts" aria-label="Үсгийн фонт">${fonts.map(font=>`<button data-alphabet-font="${font.id}" aria-pressed="${selectedFont===font.id}" class="${selectedFont===font.id?'active':''}">${font.label}</button>`).join('')}</div></div>
    <div class="section-heading"><div><h2>${lesson.title} — тоглож суръя</h2><p>${selectedLesson==='beginner'?'Хоёр сонголттой, богинохон дасгалаас эхлээрэй.':'Хэлбэрийг нь ажиглаад, хамт чангаар хэлээрэй.'}</p></div><label class="round-count">Нэг дасгалд <select id="alphabet-count" aria-label="Дасгалын асуултын тоо">${counts.map(count=>`<option value="${count}" ${count===activeCount?'selected':''}>${count} үсэг</option>`).join('')}</select></label></div>
    <div class="alphabet-modes${selectedLesson==='beginner'?' with-star':''}">${availableModes.map((mode,index)=>`<article><span class="mode-number">0${index+1}</span><span class="mode-letter font-${fonts[index].id}">${mode.icon}</span><h3>${mode.title}</h3><p>${mode.text}</p><button class="level-button" data-letter-mode="${mode.id}"><span>Тоглож эхлэх</span><span>→</span></button></article>`).join('')}</div>
    ${selectedLesson==='beginner'?`<section class="alphabet-star-rank" aria-label="Үсгийн одон харвааны цол"><span class="star-rank-icon" aria-hidden="true">${starRank.icon}</span><div><small>04 · ОДОН ХАРВАА · ЦОЛ ${starRank.index+1} / 9</small><h3>${starRank.name}</h3><p>★ ${starRank.hits} од · ${starRank.targets} үсгээс сонгоно</p><p>${starRank.next?`Дараагийн цол хүртэл ${starRank.next.min-starRank.hits} од.`:'Бүх цолыг хүртлээ!'}</p><small>Эхний оролдлогоор зөв онох бүрд нэг од авна. Цол ахихад үсгийн тоо нэмэгдэнэ.</small></div><details><summary>9 цолыг харах</summary><ol>${PICTURE_SHOT_RANKS.map(rank=>`<li>${rank.icon} ${rank.name} · ${rank.min} од · ${rank.targets} үсэг</li>`).join('')}</ol></details></section>`:''}
    <section class="alphabet-gallery" aria-labelledby="alphabet-gallery-title"><div class="section-heading"><div><h2 id="alphabet-gallery-title">${lesson.title} — ${pool.length} зураг</h2><p>Үсэгт хүрээд дүрс, энгийн хэлбэрийг нь сольж үзээрэй.</p></div></div>
    <div class="alphabet-tools"><div class="alphabet-groups" aria-label="Үсгийн ангилал">${[{id:'all',label:'Бүгд'},{id:'vowel',label:'Эгшиг'},{id:'consonant',label:'Гийгүүлэгч'},{id:'sign',label:'Тэмдэг'}].filter(item=>item.id==='all'||pool.some(letter=>letter.kind===item.id)).map(item=>`<button data-letter-group="${item.id}" aria-pressed="${group===item.id}" class="${group===item.id?'active':''}">${item.label}</button>`).join('')}</div></div>
    <div class="alphabet-grid">${visible.map(letter=>`<button class="alphabet-card" data-letter="${letter.id}" aria-label="${letter.upper} үсэг, ${letter.word}"><span class="alphabet-order">${String(letter.order).padStart(2,'0')}</span>${state.learned.includes(letter.id)?'<span class="alphabet-known">✓</span>':''}<img src="${letter.variants[selectedFont].illustrated}" alt="" loading="lazy"><strong>${letter.upper}<span>${letter.lower}</span></strong><span class="alphabet-example">${highlighted(letter)}</span>${letter.usage!=='initial'?`<small>${usageText(letter)}</small>`:''}</button>`).join('')}</div>
    <aside class="alphabet-parent-note">Эхний үсгийн 25 зураг, танил үг доторх 4 үсэг, тусгайлан үзэх 6 үсэг тусдаа. Бүх 35 үсгийг нэг дор цээжлэх шаардлагагүй. Өмнөх ахиц хэвээр хадгалагдана.</aside></section>`;
  main.querySelectorAll('[data-lesson]').forEach(button=>button.onclick=()=>{selectedLesson=button.dataset.lesson;group='all';questionCount=Math.min(5,getLessonLetters(data,selectedLesson).length);renderAlphabet(data,hooks);});
  $('#alphabet-count').onchange=event=>{questionCount=Number(event.target.value);};
  main.querySelectorAll('[data-letter-mode]').forEach(button=>button.onclick=()=>start(button.dataset.letterMode));
  main.querySelectorAll('[data-alphabet-font]').forEach(button=>button.onclick=()=>{selectedFont=button.dataset.alphabetFont;renderAlphabet(data,hooks);});
  main.querySelectorAll('[data-letter-group]').forEach(button=>button.onclick=()=>{group=button.dataset.letterGroup;renderAlphabet(data,hooks);});
  main.querySelectorAll('[data-letter]').forEach(button=>button.onclick=()=>detail(button.dataset.letter));
}
function detail(id) {
  const letter=data.letters.find(item=>item.id===id);
  let font=selectedFont;
  frame(`${letter.upper} ${letter.lower} · ${letter.word}`,`<div class="letter-detail"><span class="story-kicker">ДҮРС НЬ СОЛИГДОВЧ ҮСЭГ ХЭВЭЭРЭЭ</span><div class="letter-morph"><img class="morph-plain" src="${letter.variants[font].upper}" alt="${letter.upper} үсгийн энгийн хэлбэр"><img class="morph-art" src="${letter.variants[font].illustrated}" alt="${letter.upper} үсгийг ${letter.word.toLowerCase()} дүрстэй уялдуулсан зураг"></div><button class="morph-toggle secondary-button" aria-pressed="false">Энгийн үсэг болгох ⇄</button><div class="letter-font-options">${data.fonts.map(item=>`<button data-detail-font="${item.id}" aria-pressed="${item.id===font}" class="font-${item.id}">${letter.upper}${letter.lower}<small>${item.label}</small></button>`).join('')}</div><h3 class="letter-example">${highlighted(letter)}</h3><span class="pill">${usageText(letter)}</span><p class="letter-note">${letter.note}</p><div class="result-actions"><button class="secondary-button" id="letter-learned">Танил боллоо ✓</button><button class="primary-button" id="letter-practice">Энэ үсгээр тоглох →</button></div></div>`);
  addWordAudio(letter, $('.letter-example'));
  $('.morph-toggle').onclick=()=>{const plain=$('.letter-morph').classList.toggle('show-plain');$('.morph-toggle').textContent=plain?'Дүрсийг нь буцаах ⇄':'Энгийн үсэг болгох ⇄';$('.morph-toggle').setAttribute('aria-pressed',String(plain));};
  $('#alphabet-content').querySelectorAll('[data-detail-font]').forEach(button=>button.onclick=()=>{
    font=button.dataset.detailFont;
    $('.morph-plain').src=letter.variants[font].upper;$('.morph-art').src=letter.variants[font].illustrated;
    $('#alphabet-content').querySelectorAll('[data-detail-font]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
  });
  $('#letter-learned').onclick=()=>{if(!state.learned.includes(id))state.learned.push(id);persist();hooks.chime(true);dialog.close();};
  $('#letter-practice').onclick=()=>start('art',letter);
}
function start(modeId,focusedLetter) {
  stop();speaker.stop();stopLearningAudio();
  const mode=modes.find(item=>item.id===modeId);
  const lesson=focusedLetter?.lesson||selectedLesson;
  const pool=getLessonLetters(data,lesson);
  const shots = mode.id === 'star' ? pictureShotPlan(pool, questionCount) : null;
  const queue = shots ? shots.map(shot => shot.letter) : focusedLetter ? data.fonts.map(() => focusedLetter) : shuffle(pool).slice(0, questionCount);
  round={mode,lesson,pool,focused:!!focusedLetter,shots,queue,index:0,mistakes:0,retried:false,answered:false,started:Date.now(),fontOffset:Math.floor(Math.random()*data.fonts.length),seconds:hooks.getQuestionSeconds()};
  question();
}
function question() {
  clearShotEffects($('.star-range'));
  stop();speaker.stop();stopLearningAudio();round.answered=false;round.retried=false;
  const letter=round.queue[round.index];
  const font=round.mode.id==='font'||round.focused?data.fonts[(round.index+round.fontOffset)%data.fonts.length].id:selectedFont;
  const otherFonts=data.fonts.filter(item=>item.id!==font);
  const answerFont=round.mode.id==='font'?otherFonts[round.index%otherFonts.length].id:selectedFont;
  const shot = round.shots ? pictureShotAtRank(round.shots[round.index], state.starHits) : null;
  const choiceCount=shot ? shot.choices.length : round.lesson==='beginner'?(round.mode.id==='font'?3:2):Math.min(round.mode.choices,round.pool.length);
  const options=shot?.choices ?? getLetterChoices(round.pool,letter,choiceCount);
  const kind=round.mode.id==='art'?'illustrated':'upper';
  const answerKind=round.mode.id==='case'?'lower':'upper';
  const title=shot ? 'Ямар үсгээр эхэлдэг вэ?' : round.lesson==='context'?'Үг доторх өнгөт үсгийг олъё.':letter.usage==='shape'?'Өнгөөр тодруулсан үсгийг олъё.':round.mode.id==='art'?'Дүрс дотор аль үсэг байна вэ?':round.mode.id==='font'?'Өөр фонтоор бичсэн ижил үсгийг олъё.':'Жижиг үсэг найзыг нь олъё.';
  const board = shot ? pictureShotBoard(shot, selectedFont) : `<div class="letter-prompt"><img src="${letter.variants[font][kind]}" alt="Таних үсгийн зураг"></div><div class="letter-answers" style="--answer-count:${choiceCount}">${options.map((item,index)=>`<button class="letter-answer" data-letter-answer="${item.id}" aria-label="${answerKind==='lower'?item.lower:item.upper} үсэг"><img src="${item.variants[answerFont][answerKind]}" alt=""><small>${data.fonts.find(entry=>entry.id===answerFont).label}</small></button>`).join('')}</div>`;
  frame(round.mode.title,`<div class="game-body letter-game${shot?' star-game':''}"><div class="game-progress" role="progressbar" aria-label="Үсгийн дасгалын ахиц" aria-valuemin="0" aria-valuemax="${round.queue.length}" aria-valuenow="${round.index}"><span style="width:${round.index/round.queue.length*100}%"></span></div><div class="game-clock-row"><span class="question-clock" role="timer" aria-label="Үлдсэн хугацаа">◷ <b class="letter-remaining">${round.seconds?time(round.seconds):'∞'}</b><small>${round.seconds?'үлдлээ':'хугацаагүй'}</small></span><span class="elapsed-clock">Нийт <b class="letter-elapsed">${time(Math.floor((Date.now()-round.started)/1000))}</b></span></div><div class="question-meta">ҮСЭГ ${round.index+1} / ${round.queue.length}${shot ? ` · ЦОЛ ${shot.rank.index+1} / 9 · ${choiceCount} бай · ★ ${state.starHits}` : ''}</div><h3 tabindex="-1">${title}</h3>${board}<div class="letter-feedback feedback" role="status" aria-live="polite">${shot ? 'Сонсоод, эхний үсгийг нь онилоорой.' : 'Үсгийнхээ хэлбэрийг сайн ажиглаарай.'}</div><button class="next-button letter-next" hidden>${round.index+1===round.queue.length?'Амжилтаа харах ✦':'Дараагийн үсэг →'}</button></div>`,'Үсгийн тоглоомоос гарах');
  $('#alphabet-title').textContent = `${lessons.find(item=>item.id===round.lesson).title} · ${round.mode.title}`;
  if (kind==='illustrated') addWordAudio(letter, $('.letter-prompt'));
  const spokenPrompt = shot || round.mode.id==='font' || round.mode.id==='case';
  if (spokenPrompt) {
    if (!shot) {
      const prompt = $('.letter-prompt');
      prompt.classList.add('with-audio');
      prompt.insertAdjacentHTML('beforeend','<button type="button" class="star-listen" aria-label="Үсэг, жишээ үгийг дахин сонсох">🔊 Давтах</button><small class="star-audio-note" role="status"></small>');
    }
    $('.star-listen').onclick = () => playLetterPrompt(letter, true);
    playLetterPrompt(letter);
  }
  if (shot) {
    initShotStage($('.star-range'));
    $('.letter-game h3').focus({preventScroll:true});
    if (round.promotion) {
      const rank = round.promotion;
      const feedback = $('.letter-feedback');
      feedback.classList.add('star-promotion');
      feedback.innerHTML = `<strong>${rank.icon} ${rank.name}!</strong><span>Цол ахилаа! Одоо ${choiceCount} үсгээс сонгоно.</span>`;
      round.promotion = null;
    }
  }
  if(round.lesson==='context') {
    $('.letter-prompt').insertAdjacentHTML('beforebegin',`<div class="context-prompt-group"><div class="context-word" aria-label="${letter.word} үг доторх ${letter.upper} үсэг">${highlighted(letter)}<small>${usageText(letter)}</small></div></div>`);
    $('.context-prompt-group').append($('.letter-prompt'));
  }
  $('#alphabet-content').querySelectorAll('[data-letter-answer]').forEach(button=>button.onclick=()=>answer(button));
  $('.letter-next').onclick=nextQuestion;
  round.deadline=Date.now()+round.seconds*1000;
  function tick(){
    if(!round||round.answered){stop();return;}
    $('.letter-elapsed').textContent=time(Math.floor((Date.now()-round.started)/1000));
    if(!round.seconds)return;
    const remaining=Math.max(0,Math.ceil((round.deadline-Date.now())/1000));
    $('.letter-remaining').textContent=time(remaining);
    $('#alphabet-content .question-clock').classList.toggle('urgent',remaining<=5);
    if(!remaining)expire();
  }
  ticker=setInterval(tick,250);tick();
}
function nextQuestion() {
  if (!round?.answered) return;
  stop();
  round.index++;
  if (round.index === round.queue.length) finish(); else question();
}
function answer(button){
  if(!round||round.answered||button.disabled)return;
  if(round.seconds&&Date.now()>=round.deadline){expire();return;}
  const letter=round.queue[round.index];
  const star = round.mode.id === 'star';
  speaker.stop();
  if (star) {
    stopLearningAudio();
    drawRay(button, $('.star-range'), button.dataset.letterAnswer===letter.id);
  }
  if(button.dataset.letterAnswer!==letter.id){
    if(!round.retried){round.mistakes++;round.retried=true;}
    button.classList.add('wrong');button.disabled=true;hooks.chime(false);
    $('.letter-feedback').textContent=star ? 'Буруу байна. Дахиад онилоорой.' : 'Буруу байна. Хэлбэрийг нь дахин ажиглаад үзье.';
    playAnswerFeedback(false,hooks.isSoundOn());return;
  }
  round.answered=true;stop();hooks.chime(true);
  button.classList.add('correct');
  $('#alphabet-content').querySelectorAll('[data-letter-answer]').forEach(item=>item.disabled=true);
  if(!state.learned.includes(letter.id))state.learned.push(letter.id);
  if (star) {
    const before = pictureShotRank(state.starHits);
    if (!round.retried) state.starHits = Math.min(Number.MAX_SAFE_INTEGER, state.starHits + 1);
    const after = pictureShotRank(state.starHits);
    if (after.index > before.index) round.promotion = after;
    persist();
    revealPictureAnswer(letter);
    $('.star-listen').disabled=true;
    const activeRound = round, index = round.index;
    const advance = () => {
      if (round === activeRound && round.index === index && dialog.open) nextQuestion();
    };
    // A failed or stalled recording must never trap the child on this question.
    advanceTimer = setTimeout(advance, 4000);
    playAnswerFeedback(true,hooks.isSoundOn(),[],()=>{
      clearTimeout(advanceTimer);
      advanceTimer=setTimeout(advance,350);
    });
    return;
  } else {
    persist();
    $('.letter-feedback').innerHTML=`<strong>${letter.upper} ${letter.lower} · ${highlighted(letter)}</strong><span>${letter.note}</span>`;
    playAnswerFeedback(true,hooks.isSoundOn());
  }
  $('.letter-next').hidden=false;$('.letter-next').focus({preventScroll:true});
}
function expire(){
  if(!round||round.answered)return;
  stop();round.answered=true;if(!round.retried)round.mistakes++;
  const letter=round.queue[round.index];
  $('#alphabet-content').querySelectorAll('[data-letter-answer]').forEach(button=>{button.disabled=true;if(button.dataset.letterAnswer===letter.id)button.classList.add('correct');});
  $('.letter-feedback').innerHTML=`<strong>Энэ бол ${letter.upper} ${letter.lower}.</strong><span>Хугацаа дууслаа. Хамт тогтоогоод дараагийн үсэг рүү оръё.</span>`;
  if (round.mode.id === 'star') {
    stopLearningAudio();
    revealPictureAnswer(letter, true);
  }
  $('.letter-next').hidden=false;$('.letter-next').focus({preventScroll:true});hooks.chime(false);
}
function revealPictureAnswer(letter, expired = false) {
  $('.letter-feedback').innerHTML = `<strong>${letter.upper} үсэг, ${letter.word.toLocaleLowerCase('mn')}.</strong><span>${expired ? 'Хугацаа дууслаа. Хамт сонсоод тогтооё.' : 'Зөв онолоо! Дараагийн үсэг рүү оръё.'}</span>`;
  const listen = $('.star-listen');
  listen.textContent = '🔊 Давтах';
  listen.setAttribute('aria-label', 'Үг, үсгийг дахин сонсох');
}

function playLetterPrompt(letter, manual = false) {
  const status = $('.star-audio-note');
  status.textContent = '';
  if (!hooks.isSoundOn()) {
    if (manual) status.textContent = 'Дууг тохиргооноос нээгээрэй.';
    return;
  }
  const clips = alphabetPromptClips(letter);
  const fail = () => { if (status.isConnected) status.textContent = 'Сонсох товчийг дахин дараарай.'; };
  if (!playLearningAudio(clips, true, fail)) fail();
}

export function leaveAlphabet() {
  clearShotEffects($('.star-range'));
  if (dialog?.open) dialog.close();
  stop();
  speaker.stop();
  stopLearningAudio();
}

function finish(){
  stop();speaker.stop();stopLearningAudio();
  const score=round.queue.length-round.mistakes;
  const percent=Math.round(score/round.queue.length*100);
  const scoreKey=round.lesson+':'+round.mode.id;
  state.rounds++;state.best[scoreKey]=Math.max(Number(state.best[scoreKey])||0,percent);persist();
  const modeId=round.mode.id;
  const lesson=lessons.find(item=>item.id===round.lesson);
  const known=round.pool.filter(letter=>state.learned.includes(letter.id)).length;
  const rank=pictureShotRank(state.starHits);
  frame('Үсгийн аяллын амжилт',`<div class="game-body"><div class="reward">✦</div><h3 class="result-title">Үсгүүдтэйгээ танилцлаа!</h3><p class="result-copy">Эхний оролдлогоор <strong>${score} / ${round.queue.length}</strong> үсгийг зөв оллоо.<br>${lesson.title}: ${known} / ${round.pool.length} үсэгтэй танил болсон<br>◷ ${time(Math.floor((Date.now()-round.started)/1000))}</p><div class="alphabet-result-letters">${[...new Set(round.queue.map(letter=>letter.upper))].join(' ')}</div><div class="result-actions"><button class="secondary-button" id="alphabet-home">Үсгийн цомог</button><button class="primary-button" id="alphabet-again">Дахин тоглох →</button></div></div>`);
  if(modeId==='star') $('.result-copy').insertAdjacentHTML('afterend',`<div class="star-result-rank${round.promotion?' star-promotion':''}"><strong>${rank.icon} ${rank.name}${round.promotion?' · Цол ахилаа!':''}</strong><p>★ ${rank.hits} од · ${rank.targets} үсгээс сонгоно</p></div>`);
  $('#alphabet-home').onclick=()=>dialog.close();$('#alphabet-again').onclick=()=>start(modeId);
}

function addWordAudio(letter, anchor) {
  if (letter.usage==='shape') return;
  const container=document.createElement('div');
  container.className='letter-audio';
  const button=document.createElement('button');
  button.className='secondary-button';
  button.type='button';
  button.textContent='🔊 Үгийг сонсох';
  const status=document.createElement('small');
  status.setAttribute('role','status');
  container.append(button,status);
  anchor.insertAdjacentElement('afterend',container);
  function play(manual=true) {
    if(hooks.isSoundOn?.()===false){speaker.stop();status.textContent=manual?'Дууг тохиргооноос нээгээрэй.':'';return;}
    status.textContent=speaker.speak(letter.id,()=>{ if (container.isConnected) status.textContent='Дууг тоглуулахын тулд «Үгийг сонсох» товчийг дарна уу.'; })?'':'Дуу тоглуулж чадсангүй.';
  }
  button.onclick=()=>play(true);
  play(false);
}
