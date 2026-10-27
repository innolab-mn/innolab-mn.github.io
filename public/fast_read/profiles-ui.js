import { profiles } from './profiles-store.js';
import { AVATARS, MAX_PROFILE_FILE_BYTES, parseProfileFile } from './profiles-model.js';
const escape = text => String(text).replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
const avatar = profile => Object.hasOwn(AVATARS, profile.avatar) ? AVATARS[profile.avatar] : '🙂';
function avatarOptions(selected = 'bird') {
  return Object.entries(AVATARS).map(([id, emoji]) => `<option value="${id}" ${id === selected ? 'selected' : ''}>${emoji}</option>`).join('');
}
function summary(profile) {
  const games = profile.games;
  const count = gameId => Array.isArray(games[gameId]?.state.learned) ? games[gameId].state.learned.length : 0;
  const readings = games.reading?.state.records;
  const read = Array.isArray(readings) ? new Set(readings.map(record => record?.passageId).filter(id => typeof id === 'string')).size : 0;
  return `${count('core')} үг · ${count('alphabet')} үсэг · ${count('actions')} үйл үг · ${count('shooter')} харваа · ${read} эх`;
}
export function updateProfileHeader() {
  const profile = profiles.current();
  const label = document.querySelector('#profile-label');
  if (label) label.textContent = `${avatar(profile)} ${profile.name}`;
  const greeting = document.querySelector('#profile-greeting');
  if (greeting) greeting.textContent = `Сайн уу, ${profile.name}! ☀`;
}
export function renderProfiles({ main, toast }) {
  let pending = null;
  const $ = selector => main.querySelector(selector);
  function message(text, error = false) {
    const status = $('#profile-status');
    status.textContent = text;
    status.classList.toggle('is-error', error);
  }
  function action(run) {
    try { run(); } catch (error) { message(error.message || 'Үйлдэл амжилтгүй боллоо.', true); }
  }
  function draw(notice = '') {
    if (location.hash !== '#profiles') return;
    const active = profiles.current();
    const list = profiles.list();
    pending = null;
    main.innerHTML = `<section class="profiles-hero"><span class="eyebrow">ХҮҮХЭД БҮР ӨӨРИЙН АЯЛАЛТАЙ</span><h1>Хэн сурах вэ?</h1><p>Нэрээ сонгоод өөрийн ахицтайгаа үргэлжлүүлээрэй.<br>Хүүхэд бүрийн тоглоом, уншлагын түүх тусдаа хадгалагдана.</p></section>
      <p id="profile-status" class="profile-status" role="status" aria-live="polite">${escape(notice)}</p>
      ${profiles.warning() ? `<p class="profile-warning">${escape(profiles.warning())}</p>` : ''}
      <section class="profile-grid" aria-label="Хүүхдийн профайлууд">${list.map(profile => `<article class="profile-card ${profile.id === active.id ? 'is-active' : ''}"><span class="profile-emoji" aria-hidden="true">${avatar(profile)}</span><h2>${escape(profile.name)}</h2><p>${escape(summary(profile))}</p>${profile.importedFrom ? '<small>Файлаас импортолсон хуулбар</small>' : ''}<button class="${profile.id === active.id ? 'secondary-button' : 'primary-button'}" data-select-profile="${escape(profile.id)}" ${profile.id === active.id ? 'disabled aria-current="true"' : ''}>${profile.id === active.id ? 'Одоо ашиглаж байна' : 'Энэ профайлыг сонгох'}</button></article>`).join('')}</section>
      <section class="profile-panel"><h2>Шинэ хүүхдийн профайл</h2><form id="profile-create"><label>Хүүхдийн нэр<input id="new-profile-name" name="name" maxlength="40" required autocomplete="off" placeholder="Жишээ нь: Ану"></label><label>Дүрс<select name="avatar" aria-label="Шинэ профайлын дүрс">${avatarOptions()}</select></label><button class="primary-button" type="submit">Профайл үүсгэх</button></form><p>Үүсгэсний дараа жагсаалтаас сонгож тоглоно.</p></section>
      <section class="profile-panel"><h2>Одоогийн профайлаа засах</h2><form id="profile-edit"><label>Нэр<input name="name" maxlength="40" required autocomplete="off" value="${escape(active.name)}"></label><label>Дүрс<select name="avatar" aria-label="Одоогийн профайлын дүрс">${avatarOptions(active.avatar)}</select></label><button class="secondary-button" type="submit">Нэр, дүрсээ хадгалах</button></form></section>
      <section class="profile-panel"><h2>Файлаар хадгалах, зөөх</h2><p>JSON файлд нэр, тохиргоо болон бүх тоглоомын ахиц орно. Өөр төхөөрөмж дээр энэ файлаа импортлож үргэлжлүүлнэ.</p><div class="profile-export-actions"><button class="primary-button" id="profile-export-one">Миний профайлыг экспортлох</button><button class="secondary-button" id="profile-export-all">Бүх профайлыг экспортлох</button></div><label class="profile-file-label">Профайлын JSON файл импортлох<input id="profile-import-file" type="file" accept=".json,application/json"></label><div id="profile-import-preview" hidden></div><p class="profile-format-note">Формат v1 · Хувилбартай тоглоомын ахиц · Импорт нь одоогийн ахицыг дарж бичихгүй.</p></section>
      <aside class="lesson-guide">Эдгээр нь энэ хөтөч дээр хадгалагддаг хүүхдийн профайл юм. Файлаа экспортлож нөөцлөөрэй. Профайл солиход хуудас дахин нээгдэнэ; дуусгасан дасгалын ахиц хадгалагдана.</aside>`;
    main.querySelectorAll('[data-select-profile]').forEach(button => button.onclick = () => action(() => {
      profiles.select(button.dataset.selectProfile);
      location.reload();
    }));
    $('#profile-create').onsubmit = event => {
      event.preventDefault();
      action(() => {
        const values = new FormData(event.currentTarget);
        const profile = profiles.create(values.get('name'), values.get('avatar'));
        draw(`«${profile.name}» профайл үүслээ. Жагсаалтаас сонгоорой.`);
      });
    };
    $('#profile-edit').onsubmit = event => {
      event.preventDefault();
      action(() => {
        const values = new FormData(event.currentTarget);
        profiles.rename(values.get('name'), values.get('avatar'));
        updateProfileHeader(); draw('Нэр, дүрс хадгалагдлаа.');
      });
    };
    $('#profile-export-one').onclick = () => action(() => download([active.id]));
    $('#profile-export-all').onclick = () => action(() => download(profiles.list().map(profile => profile.id)));
    $('#profile-import-file').onchange = async event => {
      const input = event.currentTarget, file = input.files?.[0];
      pending = null;
      $('#profile-import-preview').hidden = true;
      if (!file) return;
      try {
        if (file.size > MAX_PROFILE_FILE_BYTES) throw new Error('Файл 5 МБ-аас бага байх ёстой.');
        const parsed = parseProfileFile(await file.text());
        // Ignore a read that completed after leaving this page or choosing a new file.
        if (!input.isConnected || input.files?.[0] !== file) return;
        pending = parsed;
        $('#profile-import-preview').innerHTML = `<h3>Импортлох профайлуудаа сонгоорой</h3><p>Сонгосон профайлууд шинэ хуулбар болж нэмэгдэнэ.</p><div class="profile-import-list">${pending.profiles.map((profile, index) => `<label><input type="checkbox" data-import-index="${index}" checked><span>${avatar(profile)} <strong>${escape(profile.name)}</strong><small>${escape(summary(profile))}</small></span></label>`).join('')}</div><button id="profile-import-confirm" class="primary-button">Сонгосон профайлуудыг нэмэх</button>`;
        $('#profile-import-preview').hidden = false;
        message(`${pending.profiles.length} профайлтай v${pending.schemaVersion} файл уншигдлаа. Нэмэхээс өмнө сонголтоо шалгаарай.`);
        $('#profile-import-confirm').onclick = () => action(() => {
          const ids = [...main.querySelectorAll('[data-import-index]:checked')].map(checkbox => pending.profiles[Number(checkbox.dataset.importIndex)].id);
          const imported = profiles.import(pending, ids);
          draw(`${imported.length} профайлыг шинэ хуулбар болгон нэмлээ. Жагсаалтаас сонгоорой.`);
        });
      } catch (error) { message(error.message || 'Файл уншигдсангүй.', true); }
    };
  }
  function download(ids) {
    const archive = profiles.export(ids);
    const url = URL.createObjectURL(new Blob([JSON.stringify(archive, null, 2) + '\n'], { type:'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = `fast-read-${ids.length === 1 ? 'profile' : 'profiles'}-${new Date().toISOString().slice(0,10)}.json`;
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    message(`${ids.length} профайлын JSON файл бэлэн боллоо.`);
    toast('Профайлын файлаа татсан хавтсаас нээж болно.');
  }
  draw();
}
