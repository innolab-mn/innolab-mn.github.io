import { renderAlphabet, resetAlphabet } from './alphabet.js';
import { renderActions, resetActions } from './actions.js';
import { renderReading, pauseReading, resetReading } from './reading.js';
const $ = (selector, root = document) => root.querySelector(selector);
const main = $('#main');
const gameDialog = $('#game-dialog');
const wordDialog = $('#word-dialog');
const STORAGE_KEY = 'fast-read-progress-v1';
const levels = [
  { id: 1, title: 'Зургийг хараад, үгээ олъё', description: 'Зургийг сайн ажиглаад, тохирох үгийг сонгоорой.', count: 5, options: 2, kind: 'word', icon: 'аав', image: 'dad', color: '' },
  { id: 2, title: 'Үгийг уншаад, зургаа олъё', description: 'Үгээ уншаад, түүнд тохирох зурагт хүрээрэй.', count: 8, options: 3, kind: 'picture', icon: 'муур', image: 'cat', color: '' },
  { id: 3, title: 'Одоо бүгдийг нь чадна!', description: 'Зураг, үгээ ээлжлэн олж, сурсан бүхнээ бататгая.', count: 10, options: 4, kind: 'mixed', icon: 'нар', image: 'sun', color: 'purple' },
];
let words = [];
let story;
let alphabet;
let actions;
let progress = { completed: {}, learned: [], storyChoices: {}, sound: true, questionSeconds: 30 };
let session = null;
let filter = 'all';
let audioContext;
let toastTimer;
let questionTicker;
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && typeof saved === 'object') {
    progress.sound = saved.sound !== false;
    if ([0, 15, 30, 60].includes(saved.questionSeconds)) progress.questionSeconds = saved.questionSeconds;
    if (Array.isArray(saved.learned)) progress.learned = [...new Set(saved.learned.filter(x => typeof x === 'string'))];
    if (saved.storyChoices && typeof saved.storyChoices === 'object') progress.storyChoices = saved.storyChoices;
    for (const level of levels) {
      const score = saved.completed?.[level.id];
      if (Number.isInteger(score) && score >= 1 && score <= 3) progress.completed[level.id] = score;
    }
  }
} catch { /* Private browsing or damaged storage: start with an empty profile. */ }

