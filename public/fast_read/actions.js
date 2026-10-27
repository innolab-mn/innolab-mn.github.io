import { actionModes, actionPool, sentenceTokens, sentenceIsCorrect, pictureDistractors } from './actions-logic.js';
const $=(selector,root=document)=>root.querySelector(selector);
const KEY='fast-read-actions-v1';
let state={learned:[],rounds:0,best:{}};
let data,hooks,main,dialog,round,ticker;
let sentenceLength='short';
let count=5;
try{
  const saved=JSON.parse(localStorage.getItem(KEY));
  if(Array.isArray(saved?.learned))state.learned=[...new Set(saved.learned.filter(id=>typeof id==='string'))];
  if(Number.isInteger(saved?.rounds)&&saved.rounds>=0)state.rounds=saved.rounds;
  if(saved?.best&&typeof saved.best==='object')state.best=saved.best;
}catch{/* A new local profile remains playable. */}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{hooks.toast('Үйл үгийн ахицыг хадгалж чадсангүй. Тоглоомоо үргэлжлүүлээрэй.');}}
export function resetActions(){state={learned:[],rounds:0,best:{}};try{localStorage.removeItem(KEY);}catch{}}
function shuffle(items){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
function time(seconds){return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
function stop(){clearInterval(ticker);ticker=undefined;}
function picture(action,extra=''){return `<img src="${action.image}" alt="" ${extra}>`;}
function frame(title,body){
  $('#actions-content').innerHTML=`<div class="game-head"><h2 id="actions-title">${title}</h2><button class="close-button" aria-label="Үйл үгийн хичээлээс гарах">×</button></div>${body}`;
  $('#actions-content .close-button').onclick=()=>dialog.close();
  dialog.classList.toggle('question-dialog',!!$('#actions-content .verb-game'));
  dialog.classList.toggle('result-dialog',!!$('#actions-content .result-title'));
  dialog.scrollTop=0;if(!dialog.open)dialog.showModal();
}
export function renderActions(collection,callbacks){
  data=collection;hooks=callbacks;main=callbacks.main;
  state.learned=state.learned.filter(id=>data.actions.some(action=>action.id===id));
  if(!dialog){
    dialog=$('#actions-dialog');
    dialog.addEventListener('close',()=>{stop();round=null;if(location.hash==='#actions')renderActions(data,hooks);});
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
  }
  const available=actionPool(data,sentenceLength);
  const counts=[...new Set([3,5,available.length])].sort((a,b)=>a-b);
  const effectiveCount=Math.min(count,available.length);
  main.innerHTML=`<section class="actions-hero"><div><span class="eyebrow">ХАРААД · ХЭЛЭЭД · ӨГҮҮЛБЭР БОЛГООРОЙ</span><h1>Бяцхан үйлдлээс<br><em>бүтэн өгүүлбэр рүү.</em></h1><p>Алхах, уух, унших…<br>Хийж байгаа үйлдлээ үгээр хэлж сурцгаая!</p></div><div class="actions-hero-art" aria-hidden="true">${picture(data.actions.find(action=>action.id==='read'))}</div></section><div class="alphabet-overview actions-overview"><span><b>${state.learned.length} / ${data.actions.length}</b> танил болсон үйл үг</span><span><b>3</b> өөр дасгал</span><span><b>${state.rounds}</b> дуусгасан тоглоом</span></div><div class="actions-controls"><div class="sentence-levels" aria-label="Өгүүлбэрийн урт"><button data-sentence-length="short" aria-pressed="${sentenceLength==='short'}"><strong>3 үгтэй</strong><small>Хүү ууж байна.</small></button><button data-sentence-length="long" aria-pressed="${sentenceLength==='long'}"><strong>4 үгтэй</strong><small>Хүү ус ууж байна.</small></button></div><label class="round-count">Нэг дасгалд <select id="actions-count" aria-label="Үйл үгийн дасгалын асуултын тоо">${counts.map(n=>`<option value="${n}" ${n===effectiveCount?'selected':''}>${n} даалгавар</option>`).join('')}</select></label></div><div class="actions-modes">${actionModes.map((mode,index)=>`<article><span class="mode-number">0${index+1}</span><span class="action-mode-symbol">${mode.symbol}</span><h2>${mode.title}</h2><p>${mode.description}</p><button class="level-button" data-action-mode="${mode.id}"><span>Тоглож эхлэх</span><span>→</span></button></article>`).join('')}</div><section aria-labelledby="actions-gallery-title"><div class="section-heading"><div><h2 id="actions-gallery-title">Өдөр тутмын ${data.actions.length} үйл үг</h2><p>Зурагт хүрч, үгнээс өгүүлбэр рүү хамтдаа алхъя.</p></div></div><div class="actions-grid">${data.actions.map(action=>`<button class="action-card" data-action="${action.id}" aria-label="${action.verb} үйл үгтэй танилцах">${picture(action,'loading="lazy"')}<strong>${action.verb}</strong><small>${action.subject} ${action.present} байна.</small>${state.learned.includes(action.id)?'<span class="alphabet-known">✓</span>':''}</button>`).join('')}</div></section><aside class="lesson-guide actions-tip">Эхлээд зургийн үйлдлийг нэрлээрэй. Дараа нь «Хэн?», «Юу хийж байна?» гэж асуугаад өгүүлбэрээ хамт чангаар уншаарай. Хүүхэд өөрийн хурдаар сурах боломжтой.</aside>`;
  main.querySelectorAll('[data-sentence-length]').forEach(button=>button.onclick=()=>{sentenceLength=button.dataset.sentenceLength;count=Math.min(count,actionPool(data,sentenceLength).length);renderActions(data,hooks);});
  $('#actions-count').onchange=event=>{count=Number(event.target.value);};
  main.querySelectorAll('[data-action-mode]').forEach(button=>button.onclick=()=>start(button.dataset.actionMode));
  main.querySelectorAll('[data-action]').forEach(button=>button.onclick=()=>lesson(button.dataset.action));
}
function lesson(id){
  const action=data.actions.find(item=>item.id===id);
  const tokens=sentenceTokens(action,action.sentences[sentenceLength]?sentenceLength:'short');
  frame(`${action.verb} — хамтдаа суръя`,`<div class="action-lesson"><div class="action-lesson-picture">${picture(action)}</div><span class="pill">ХИЙЖ БАЙГАА ҮЙЛДЭЛ</span><h3>${action.verb}</h3><p class="verb-change">${action.verb} → <strong>${action.present} байна</strong></p><p class="letter-note">${action.hint}</p><div class="teaching-sentence" aria-label="${tokens.join(' ')}">${tokens.map((token,index)=>`<button data-teach-token="${index}" class="${token===action.present?'verb-token':''}" aria-pressed="false">${token}</button>`).join('')}</div><p class="story-footnote">Үг бүрд хүрч сонгоод, нэг нэгээр нь чангаар уншаарай.</p><div class="result-actions"><button class="secondary-button" id="action-known">Танил боллоо ✓</button><button class="primary-button" id="action-practice">Энэ үйлдлээр тоглох →</button></div></div>`);
  $('#actions-content').querySelectorAll('[data-teach-token]').forEach(button=>button.onclick=()=>{const active=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(active));});
  $('#action-known').onclick=()=>{learn(action.id);hooks.chime(true);dialog.close();};
  $('#action-practice').onclick=()=>start('learn',action);
}
function learn(id){if(!state.learned.includes(id)){state.learned.push(id);save();}}
function start(modeId,focused){
  stop();const mode=actionModes.find(item=>item.id===modeId);
  const pool=actionPool(data,sentenceLength,modeId);
  round={mode,pool,queue:focused?[focused]:shuffle(pool).slice(0,Math.min(count,pool.length)),index:0,mistakes:0,retried:false,answered:false,selected:[],started:Date.now(),seconds:hooks.getQuestionSeconds(),length:modeId==='learn'?'short':sentenceLength};
  question();
}
function pictureOptions(target){
  return shuffle([target,...pictureDistractors(shuffle(round.pool),target,2)]);
}
function question(){
  stop();round.retried=false;round.answered=false;round.selected=[];
  const action=round.queue[round.index];
  const mode=round.mode.id;
  const tokens=sentenceTokens(action,round.length);
  let prompt='',answers='';
  if(mode==='learn'){
    prompt=`<div class="verb-prompt scene-prompt">${picture(action)}</div>`;
    const other=shuffle(data.actions.filter(item=>item.id!==action.id))[0];
    answers=`<div class="verb-answer-area verb-options">${shuffle([action,other]).map(item=>`<button class="verb-option" data-verb-answer="${item.id}">${item.verb}</button>`).join('')}</div>`;
  }else if(mode==='read'){
    prompt=`<div class="verb-prompt reading-prompt" aria-label="${tokens.join(' ')}">${tokens.map((token,index)=>`<button data-reading-word="${index}" aria-pressed="false">${token}</button>`).join('')}</div>`;
    answers=`<div class="verb-answer-area reading-options">${pictureOptions(action).map((item,index)=>`<button class="reading-option" data-verb-answer="${item.id}" aria-label="${index+1}-р үйлдлийн зураг">${picture(item)}<small>${index+1}-р зураг</small></button>`).join('')}</div>`;
  }else{
    prompt=`<div class="verb-prompt scene-prompt">${picture(action)}</div>`;
    answers='<div class="verb-answer-area building-area"><div class="sentence-slots" aria-label="Миний бүтээх өгүүлбэр"></div><div class="word-bank" aria-label="Өрөх үгс"></div></div>';
    const wrong=shuffle(data.actions.filter(item=>item.present!==action.present))[0];
    round.bank=shuffle([...tokens.map((text,index)=>({id:`word-${index}`,text})),{id:'extra-verb',text:wrong.present}]);
  }
  const title=mode==='learn'?'Ямар үйлдэл хийж байна вэ?':mode==='read'?'Уншаад, тохирох зургийг олъё.':'Зургийн өгүүлбэрийг бүтээе.';
  const instruction=mode==='build'?'Үгэнд хүрч дарааллаар нь өрөөрэй. Өрсөн үгэндээ хүрвэл буцаана.':mode==='read'?'Өгүүлбэрээ чангаар уншаад, зөв зурагт хүрээрэй.':'Зургийг ажиглаад, үйл үгээ сонгоорой.';
  frame(round.mode.title,`<div class="game-body verb-game mode-${mode}"><div class="game-progress" role="progressbar" aria-label="Үйл үгийн дасгалын ахиц" aria-valuemin="0" aria-valuemax="${round.queue.length}" aria-valuenow="${round.index}"><span style="width:${round.index/round.queue.length*100}%"></span></div><div class="game-clock-row"><span class="question-clock" role="timer" aria-label="Үлдсэн хугацаа">◷ <b class="verb-remaining">${round.seconds?time(round.seconds):'∞'}</b><small>${round.seconds?'үлдлээ':'хугацаагүй'}</small></span><span class="elapsed-clock">Нийт <b class="verb-elapsed">${time(Math.floor((Date.now()-round.started)/1000))}</b></span></div><div class="question-meta">ДААЛГАВАР ${round.index+1} / ${round.queue.length}${mode==='learn'?'':` · ${tokens.length} ҮГТЭЙ`}</div><h3>${title}</h3>${prompt}${answers}<div class="verb-feedback feedback" role="status" aria-live="polite">${instruction}</div><button class="next-button verb-next" ${mode==='build'?'':'disabled'}>${mode==='build'?'Шалгах ✓':round.index+1===round.queue.length?'Амжилтаа харах ✦':'Дараагийнх →'}</button></div>`);
  if(mode==='build')renderBuilder();
  $('#actions-content').querySelectorAll('[data-verb-answer]').forEach(button=>button.onclick=()=>selectAnswer(button));
  $('#actions-content').querySelectorAll('[data-reading-word]').forEach(button=>button.onclick=()=>button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true')));
  $('.verb-next').onclick=()=>{
    if(mode==='build'&&!round.answered){checkBuilder();return;}
    if(!round.answered)return;
    round.index++;if(round.index===round.queue.length)finish();else question();
  };
  round.deadline=Date.now()+round.seconds*1000;
  const tick=()=>{if(!round||round.answered){stop();return;}$('.verb-elapsed').textContent=time(Math.floor((Date.now()-round.started)/1000));if(!round.seconds)return;const remaining=Math.max(0,Math.ceil((round.deadline-Date.now())/1000));$('.verb-remaining').textContent=time(remaining);$('#actions-content .question-clock').classList.toggle('urgent',remaining<=5);if(!remaining)expire();};
  ticker=setInterval(tick,250);tick();
}
function renderBuilder(){
  const tokens=sentenceTokens(round.queue[round.index],round.length);
  $('.sentence-slots').innerHTML=tokens.map((_,index)=>{const item=round.bank.find(word=>word.id===round.selected[index]);return `<button class="sentence-slot ${item?'filled':''}" data-sentence-slot="${index}" aria-label="${index+1}-р үг${item?`: ${item.text}, буцаах`:': сонгоогүй'}" ${round.answered?'disabled':''}>${item?item.text:`Үг ${index+1}`}</button>`;}).join('');
  $('.word-bank').innerHTML=round.bank.map(item=>`<button class="bank-word" data-bank-word="${item.id}" ${round.answered||round.selected.includes(item.id)?'disabled':''}>${item.text}</button>`).join('');
  $('#actions-content').querySelectorAll('[data-bank-word]').forEach(button=>button.onclick=()=>{if(round.answered||round.selected.length===tokens.length)return;round.selected.push(button.dataset.bankWord);renderBuilder();});
  $('#actions-content').querySelectorAll('[data-sentence-slot]').forEach(button=>button.onclick=()=>{if(round.answered)return;round.selected.splice(Number(button.dataset.sentenceSlot),1);renderBuilder();});
  $('.verb-next').disabled=!round.answered&&round.selected.length!==tokens.length;
}
function recordMistake(){if(!round.retried){round.mistakes++;round.retried=true;}hooks.chime(false);}
function timeUp(){if(round.seconds&&Date.now()>=round.deadline){expire();return true;}return false;}
function selectAnswer(button){
  if(!round||round.answered||button.disabled||timeUp())return;
  const action=round.queue[round.index];
  if(button.dataset.verbAnswer!==action.id){recordMistake();button.classList.add('wrong');button.disabled=true;$('.verb-feedback').textContent='Зураг, үйлдлийг нь дахин ажиглаад үзье.';return;}
  button.classList.add('correct');correct();
}
function checkBuilder(){
  if(!round||round.answered||timeUp())return;
  const action=round.queue[round.index];
  const selected=round.selected.map(id=>round.bank.find(item=>item.id===id).text);
  if(!sentenceIsCorrect(action,selected,round.length)){recordMistake();$('.verb-feedback').textContent='Зургийг дахин хараад, үгсийн дарааллыг өөрчилж үзье. Өрсөн үгэндээ хүрч буцааж болно.';$('.sentence-slots').classList.add('retry');return;}
  $('.sentence-slots').classList.remove('retry');$('.sentence-slots').classList.add('correct');correct();
}
function correct(){
  stop();round.answered=true;hooks.chime(true);
  const action=round.queue[round.index];learn(action.id);
  if(round.mode.id==='build')renderBuilder();
  $('#actions-content').querySelectorAll('[data-verb-answer]').forEach(button=>button.disabled=true);
  $('.verb-feedback').innerHTML=`<strong>${round.mode.id==='learn'?action.verb+' · ':''}${sentenceTokens(action,round.length).join(' ')}</strong><span>Хамт чангаар уншаарай. Чи чадлаа!</span>`;
  enableNext();
}
function enableNext(){const next=$('.verb-next');next.disabled=false;next.textContent=round.index+1===round.queue.length?'Амжилтаа харах ✦':'Дараагийнх →';next.focus({preventScroll:true});}
function expire(){
  if(!round||round.answered)return;stop();round.answered=true;if(!round.retried)round.mistakes++;
  const action=round.queue[round.index];
  if(round.mode.id==='build'){
    round.selected=sentenceTokens(action,round.length).map((_,index)=>`word-${index}`);renderBuilder();$('.sentence-slots').classList.add('correct');
  }else $('#actions-content').querySelectorAll('[data-verb-answer]').forEach(button=>{button.disabled=true;if(button.dataset.verbAnswer===action.id)button.classList.add('correct');});
  $('.verb-feedback').innerHTML=`<strong>${sentenceTokens(action,round.length).join(' ')}</strong><span>Хугацаа дууслаа. Хамт уншаад авъя!</span>`;enableNext();hooks.chime(false);
}
function finish(){
  stop();state.rounds++;const key=`${round.mode.id}:${round.length}`;const score=round.queue.length-round.mistakes;state.best[key]=Math.max(Number(state.best[key])||0,Math.round(score/round.queue.length*100));save();
  const mode=round.mode.id;
  frame('Миний шинэ өгүүлбэрүүд',`<div class="game-body"><div class="reward">✦</div><h3 class="result-title">Үгс нийлээд өгүүлбэр боллоо!</h3><p class="result-copy">Эхний оролдлогоор ${score} / ${round.queue.length} зөв.<br>${state.learned.length} / ${data.actions.length} үйл үгтэй танил боллоо.<br>◷ ${time(Math.floor((Date.now()-round.started)/1000))}</p><div class="learned-sentences">${round.queue.slice(0,3).map(action=>`<p>${sentenceTokens(action,round.length).join(' ')}</p>`).join('')}</div><div class="result-actions"><button class="secondary-button" id="actions-home">Үйл үгийн цомог</button><button class="primary-button" id="actions-again">Дахин тоглох →</button></div></div>`);
  $('#actions-home').onclick=()=>dialog.close();$('#actions-again').onclick=()=>start(mode);
}
