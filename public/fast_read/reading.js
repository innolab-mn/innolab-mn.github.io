import { countWords, wordsPerMinute, readingSummary, quizScore, MIN_READING_MS } from './reading-logic.js';
const $=(selector,root=document)=>root.querySelector(selector);
const KEY='fast-read-reading-v1';
let state={records:[],fontSize:21};
let library,libraryPromise,hooks,main,session=null,ticker;
let category='all',scope='all';
try{
  const saved=JSON.parse(localStorage.getItem(KEY));
  if(Array.isArray(saved?.records))state.records=saved.records.filter(record=>typeof record.passageId==='string'&&Number.isFinite(record.words)&&record.words>0&&Number.isFinite(record.elapsedMs)&&record.elapsedMs>=0&&Number.isInteger(record.correct)&&record.correct>=0&&record.correct<=5&&record.totalQuestions===5);
  if([18,21,24].includes(saved?.fontSize))state.fontSize=saved.fontSize;
}catch{/* An empty local profile works without storage. */}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{hooks?.toast('Уншлагын ахицыг хадгалж чадсангүй. Энэ удаагийн үр дүнгээ харж болно.');}}
function shuffle(items){const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
function duration(ms){const seconds=Math.floor(ms/1000);return `${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
function speed(value){return value===null?'—':Math.round(value);}
function activeElapsed(){return session.elapsedMs+(session.paused?0:performance.now()-session.activeSince);}
function stopTicker(){clearInterval(ticker);ticker=undefined;}
export function pauseReading(){
  if(!session||session.stage!=='reading'||session.paused)return;
  session.elapsedMs=activeElapsed();session.paused=true;stopTicker();
  if(location.hash==='#reading')updatePause();
}
export function resetReading(){stopTicker();session=null;state.records=[];save();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseReading();});
export async function renderReading(callbacks){
  hooks=callbacks;main=callbacks.main;
  if(!library){
    main.innerHTML='<div class="reading-loading" role="status">Уншлагын номын санг нээж байна…</div>';
    try{
      libraryPromise ||= fetch('./data/readings.json').then(response=>{if(!response.ok)throw Error('Library unavailable');return response.json();});
      library=await libraryPromise;
      if(!Array.isArray(library.passages)||!library.passages.length)throw Error('Invalid reading library');
      document.querySelector('[data-view="reading"] b').textContent=library.passages.length;
      const ids=new Set(library.passages.map(passage=>passage.id));state.records=state.records.filter(record=>ids.has(record.passageId));
    }catch{
      library=undefined;libraryPromise=undefined;
      if(location.hash!=='#reading')return;
      main.innerHTML='<div class="empty"><h1>Эхүүд ачаалагдсангүй</h1><p>Дахин нээж үзээрэй.</p><button class="primary-button" id="reading-retry">Дахин оролдох</button></div>';
      $('#reading-retry').onclick=()=>renderReading(hooks);return;
    }
  }
  if(location.hash!=='#reading')return;
  document.title=`fast_read — Уншлагын хурд, ${library.passages.length} эх`;
  if(session?.stage==='reading')drawReader();else if(session?.stage==='quiz')drawQuiz();else if(session?.stage==='result')drawResult();else drawLibrary();
}
function scopedRecords(){return scope==='first'?state.records.filter((record,index,all)=>all.findIndex(item=>item.passageId===record.passageId)===index):state.records;}
function drawLibrary(){
  const records=scopedRecords();const summary=readingSummary(records);
  const categories=[...new Map(library.passages.map(passage=>[passage.category,passage.categoryLabel])).entries()];
  const recent=records.filter(record=>record.elapsedMs>=MIN_READING_MS).slice(-8);
  const max=Math.max(1,...recent.map(record=>wordsPerMinute(record.words,record.elapsedMs)));
  main.innerHTML=`<section class="reading-hero"><div><span class="eyebrow">9 НАСТАЙ УНШИГЧДАД · ${library.passages.length} ШИНЭ ТҮҮХ</span><h1>Уншаад ойлгоё.<br><em>Хурдаа ахиулъя.</em></h1><p>Өдөр тутмын жижиг нууц, сонин учралтай ${library.passages.length} эх.<br>Эхээ уншаад, таван асуултаар утгыг нь бататгаарай.</p></div><img src="assets/reading.svg" alt="Хамт ном уншиж буй хүүхдүүд"></section>
    <div class="reading-scope" aria-label="Дундаж тооцох уншилт"><button data-reading-scope="all" aria-pressed="${scope==='all'}">Бүх уншилт</button><button data-reading-scope="first" aria-pressed="${scope==='first'}">Эх бүрийн анхны уншилт</button></div>
    <section class="reading-stats" aria-label="Уншлагын ахиц"><div><span>Уншсан эх</span><strong>${new Set(state.records.map(record=>record.passageId)).size}<small> / ${library.passages.length}</small></strong></div><div><span>Дундаж хурд</span><strong>${speed(summary.average)}<small> үг/мин</small></strong></div><div><span>Утгын ойлголт</span><strong>${summary.accuracy===null?'—':summary.accuracy+'%'}<small> зөв хариулт</small></strong></div><div><span>Дуусгасан уншилт</span><strong>${summary.attempts}<small> удаа</small></strong></div></section>
    <p class="reading-average-note">Дундаж = нийт уншсан үг ÷ нийт идэвхтэй минут. Түр зогссон болон асуулт бөглөсөн хугацаа орохгүй. ${scope==='all'?'Давтан уншилтууд орсон.':'Эх бүрийн зөвхөн анхны оролдлогыг харуулж байна.'}</p>
    ${recent.length?`<section class="reading-history"><div><h2>Сүүлийн уншилтууд</h2><p>Хурд болон ойлголтын оноогоо хамт харьцуулаарай.</p></div><div class="reading-bars" aria-label="Сүүлийн ${recent.length} уншилтын хурд">${recent.map(record=>{const passage=library.passages.find(item=>item.id===record.passageId);const value=wordsPerMinute(record.words,record.elapsedMs);return `<div title="${passage.title}: ${Math.round(value)} үг/мин, ${record.correct}/5 зөв"><b>${Math.round(value)}</b><span style="height:${Math.max(8,value/max*62)}px"></span><small>${String(passage.order).padStart(2,'0')} · ${record.correct}/5</small></div>`;}).join('')}</div></section>`:''}
    <div class="section-heading reading-library-heading"><div><h2>Миний ${library.passages.length} эх</h2><p>Эх бүр 200-аас дээш үгтэй. Өөрт сонирхолтойгоосоо сонгоорой.</p></div><span>${state.records.length} нийт оролдлого</span></div>
    <div class="reading-categories" aria-label="Эхийн сэдэв"><button data-reading-category="all" aria-pressed="${category==='all'}">Бүх эх</button>${categories.map(([id,label])=>`<button data-reading-category="${id}" aria-pressed="${category===id}">${label}</button>`).join('')}</div>
    <div class="reading-library">${library.passages.filter(passage=>category==='all'||passage.category===category).map(passage=>{
      const attempts=state.records.filter(record=>record.passageId===passage.id);const latest=attempts.at(-1);
      return `<article class="reading-card"><div class="reading-card-top"><span>${String(passage.order).padStart(2,'0')}</span><small>${passage.categoryLabel}</small>${latest?'<b aria-label="Уншсан">✓</b>':''}</div><h3>${passage.title}</h3><p>${passage.teaser}</p><div class="reading-card-meta"><span>${countWords(passage.paragraphs.join(' '))} үг</span><span>5 асуулт</span></div>${latest?`<div class="reading-last">Сүүлд: ${latest.elapsedMs>=MIN_READING_MS?Math.round(wordsPerMinute(latest.words,latest.elapsedMs))+' үг/мин':'хурд тооцоогүй'} · ${latest.correct}/5 зөв</div>`:'<div class="reading-last">Шинэ түүх чамайг хүлээж байна.</div>'}<button class="level-button" data-open-reading="${passage.id}"><span>${latest?'Давтан унших':'Эхийг сонгох'}</span><span>→</span></button></article>`;
    }).join('')}</div><aside class="lesson-guide reading-tip">Хурдлахын тулд үг алгасах хэрэггүй. Эхлээд үйл явдлыг ойлгож, өгүүлбэрийн төгсгөлд түр амсхийгээрэй. Дараа нь өөрийн өмнөх уншилттай харьцуулаарай.</aside>`;
  main.querySelectorAll('[data-reading-scope]').forEach(button=>button.onclick=()=>{scope=button.dataset.readingScope;drawLibrary();});
  main.querySelectorAll('[data-reading-category]').forEach(button=>button.onclick=()=>{category=button.dataset.readingCategory;drawLibrary();});
  main.querySelectorAll('[data-open-reading]').forEach(button=>button.onclick=()=>preview(button.dataset.openReading));
}
function preview(id){
  const passage=library.passages.find(item=>item.id===id);const attempts=state.records.filter(record=>record.passageId===id);
  main.innerHTML=`<section class="reading-preview"><button class="reading-back">← Эхийн жагсаалт</button><span class="eyebrow">ЭХ ${String(passage.order).padStart(2,'0')} · ${passage.categoryLabel}</span><h1>${passage.title}</h1><div class="reading-preview-meta"><span>${countWords(passage.paragraphs.join(' '))} үг</span><span>5 асуулт</span><span>${attempts.length?'Давтан уншилт':'Анхны уншилт'}</span></div><img src="assets/images/book.svg" alt="Нээлттэй ном"><ol><li>«Уншиж эхлэх» товчоор эх, цаг хоёр зэрэг нээгдэнэ.</li><li>Эхийг дуустал тайван, ойлгож уншаарай.</li><li>«Уншиж дууслаа» дараад таван асуултад хариулна.</li></ol><p>Түр зогсоовол эх халхлагдаж, цаг зогсоно. Өөр хуудас руу шилжихэд мөн түр зогсоно.</p><button class="primary-button" id="start-reading">Уншиж эхлэх →</button></section>`;
  $('.reading-back').onclick=()=>{drawLibrary();window.scrollTo(0,0);};
  $('#start-reading').onclick=()=>start(passage);window.scrollTo(0,0);
}
function start(passage){stopTicker();session={passage,stage:'reading',elapsedMs:0,activeSince:performance.now(),paused:false,quizIndex:0,answers:Array(passage.questions.length).fill(null),order:passage.questions.map(question=>shuffle(question.choices.map((_,index)=>index)))};drawReader();window.scrollTo(0,0);}
function drawReader(){
  const passage=session.passage;
  main.innerHTML=`<section class="reading-session"><div class="reading-toolbar"><button class="reading-back">← Жагсаалт</button><span class="reading-time" role="timer" aria-label="Идэвхтэй уншсан хугацаа">${duration(activeElapsed())}</span><button id="reader-toggle">${session.paused?'Үргэлжлүүлэх':'Түр зогсоох'}</button><button class="primary-button" id="finish-reading" ${session.paused?'disabled':''}>Уншиж дууслаа →</button></div><header class="reading-title"><span class="eyebrow">ЭХ ${String(passage.order).padStart(2,'0')} · ${countWords(passage.paragraphs.join(' '))} ҮГ</span><h1>${passage.title}</h1><label>Үсгийн хэмжээ <select id="reading-font" aria-label="Унших үсгийн хэмжээ">${[18,21,24].map(size=>`<option value="${size}" ${size===state.fontSize?'selected':''}>${size}</option>`).join('')}</select></label></header><article class="reading-sheet ${session.paused?'paused':''}"><div class="reading-paragraphs" style="font-size:${state.fontSize}px" aria-hidden="${session.paused}">${passage.paragraphs.map(paragraph=>`<p>${paragraph}</p>`).join('')}</div></article><div class="reading-pause-note" ${session.paused?'':'hidden'} role="status"><span>Ⅱ</span><strong>Уншлага түр зогссон</strong><p>Үргэлжлүүлэх товчоор цаг, эх хоёроо нээгээрэй.</p></div><div class="reading-end"><span>Эхийн төгсгөл</span><button class="primary-button" id="finish-reading-bottom" ${session.paused?'disabled':''}>Уншиж дууслаа →</button></div></section>`;
  $('.reading-back').onclick=exitToLibrary;
  $('#reader-toggle').onclick=()=>{if(session.paused){session.activeSince=performance.now();session.paused=false;updatePause();startTicker();}else pauseReading();};
  $('#finish-reading').onclick=finishReading;$('#finish-reading-bottom').onclick=finishReading;
  $('#reading-font').onchange=event=>{state.fontSize=Number(event.target.value);$('.reading-paragraphs').style.fontSize=state.fontSize+'px';save();};
  if(!session.paused)startTicker();
}
function updatePause(){
  if(!$('.reading-sheet'))return;
  $('.reading-sheet').classList.toggle('paused',session.paused);$('.reading-paragraphs').setAttribute('aria-hidden',String(session.paused));$('.reading-pause-note').hidden=!session.paused;
  $('#reader-toggle').textContent=session.paused?'Үргэлжлүүлэх':'Түр зогсоох';$('#finish-reading').disabled=session.paused;$('#finish-reading-bottom').disabled=session.paused;$('.reading-time').textContent=duration(activeElapsed());
}
function startTicker(){stopTicker();ticker=setInterval(()=>{if(session?.stage==='reading'&&!session.paused&&$('.reading-time'))$('.reading-time').textContent=duration(activeElapsed());},250);}
function finishReading(){if(!session||session.stage!=='reading'||session.paused)return;session.elapsedMs=activeElapsed();session.paused=true;session.stage='quiz';stopTicker();drawQuiz();window.scrollTo(0,0);}
function exitToLibrary(){stopTicker();session=null;drawLibrary();window.scrollTo(0,0);}
function drawQuiz(){
  const {passage,quizIndex:index,answers}=session;const question=passage.questions[index];
  main.innerHTML=`<section class="reading-session reading-quiz"><button class="reading-back">← Эхийн жагсаалт</button><header><span class="eyebrow">${passage.title} · УТГЫГ НЬ САНАЯ</span><h1>Уншаад юу ойлгов?</h1><p>Уншсан хугацаа: ${duration(session.elapsedMs)}. Асуултын хугацаа хурдад орохгүй.</p></header><div class="quiz-progress" aria-label="${index+1} / ${passage.questions.length} асуулт">${passage.questions.map((_,i)=>`<span class="${i===index?'current':answers[i]!==null?'answered':''}">${i+1}</span>`).join('')}</div><div class="reading-question"><span>АСУУЛТ ${index+1} / ${passage.questions.length}</span><h2>${question.prompt}</h2><fieldset><legend class="sr-only">Зөв хариултыг сонгох</legend>${session.order[index].map((original,position)=>`<label class="reading-option"><input type="radio" name="reading-answer" value="${original}" ${answers[index]===original?'checked':''}><span class="option-letter">${['А','Б','В','Г'][position]}</span><span>${question.choices[original]}</span></label>`).join('')}</fieldset></div><div class="reading-quiz-nav"><button class="secondary-button" id="quiz-back" ${index===0?'disabled':''}>← Өмнөх</button><button class="primary-button" id="quiz-next" ${answers[index]===null?'disabled':''}>${index+1===passage.questions.length?'Үр дүнгээ харах ✦':'Дараагийн асуулт →'}</button></div><p class="reading-quiz-note">Хариултаа сонгоод цаашлаарай. Төгсгөлд нь зөв хариулт, тайлбарыг хамт харна.</p></section>`;
  $('.reading-back').onclick=exitToLibrary;
  main.querySelectorAll('[name="reading-answer"]').forEach(input=>input.onchange=()=>{session.answers[index]=Number(input.value);$('#quiz-next').disabled=false;});
  $('#quiz-back').onclick=()=>{if(index>0){session.quizIndex--;drawQuiz();window.scrollTo(0,0);}};
  $('#quiz-next').onclick=()=>{if(session.answers[index]===null)return;if(index+1<passage.questions.length){session.quizIndex++;drawQuiz();window.scrollTo(0,0);}else complete();};
}
function complete(){
  if(!session||session.stage!=='quiz'||session.answers.some(answer=>answer===null))return;
  const passage=session.passage;
  const record={passageId:passage.id,words:countWords(passage.paragraphs.join(' ')),elapsedMs:Math.round(session.elapsedMs),correct:quizScore(passage.questions,session.answers),totalQuestions:passage.questions.length,completedAt:new Date().toISOString()};
  session.record=record;session.stage='result';state.records.push(record);save();hooks.chime(true);drawResult();window.scrollTo(0,0);
}
function drawResult(){
  const {passage,record}=session;const eligible=record.elapsedMs>=MIN_READING_MS;
  const average=readingSummary(state.records.filter(item=>item.passageId===passage.id));
  const readNumber=state.records.filter(item=>item.passageId===passage.id).length;
  main.innerHTML=`<section class="reading-result"><button class="reading-back">← Эхийн жагсаалт</button><span class="eyebrow">${readNumber===1?'АНХНЫ УНШИЛТ':'ДАВТАН УНШИЛТ'} · ${passage.title}</span><h1>Нэг түүхийн учрыг оллоо!</h1><p class="reading-result-copy">${record.correct>=4?'Үйл явдлыг сайн санажээ. Дараагийн түүх рүү аялахад бэлэн үү?':'Хариултын тайлбарыг хараад, хүсвэл дахин тайван уншаарай.'}</p><div class="reading-result-stats"><div><span>Энэ уншилтын хурд</span><strong>${eligible?speed(wordsPerMinute(record.words,record.elapsedMs)):'—'}<small> үг/мин</small></strong></div><div><span>Энэ эхийн дундаж</span><strong>${speed(average.average)}<small> үг/мин</small></strong></div><div><span>Утгын ойлголт</span><strong>${record.correct}<small> / ${record.totalQuestions} зөв</small></strong></div></div><p class="reading-result-time">${record.words} үг · ${duration(record.elapsedMs)} идэвхтэй уншсан · асуултын хугацаа ороогүй</p>${eligible?'':'<p class="reading-speed-notice">10 секундээс богино хэмжилтийг санамсаргүй дарсан байж болзошгүй тул хурдын дундажид оруулаагүй. Ойлголтын үр дүн хадгалагдсан.</p>'}<div class="reading-result-actions"><button class="primary-button" id="reading-next-story">Дараагийн эх →</button><button class="secondary-button" id="reading-repeat">Эхээ дахин унших</button></div><h2 class="reading-review-title">Хариулт, тайлбар</h2><div class="reading-answer-review">${passage.questions.map((question,index)=>{const correct=session.answers[index]===question.correctIndex;return `<article class="answer-review ${correct?'is-correct':'is-review'}"><span>${index+1} · ${correct?'Зөв олжээ':'Хамт нягталъя'}</span><h3>${question.prompt}</h3><p>Чиний хариулт: <b>${question.choices[session.answers[index]]}</b></p><p class="correct-answer">Зөв хариулт: <strong>${question.choices[question.correctIndex]}</strong></p><p>${question.explanation}</p><blockquote>${question.evidence}</blockquote></article>`;}).join('')}</div><details class="reading-revisit"><summary>Эхийг дахин харж тайлбартай нь тулгах</summary><h2>${passage.title}</h2>${passage.paragraphs.map(paragraph=>`<p>${paragraph}</p>`).join('')}</details></section>`;
  $('.reading-back').onclick=exitToLibrary;
  $('#reading-repeat').onclick=()=>{const id=passage.id;session=null;preview(id);};
  $('#reading-next-story').onclick=()=>{const next=library.passages.find(item=>item.order>passage.order&&!state.records.some(record=>record.passageId===item.id))||library.passages.find(item=>!state.records.some(record=>record.passageId===item.id));session=null;if(next)preview(next.id);else{drawLibrary();window.scrollTo(0,0);}};
}
