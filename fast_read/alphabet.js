import { lessons, getLessonLetters, getLetterChoices } from './alphabet-lessons.js';
const $ = (selector, root = document) => root.querySelector(selector);
const KEY = 'fast-read-alphabet-v1';
const modes = [
  {id:'art',title:'Дүрсээс үсгээ олъё',text:'Дүрс дотор ямар үсэг нуугдсан бэ?',choices:3,icon:'А'},
  {id:'font',title:'Өөр хувцастай ижил үсэг',text:'Фонт нь өөр ч нэг л үсэг. Ижил үсгээ олоорой.',choices:4,icon:'М'},
  {id:'case',title:'Том, жижиг хоёр найз',text:'Том үсгийн жижиг найзыг нь олоорой.',choices:3,icon:'а'},
];
let state = {learned:[],rounds:0,best:{}};
let data, hooks, main, dialog, round, ticker;
let selectedFont = 'nunito';
let selectedLesson = 'beginner';
let group = 'all';
let questionCount = 5;
try {
  const saved = JSON.parse(localStorage.getItem(KEY));
  if (saved && Array.isArray(saved.learned)) state.learned = [...new Set(saved.learned.filter(id => typeof id === 'string'))];
  if (Number.isInteger(saved?.rounds) && saved.rounds >= 0) state.rounds = saved.rounds;
  if (saved?.best && typeof saved.best === 'object') state.best = saved.best;
} catch { /* A fresh independent alphabet profile is always available. */ }
function persist() {
  try { localStorage.setItem(KEY,JSON.stringify(state)); }
  catch { hooks.toast('Үсгийн ахицыг хадгалж чадсангүй. Тоглоомоо үргэлжлүүлж болно.'); }
}
export function resetAlphabet() {
  state = {learned:[],rounds:0,best:{}};
  try { localStorage.removeItem(KEY); } catch { /* Session reset still works. */ }
}
function shuffle(items) {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]]; }
  return result;
}
function time(seconds) { return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`; }
function stop() { clearInterval(ticker); ticker=undefined; }
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
  state.learned=state.learned.filter(id=>data.letters.some(letter=>letter.id===id));
  if(!dialog) {
    dialog=$('#alphabet-dialog');
    dialog.addEventListener('close',()=>{stop();round=null;if(location.hash==='#alphabet')renderAlphabet(data,hooks);});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  }
  const fonts = data.fonts;
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
    <div class="alphabet-modes">${modes.map((mode,index)=>`<article><span class="mode-number">0${index+1}</span><span class="mode-letter font-${fonts[index].id}">${mode.icon}</span><h3>${mode.title}</h3><p>${mode.text}</p><button class="level-button" data-letter-mode="${mode.id}"><span>Тоглож эхлэх</span><span>→</span></button></article>`).join('')}</div>
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
  stop();
  const mode=modes.find(item=>item.id===modeId);
  const lesson=focusedLetter?.lesson||selectedLesson;
  const pool=getLessonLetters(data,lesson);
  round={mode,lesson,pool,focused:!!focusedLetter,queue:focusedLetter?data.fonts.map(()=>focusedLetter):shuffle(pool).slice(0,questionCount),index:0,mistakes:0,retried:false,answered:false,started:Date.now(),fontOffset:Math.floor(Math.random()*data.fonts.length),seconds:hooks.getQuestionSeconds()};
  question();
}
function question() {
  stop();round.answered=false;round.retried=false;
  const letter=round.queue[round.index];
  const font=round.mode.id==='font'||round.focused?data.fonts[(round.index+round.fontOffset)%data.fonts.length].id:selectedFont;
  const otherFonts=data.fonts.filter(item=>item.id!==font);
  const answerFont=round.mode.id==='font'?otherFonts[round.index%otherFonts.length].id:selectedFont;
  const choiceCount=round.lesson==='beginner'?(round.mode.id==='font'?3:2):Math.min(round.mode.choices,round.pool.length);
  const options=getLetterChoices(round.pool,letter,choiceCount);
  const kind=round.mode.id==='art'?'illustrated':'upper';
  const answerKind=round.mode.id==='case'?'lower':'upper';
  const title=round.lesson==='context'?'Үг доторх өнгөт үсгийг олъё.':letter.usage==='shape'?'Өнгөөр тодруулсан үсгийг олъё.':round.mode.id==='art'?'Дүрс дотор аль үсэг байна вэ?':round.mode.id==='font'?'Өөр фонтоор бичсэн ижил үсгийг олъё.':'Жижиг үсэг найзыг нь олъё.';
  frame(round.mode.title,`<div class="game-body letter-game"><div class="game-progress" role="progressbar" aria-label="Үсгийн дасгалын ахиц" aria-valuemin="0" aria-valuemax="${round.queue.length}" aria-valuenow="${round.index}"><span style="width:${round.index/round.queue.length*100}%"></span></div><div class="game-clock-row"><span class="question-clock" role="timer" aria-label="Үлдсэн хугацаа">◷ <b class="letter-remaining">${round.seconds?time(round.seconds):'∞'}</b><small>${round.seconds?'үлдлээ':'хугацаагүй'}</small></span><span class="elapsed-clock">Нийт <b class="letter-elapsed">${time(Math.floor((Date.now()-round.started)/1000))}</b></span></div><div class="question-meta">ҮСЭГ ${round.index+1} / ${round.queue.length}</div><h3>${title}</h3><div class="letter-prompt"><img src="${letter.variants[font][kind]}" alt="Таних үсгийн зураг"></div><div class="letter-answers" style="--answer-count:${round.mode.choices}">${options.map((item,index)=>`<button class="letter-answer" data-letter-answer="${item.id}" aria-label="${answerKind==='lower'?item.lower:item.upper} үсэг"><img src="${item.variants[answerFont][answerKind]}" alt=""><small>${data.fonts.find(entry=>entry.id===answerFont).label}</small></button>`).join('')}</div><div class="letter-feedback feedback" role="status" aria-live="polite">Үсгийнхээ хэлбэрийг сайн ажиглаарай.</div><button class="next-button letter-next" hidden>${round.index+1===round.queue.length?'Амжилтаа харах ✦':'Дараагийн үсэг →'}</button></div>`,'Үсгийн тоглоомоос гарах');
  $('#alphabet-title').textContent = `${lessons.find(item=>item.id===round.lesson).title} · ${round.mode.title}`;
  $('.letter-answers').style.setProperty('--answer-count',choiceCount);
  if(round.lesson==='context') {
    $('.letter-prompt').insertAdjacentHTML('beforebegin',`<div class="context-prompt-group"><div class="context-word" aria-label="${letter.word} үг доторх ${letter.upper} үсэг">${highlighted(letter)}<small>${usageText(letter)}</small></div></div>`);
    $('.context-prompt-group').append($('.letter-prompt'));
  }
  $('#alphabet-content').querySelectorAll('[data-letter-answer]').forEach(button=>button.onclick=()=>answer(button));
  $('.letter-next').onclick=()=>{round.index++;if(round.index===round.queue.length)finish();else question();};
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
function answer(button){
  if(!round||round.answered||button.disabled)return;
  if(round.seconds&&Date.now()>=round.deadline){expire();return;}
  const letter=round.queue[round.index];
  if(button.dataset.letterAnswer!==letter.id){
    if(!round.retried){round.mistakes++;round.retried=true;}
    button.classList.add('wrong');button.disabled=true;hooks.chime(false);
    $('.letter-feedback').textContent='Хэлбэрийг нь дахин ажиглаад үзье.';return;
  }
  round.answered=true;stop();hooks.chime(true);
  button.classList.add('correct');
  $('#alphabet-content').querySelectorAll('[data-letter-answer]').forEach(item=>item.disabled=true);
  if(!state.learned.includes(letter.id)){state.learned.push(letter.id);persist();}
  $('.letter-feedback').innerHTML=`<strong>${letter.upper} ${letter.lower} · ${highlighted(letter)}</strong><span>${letter.note}</span>`;
  $('.letter-next').hidden=false;$('.letter-next').focus({preventScroll:true});
}
function expire(){
  if(!round||round.answered)return;
  stop();round.answered=true;if(!round.retried)round.mistakes++;
  const letter=round.queue[round.index];
  $('#alphabet-content').querySelectorAll('[data-letter-answer]').forEach(button=>{button.disabled=true;if(button.dataset.letterAnswer===letter.id)button.classList.add('correct');});
  $('.letter-feedback').innerHTML=`<strong>Энэ бол ${letter.upper} ${letter.lower}.</strong><span>Хугацаа дууслаа. Хамт тогтоогоод дараагийн үсэг рүү оръё.</span>`;
  $('.letter-next').hidden=false;$('.letter-next').focus({preventScroll:true});hooks.chime(false);
}
function finish(){
  stop();
  const score=round.queue.length-round.mistakes;
  const percent=Math.round(score/round.queue.length*100);
  const scoreKey=round.lesson+':'+round.mode.id;
  state.rounds++;state.best[scoreKey]=Math.max(Number(state.best[scoreKey])||0,percent);persist();
  const modeId=round.mode.id;
  const lesson=lessons.find(item=>item.id===round.lesson);
  const known=round.pool.filter(letter=>state.learned.includes(letter.id)).length;
  frame('Үсгийн аяллын амжилт',`<div class="game-body"><div class="reward">✦</div><h3 class="result-title">Үсгүүдтэйгээ танилцлаа!</h3><p class="result-copy">Эхний оролдлогоор <strong>${score} / ${round.queue.length}</strong> үсгийг зөв оллоо.<br>${lesson.title}: ${known} / ${round.pool.length} үсэгтэй танил болсон<br>◷ ${time(Math.floor((Date.now()-round.started)/1000))}</p><div class="alphabet-result-letters">${[...new Set(round.queue.map(letter=>letter.upper))].join(' ')}</div><div class="result-actions"><button class="secondary-button" id="alphabet-home">Үсгийн цомог</button><button class="primary-button" id="alphabet-again">Дахин тоглох →</button></div></div>`);
  $('#alphabet-home').onclick=()=>dialog.close();$('#alphabet-again').onclick=()=>start(modeId);
}