function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); }
  catch { toast('Ахиц хадгалагдсангүй. Энэ удаагийн тоглоомоо үргэлжлүүлж болно.'); }
  updateHeader();
}
function totalStars() { return Object.values(progress.completed).reduce((sum, n) => sum + n, 0); }
function updateHeader() {
  $('#total-stars').textContent = totalStars();
  const sound = $('#sound-toggle');
  sound.textContent = progress.sound ? '♫' : '♪';
  sound.setAttribute('aria-label', progress.sound ? 'Дууг хаах' : 'Дууг нээх');
  sound.setAttribute('aria-pressed', String(progress.sound));
}
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
}
function chime(correct) {
  if (!progress.sound) return;
  try {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    audioContext.resume().catch(() => {});
    const start = audioContext.currentTime;
    (correct ? [523.25, 659.25, 783.99] : [293.66, 261.63]).forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, start + index * .1);
      gain.gain.linearRampToValueAtTime(.07, start + index * .1 + .015);
      gain.gain.exponentialRampToValueAtTime(.001, start + index * .1 + .25);
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(start + index * .1); oscillator.stop(start + index * .1 + .26);
    });
  } catch { /* Sound is optional; the visual feedback is always available. */ }
}
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
function unlocked(id) { return id === 1 || !!progress.completed[id - 1]; }
function image(word, extra = '') { return `<img src="${word.image}" alt="" ${extra}>`; }
function timeText(seconds) { return `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`; }
function stopClock() { clearInterval(questionTicker); questionTicker = undefined; }
function startClock() {
  stopClock();
  const seconds = progress.questionSeconds;
  session.deadline = Date.now() + seconds * 1000;
  function tick() {
    if (!session || session.answered) { stopClock(); return; }
    const elapsed = Math.floor((Date.now() - session.startedAt) / 1000);
    $('#elapsed-time').textContent = timeText(elapsed);
    if (!seconds) return;
    const remaining = Math.max(0, Math.ceil((session.deadline - Date.now()) / 1000));
    $('#remaining-time').textContent = timeText(remaining);
    $('.question-clock').classList.toggle('urgent', remaining <= 5);
    if (remaining === 0) timeExpired();
  }
  questionTicker = setInterval(tick, 250);
  tick();
}
function timeExpired() {
  if (!session || session.answered) return;
  stopClock();
  session.answered = true;
  if (!session.retried) session.mistakes++;
  const word = session.queue[session.index];
  $('#game-content').querySelectorAll('[data-choice]').forEach(button => {
    button.disabled = true;
    if (button.dataset.choice === word.id) button.classList.add('correct');
  });
  $('.feedback').textContent = `Хугацаа дууслаа. Зөв хариулт: ${word.text.toLocaleLowerCase('mn')}. Хамт тогтоогоод авъя!`;
  $('.next-button').hidden = false;
  $('.next-button').focus({preventScroll:true});
  chime(false);
}
function renderSettings() {
  main.innerHTML = `<div class="eyebrow" style="margin-top:28px">ӨӨРИЙН ХУРДААР СУРЪЯ</div><h1 class="page-title">Миний тохиргоо</h1><p class="page-subtitle">Бяцхан уншигчдаа тохируулан тоглоомоо бэлдээрэй. Сонголт бүр автоматаар хадгалагдана.</p><section class="settings-card" aria-labelledby="timer-setting-title"><div class="setting-heading"><span class="stat-icon">◷</span><div><h2 id="timer-setting-title">Асуултын хугацаа</h2><p>Зураг, үгээ харгалзуулах нэг асуултын хугацаа.</p></div></div><fieldset class="time-options"><legend class="sr-only">Асуултын хугацааг сонгох</legend>${[{value:15,title:'15 секунд',text:'Хурдан сэтгэж тоглоё'},{value:30,title:'30 секунд',text:'Тайван ажиглаад олъё'},{value:60,title:'60 секунд',text:'Бодох хугацаа хангалттай'},{value:0,title:'Хугацаагүй',text:'Яаралгүй хамтдаа суръя'}].map(option => `<label class="time-option"><input type="radio" name="question-seconds" value="${option.value}" ${progress.questionSeconds === option.value ? 'checked' : ''}><span><strong>${option.title}</strong><small>${option.text}</small></span></label>`).join('')}</fieldset><div class="setting-note">☀ Хугацаа дуусахад зөв хариултыг харуулна. Дараагийн асуултад товч дарж шилжинэ.</div></section><section class="settings-card"><div class="setting-row"><div><h2>Дууны эффект</h2><p>Зөв, буруу хариултад богино хөг эгшиглэнэ.</p></div><button id="settings-sound" class="toggle" role="switch" aria-label="Дууны эффект" aria-checked="${progress.sound}"><span></span></button></div></section><section class="settings-card"><div class="setting-row"><div><h2>Шинээр эхлэх</h2><p>Танил болсон үг, од болон нээгдсэн түвшнүүдийг эхнээс нь эхлүүлнэ.</p></div><button id="reset-ask" class="secondary-button">Ахиц арилгах</button></div><div id="reset-confirmation" class="reset-confirmation" hidden><p>Бүх од, сурсан үгийн ахицыг энэ төхөөрөмжөөс арилгах уу?</p><button id="reset-cancel" class="secondary-button">Болих</button> <button id="reset-progress" class="danger-button">Тийм, шинээр эхэлье</button></div></section><a class="primary-button" href="#home">Тоглоом руу буцах →</a>`;
  $('#reset-confirmation p').textContent = 'Бүх тоглоомын ахиц болон уншлагын түүх, хурд, ойлголтын үр дүнг энэ төхөөрөмжөөс арилгах уу?';
  $('#reset-ask').closest('.setting-row').querySelector('p').textContent = 'Үг, үсэг, үйл үгийн ахиц болон уншлагын түүхийг хамтад нь шинээр эхлүүлнэ.';
  main.querySelectorAll('[name="question-seconds"]').forEach(input => input.onchange = () => { progress.questionSeconds = Number(input.value); save(); toast('Асуултын хугацаа хадгалагдлаа.'); });
  $('#settings-sound').onclick = () => { progress.sound = !progress.sound; save(); $('#settings-sound').setAttribute('aria-checked', String(progress.sound)); if (progress.sound) chime(true); };
  $('#reset-ask').onclick = () => { $('#reset-confirmation').hidden = false; $('#reset-cancel').focus(); };
  $('#reset-cancel').onclick = () => { $('#reset-confirmation').hidden = true; $('#reset-ask').focus(); };
  $('#reset-progress').onclick = () => { progress.completed = {}; progress.learned = []; progress.storyChoices = {}; resetAlphabet(); resetActions(); resetReading(); save(); renderSettings(); toast('Шинэ аялалд бэлэн боллоо!'); };
}
function chapter(id) { return story.chapters.find(item => item.id === id); }
function storyFrame(id, content) {
  stopClock();
  gameDialog.classList.remove('question-dialog','result-dialog');
  $('#game-content').innerHTML = `<div class="game-head"><h2 id="game-title">Бүлэг ${id} · ${chapter(id).place}</h2><button class="close-button" aria-label="Аяллаас гарах">×</button></div>${content}`;
  $('#game-content .close-button').onclick = () => gameDialog.close();
  gameDialog.scrollTop = 0;
  if (!gameDialog.open) gameDialog.showModal();
}
function renderChapterIntro(id) {
  const part = chapter(id);
  const level = levels.find(item => item.id === id);
  storyFrame(id, `<div class="story-body"><span class="story-kicker">БОРЫН НОМЫН АЯЛАЛ · ${id} / 3</span><img class="story-illustration" src="${part.image}" alt="${part.title}"><h3>${part.title}</h3><p class="story-text">${part.intro}</p><div class="story-goal"><span>▤</span><div><strong>${part.goal}</strong><small>${level.count} даалгавар · ${progress.questionSeconds ? `Нэг асуулт ${progress.questionSeconds} секунд` : 'Яарах хэрэггүй, хугацаагүй'}</small></div></div><button class="primary-button story-begin">${id === 1 ? 'Бортой хамт эхэлье →' : 'Аяллаа үргэлжлүүлье →'}</button><p class="story-footnote">Түүх унших үед цаг гүйхгүй.</p></div>`);
  $('.story-begin').onclick = () => { session.startedAt = Date.now(); renderQuestion(); $('#game-content .choice').focus(); };
}
function renderStoryScene(id) {
  const scene = chapter(id).scene;
  storyFrame(id, `<div class="story-body"><span class="story-kicker">ЗАМД ТОХИОЛДСОН НЭГ МӨЧ</span><img class="story-illustration" src="${scene.image}" alt="${scene.title}"><h3>${scene.title}</h3><p class="story-text">${scene.text}</p><div class="story-choices">${shuffle(scene.choices).map(choice => `<button class="story-choice" data-story-choice="${choice.id}"><span>${choice.label}</span><span>→</span></button>`).join('')}</div><p class="story-footnote">Бортой хамт яаж үргэлжлүүлэх вэ?</p></div>`);
  $('#game-content').querySelectorAll('[data-story-choice]').forEach(button => button.onclick = () => renderStoryOutcome(id, button.dataset.storyChoice, false));
}
function renderStoryOutcome(id, choiceId, repaired) {
  const scene = chapter(id).scene;
  const choice = scene.choices.find(item => item.id === choiceId);
  const canContinue = !choice.repair || repaired;
  progress.storyChoices[id] = { choice: choiceId, repaired };
  save();
  storyFrame(id, `<div class="story-body"><span class="story-kicker">${canContinue ? 'ЗАМ ЦААШ ҮРГЭЛЖИЛНЭ' : 'БОР ТҮР ЗОГСООД АЖИГЛАЛАА'}</span><img class="story-illustration" src="${repaired ? choice.repairImage : choice.image}" alt="Найзуудын замд тохиолдсон мөч"><h3>${canContinue ? 'Дахиад нэг алхам.' : 'Цааш яах бол?'}</h3><p class="story-text" role="status">${repaired ? choice.repaired : choice.outcome}</p><button class="primary-button" id="story-continue">${canContinue ? scene.continueLabel : choice.repair + ' →'}</button><button class="story-reconsider" id="story-reconsider">Өөрөөр бодоод үзье</button></div>`);
  $('#story-continue').onclick = () => {
    if (!canContinue) renderStoryOutcome(id, choiceId, true);
    else if (id < 3) startGame(id + 1);
    else renderStoryEnding();
  };
  $('#story-reconsider').onclick = () => renderStoryScene(id);
}
function renderStoryEnding() {
  storyFrame(3, `<div class="story-body"><span class="story-kicker">БИДНИЙ ХАМТДАА БҮТЭЭСЭН НОМ</span><img class="story-illustration" src="assets/story/ball-friends.svg" alt="Бор, нохой хоёр бөмбөгөөр тоглож байна"><h3>Ном дүүрэн үг.<br>Нуга дүүрэн найз.</h3><p class="story-text">Бор номоо найзууддаа дэлгэв. Хуудас бүрд нэг зураг, нэг үг, хамт өнгөрүүлсэн нэг мөч байлаа.</p><div class="story-word-shelf">${words.filter(word => ['dad','mom','cat','dog','sun','book'].includes(word.id)).map(word => `<div>${image(word)}<span>${word.text}</span></div>`).join('')}</div><button class="primary-button" id="story-end-home">Миний аялал руу →</button><p class="story-footnote">Номоо дахин дэлгэх бүрд шинэ зүйл анзаарч болно.</p></div>`);
  $('#story-end-home').onclick = () => gameDialog.close();
}
function renderHome() {
  const completed = Object.keys(progress.completed).length;
  main.innerHTML = `
    <section class="hero story-hero" aria-labelledby="hero-title"><div class="hero-copy"><div class="eyebrow">${words.length} ҮГ · 3 БҮЛЭГ · НЭГ ХАМТЫН АЯЛАЛ</div><h1 id="hero-title">Бяцхан Борын<br><em>номын аялал</em></h1><p>${story.subtitle}<br>Бортой хамт тоглонгоо уншиж сурцгаая!</p><span class="hero-badge"><span>✦</span> Замд юу тохиолдох бол?</span></div><img class="hero-art" src="assets/story/chapter-1.svg" alt="Бор шувуу гэрийнхээ дэргэд номоо дэлгэжээ"></section>
    <a class="alphabet-invite" href="#alphabet"><div><span>ШИНЭ ТОГЛООМ · 35 ҮСЭГ</span><strong>Үсгүүд дүрс болон хувирлаа!</strong><small>Өөр өөр фонттой үсэг найзуудаа таниарай. →</small></div><div aria-hidden="true"><img src="assets/alphabet/a-nunito.svg" alt=""><img src="assets/alphabet/m-comfortaa.svg" alt=""></div></a>
    <section class="stats" aria-label="Миний ахиц"><div class="stat"><span class="stat-icon">▤</span><div><strong>${progress.learned.length}<span style="color:#bcc4d2;font-size:13px"> / ${words.length}</span></strong><small>Танил болсон үг</small></div></div><div class="stat"><span class="stat-icon">✦</span><div><strong>${totalStars()}<span style="color:#bcc4d2;font-size:13px"> / 9</span></strong><small>Цуглуулсан од</small></div></div><div class="stat"><span class="stat-icon">⚑</span><div><strong>${completed}<span style="color:#bcc4d2;font-size:13px"> / 3</span></strong><small>Дуусгасан түвшин</small></div></div></section>
    <section aria-labelledby="levels-title"><div class="section-heading"><div><h2 id="levels-title">Аяллын гурван бүлэг</h2><p>Үгээ олоод, Борын түүхийг цааш үргэлжлүүлээрэй.</p></div><span style="font-size:10px;color:#a0a9b9">3 түвшин</span></div><div class="level-grid">${levels.map(level => {
      const open = unlocked(level.id); const stars = progress.completed[level.id];
      const part = chapter(level.id);
      return `<article class="level-card story-level-card"><div class="level-top"><span class="pill">БҮЛЭГ 0${level.id}</span><span class="level-status">${stars ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : open ? '● Нээлттэй' : '⌑ Түгжээтэй'}</span></div><div class="level-illustration story-card-art" aria-hidden="true"><img src="${part.image}" alt=""></div><small class="chapter-place">${part.place}</small><h3>${part.title}</h3><p>${part.goal}</p><div class="level-meta"><span>◷ ${level.count} даалгавар</span><span>${level.options} сонголт</span></div><button class="level-button" data-start="${level.id}" ${open ? '' : 'disabled'}><span>${stars ? 'Дахин аялах' : open ? 'Тоглож эхлэх' : `Эхлээд ${level.id - 1}-р бүлгийг дуусгаарай`}</span><span>${open ? '→' : '⌑'}</span></button>${stars ? `<button class="revisit-story" data-scene="${level.id}">Борын мөчийг эргэн харах ↗</button>` : ''}</article>`;
    }).join('')}</div></section>
    <aside class="daily-tip"><span class="tip-icon">☀</span><div><strong>Хамтдаа сурах жижигхэн зөвлөгөө</strong><p>Зургийг нь хараад, үгийг нь хамт чангаар хэлээрэй. Яарах хэрэггүй шүү!</p></div><span>✧</span></aside>`;
  main.querySelectorAll('[data-start]').forEach(button => button.addEventListener('click', () => startGame(Number(button.dataset.start))));
  main.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => renderStoryScene(Number(button.dataset.scene))));
}
function renderWords() {
  const categories = [{id:'all',label:'Бүх үг'}, ...words.reduce((map, word) => map.set(word.category, {id:word.category,label:word.categoryLabel}), new Map()).values()];
  main.innerHTML = `<div class="eyebrow" style="margin-top:28px">ХАРААД · НЭРЛЭЭД · ТОГТООГООРОЙ</div><h1 class="page-title">Миний анхны ${words.length} үг</h1><p class="page-subtitle">Зураг бүр нэг найз. Хүрч сонгоод, үгтэй нь танилцаарай.</p><div class="filters" aria-label="Үгийн ангилал">${categories.map(category => `<button data-filter="${category.id}" class="${filter === category.id ? 'active' : ''}" aria-pressed="${filter === category.id}">${category.label}</button>`).join('')}</div><div class="word-grid">${words.filter(word => filter === 'all' || word.category === filter).map(word => `<button class="word-card" data-word="${word.id}" style="--tint:${word.color}" aria-label="${word.text} үгтэй танилцах">${image(word)}<strong>${word.text}</strong><small>${word.categoryLabel}</small>${progress.learned.includes(word.id) ? '<span class="learned-mark" aria-label="Танил болсон">✓</span>' : ''}</button>`).join('')}</div>`;
  main.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => { filter = button.dataset.filter; renderWords(); }));
  main.querySelectorAll('[data-word]').forEach(button => button.addEventListener('click', () => openWord(button.dataset.word)));
}
function openWord(id) {
  const word = words.find(item => item.id === id);
  $('#word-content').innerHTML = `<div class="word-detail"><button class="close-button" aria-label="Хаах">×</button><div>${image(word)}</div><span class="pill">${word.categoryLabel}</span><h2>${word.text}</h2><p>${word.sentence}</p><button class="primary-button">Танил боллоо ✓</button></div>`;
  $('#word-content .close-button').onclick = () => wordDialog.close();
  $('#word-content .primary-button').onclick = () => {
    if (!progress.learned.includes(id)) progress.learned.push(id);
    save(); chime(true); wordDialog.close(); renderWords();
  };
  wordDialog.showModal();
}
async function renderModels() {
  const models = words.filter(word => word.model);
  main.innerHTML = `<div class="eyebrow" style="margin-top:28px">ЭРГҮҮЛЭЭД · АЖИГЛААД · НЭРЛЭЭРЭЙ</div><h1 class="page-title">Үгс амилдаг 3D ертөнц</h1><p class="page-subtitle">Загварт хүрч эргүүлээрэй. Хоёр хуруугаар ойртуулж, холдуулж болно.</p><div class="model-layout"><div class="model-stage"><model-viewer id="viewer" camera-controls touch-action="pan-y" shadow-intensity="1" interaction-prompt="auto" loading="eager"></model-viewer><span class="model-label">↔ Хүрч эргүүлээрэй</span><p class="model-error" hidden role="status"></p></div><div class="model-info"><span class="pill">3D ҮГИЙН САН</span><h2 id="model-title"></h2><p id="model-sentence"></p><label for="model-select">Үгээ сонгоорой</label><select id="model-select">${models.map(word => `<option value="${word.id}">${word.text}</option>`).join('')}</select><p>Энэ бол өөр өнцгөөс харж болох зураг. Эргүүлж үзээд, үгийг нь хамт хэлээрэй!</p><a class="primary-button" href="#words">Бүх үгээ харах →</a></div></div>`;
  const viewer = $('#viewer');
  viewer.addEventListener('error', () => {
    $('.model-error').hidden = false;
    $('.model-error').textContent = '3D загварыг нээж чадсангүй. Төхөөрөмжийн WebGL дэмжлэг болон загварын файлыг шалгаарай.';
  });
  function selectModel() {
    const word = models.find(item => item.id === $('#model-select').value);
    viewer.src = word.model; viewer.alt = word.text; viewer.poster = word.image;
    $('#model-title').textContent = word.text; $('#model-sentence').textContent = word.sentence;
    $('.model-error').hidden = true;
  }
  $('#model-select').onchange = selectModel;
  selectModel();
  if (!customElements.get('model-viewer')) {
    try { await import('./vendor/model-viewer.min.js'); }
    catch { if ($('.model-error')) { $('.model-error').hidden = false; $('.model-error').textContent = '3D харагч ачаалагдсангүй. Үгийн сангаас зургаа үзэж болно.'; } }
  }
}
function startGame(id) {
  const level = levels.find(item => item.id === id);
  if (!level || !unlocked(id)) return;
  stopClock();
  session = { level, queue: shuffle(words).slice(0, level.count), index: 0, mistakes: 0, retried: false, answered: false, choices: [], startedAt: null };
  renderChapterIntro(id);
}
function renderQuestion() {
  gameDialog.classList.add('question-dialog');
  gameDialog.classList.remove('result-dialog');
  const word = session.queue[session.index];
  const {level} = session;
  const kind = level.kind === 'mixed' ? (session.index % 2 ? 'picture' : 'word') : level.kind;
  session.answered = false; session.retried = false;
  session.choices = shuffle([word, ...shuffle(words.filter(item => item.id !== word.id)).slice(0, level.options - 1)]);
  $('#game-content').innerHTML = `<div class="game-head"><h2 id="game-title">Түвшин ${level.id} · ${kind === 'word' ? 'Үгээ олъё' : 'Зургаа олъё'}</h2><button class="close-button" aria-label="Тоглоомоос гарах">×</button></div><div class="game-body"><div class="game-progress" role="progressbar" aria-label="Даалгаврын ахиц" aria-valuemin="0" aria-valuemax="${level.count}" aria-valuenow="${session.index}"><span style="width:${session.index / level.count * 100}%"></span></div><div class="game-clock-row"><span class="question-clock" role="timer" aria-label="Үлдсэн хугацаа">◷ <b id="remaining-time">${progress.questionSeconds ? timeText(progress.questionSeconds) : '∞'}</b><small>${progress.questionSeconds ? 'үлдлээ' : 'хугацаагүй'}</small></span><span class="elapsed-clock">Нийт <b id="elapsed-time">${timeText(Math.floor((Date.now() - session.startedAt) / 1000))}</b></span></div><div class="question-meta">ДААЛГАВАР ${session.index + 1} / ${level.count}</div><h3>${kind === 'word' ? 'Энэ ямар зураг вэ?' : 'Энэ үг аль зурагтай найз вэ?'}</h3>${kind === 'word' ? image(word, 'class="prompt-picture"') : `<div class="prompt-word">${word.text}</div>`}<div class="choices">${session.choices.map((choice, i) => `<button class="choice" data-choice="${choice.id}" aria-label="${kind === 'word' ? choice.text : `${i + 1}-р зураг`}">${kind === 'word' ? choice.text : image(choice)}</button>`).join('')}</div><div class="feedback" role="status" aria-live="polite">Зөв ${kind === 'word' ? 'үгэнд' : 'зурагт'} хүрээрэй.</div><button class="next-button" hidden>${session.index + 1 === level.count ? 'Амжилтаа харах ✦' : 'Дараагийнх →'}</button></div>`;
  $('#game-content .close-button').onclick = () => gameDialog.close();
  $('#game-content').querySelectorAll('[data-choice]').forEach(button => button.onclick = () => answer(button));
  $('.next-button').onclick = () => {
    session.index++;
    if (session.index === level.count) finishGame();
    else { renderQuestion(); $('#game-content .choice').focus(); }
  };
  startClock();
}
function answer(button) {
  if (!session || session.answered || button.disabled) return;
  if (progress.questionSeconds && Date.now() >= session.deadline) { timeExpired(); return; }
  const word = session.queue[session.index];
  const correct = button.dataset.choice === word.id;
  chime(correct);
  if (!correct) {
    button.classList.add('wrong'); button.disabled = true;
    if (!session.retried) { session.mistakes++; session.retried = true; }
    $('.feedback').textContent = 'Дахиад ажиглаад үзье. Чи чадна!';
    return;
  }
  session.answered = true;
  stopClock();
  button.classList.add('correct');
  $('#game-content').querySelectorAll('[data-choice]').forEach(choice => choice.disabled = true);
  if (!progress.learned.includes(word.id)) { progress.learned.push(word.id); save(); }
  $('.feedback').textContent = `Мундаг байна! Энэ бол ${word.text.toLocaleLowerCase('mn')}.`;
  $('.next-button').hidden = false;
  $('.next-button').focus({preventScroll:true});
}
function finishGame() {
  stopClock();
  gameDialog.classList.remove('question-dialog');
  gameDialog.classList.add('result-dialog');
  const {level, mistakes} = session;
  const stars = mistakes === 0 ? 3 : mistakes <= Math.ceil(level.count / 3) ? 2 : 1;
  progress.completed[level.id] = Math.max(progress.completed[level.id] || 0, stars);
  save();
  $('#game-content').innerHTML = `<div class="game-head"><h2 id="game-title">Миний амжилт</h2><button class="close-button" aria-label="Хаах">×</button></div><div class="game-body"><div class="reward">✦</div><h3 class="result-title">Чи чадлаа, бяцхан уншигч!</h3><p class="result-copy">${level.count} даалгавраа бүгдийг дуусгалаа.<br>${level.id < 3 ? 'Дараагийн түвшин чинь нээгдлээ!' : 'Бүх түвшнээ дуусгалаа. Дахин тоглож үгсээ бататгаарай!'}</p><div class="result-stars" aria-label="${stars} од">${'★'.repeat(stars)}${'☆'.repeat(3-stars)}</div><p class="result-copy">Эхний оролдлогоор ${level.count - mistakes} / ${level.count} зөв<br>◷ Нийт хугацаа: ${timeText(Math.floor((Date.now() - session.startedAt) / 1000))}</p><div class="result-actions"><button class="secondary-button" id="go-home">Миний аялал</button><button class="primary-button" id="play-next">${level.id < 3 ? 'Дараагийн түвшин →' : 'Дахин тоглох ↻'}</button></div></div>`;
  $('#game-content .close-button').onclick = () => gameDialog.close();
  $('#go-home').onclick = () => gameDialog.close();
  $('#play-next').textContent = 'Бортой цааш алхъя →';
  $('#play-next').onclick = () => renderStoryScene(level.id);
}
function route() {
  const view = location.hash.slice(1) || 'home';
  if(view!=='reading')pauseReading();
  document.title = view === 'reading' ? 'fast_read — Уншлагын хурд' : view === 'actions' ? 'fast_read — Үйл үг, өгүүлбэр' : view === 'alphabet' ? 'fast_read — 35 үсгийн дүрст аялал' : 'fast_read — Бяцхан Борын номын аялал';
  document.querySelectorAll('[data-view]').forEach(link => {
    link.classList.toggle('active', link.dataset.view === view);
    if (link.dataset.view === view) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  if (view === 'words') renderWords(); else if (view === 'models') renderModels(); else if (view === 'settings') renderSettings(); else if (view === 'alphabet') renderAlphabet(alphabet, {main,chime,toast,getQuestionSeconds:()=>progress.questionSeconds}); else if(view==='actions')renderActions(actions,{main,chime,toast,getQuestionSeconds:()=>progress.questionSeconds}); else if(view==='reading')renderReading({main,chime,toast}); else renderHome();
  window.scrollTo(0, 0);
}
gameDialog.addEventListener('close', () => { stopClock(); session = null; route(); });
for (const dialog of [gameDialog, wordDialog]) dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
$('#sound-toggle').onclick = () => { progress.sound = !progress.sound; save(); if (progress.sound) chime(true); if (location.hash === '#settings') renderSettings(); };
window.addEventListener('hashchange', route);
try {
  const responses = await Promise.all([fetch('./data/words.json'), fetch('./data/story.json'), fetch('./data/alphabet.json'),fetch('./data/actions.json')]);
  if (responses.some(response => !response.ok)) throw new Error('Content unavailable');
  [words, story, alphabet, actions] = await Promise.all(responses.map(response => response.json()));
  if (!Array.isArray(words) || words.length < 4) throw new Error('Invalid word collection');
  if (!Array.isArray(story?.chapters) || story.chapters.length !== levels.length) throw new Error('Invalid story');
  if (!Array.isArray(alphabet?.letters) || alphabet.letters.length !== 35) throw new Error('Invalid alphabet');
  if (!Array.isArray(actions?.actions) || actions.actions.length < 3) throw new Error('Invalid action collection');
  progress.learned = progress.learned.filter(id => words.some(word => word.id === id));
  $('#word-count').textContent = words.length;
  updateHeader(); route();
} catch {
  main.innerHTML = '<div class="empty"><h1>Үгсээ ачаалж чадсангүй</h1><p>Хуудсаа шинэчлээд дахин оролдоорой. Сайтыг static HTTP серверээр нээгээрэй.</p><button class="primary-button" id="retry">Дахин оролдох</button></div>';
  $('#retry').onclick = () => location.reload();
}
