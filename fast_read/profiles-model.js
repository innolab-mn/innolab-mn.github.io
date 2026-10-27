export const PROFILE_FORMAT = 'fast-read-profiles';
export const PROFILE_SCHEMA_VERSION = 1;
export const MAX_PROFILES = 50;
export const MAX_PROFILE_FILE_BYTES = 5 * 1024 * 1024;
export const AVATARS = { bird:'🐣', cat:'🐱', dog:'🐶', fox:'🦊', bear:'🐻', panda:'🐼', owl:'🦉', rabbit:'🐰' };
export const GAME_KEYS = {
  'fast-read-progress-v1':'core',
  'fast-read-alphabet-v1':'alphabet',
  'fast-read-actions-v1':'actions',
  'fast-read-reading-v1':'reading',
  'fast-read-shooter-v1':'shooter',
};
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
export function clone(value) { return JSON.parse(JSON.stringify(value)); }
export function profileName(value) {
  if (typeof value !== 'string') throw new Error('Профайлын нэрийг бичээрэй.');
  const name = value.trim();
  if (!name || [...name].length > 40 || /[\u0000-\u001f\u007f]/.test(name)) throw new Error('Нэр 1–40 тэмдэгттэй байна.');
  return name;
}
function safeTree(value, depth = 0) {
  if (depth > 40) throw new Error('Файлын бүтэц хэт гүн байна.');
  if (Array.isArray(value)) { for (const item of value) safeTree(item, depth + 1); }
  else if (object(value)) {
    for (const [key, item] of Object.entries(value)) {
      if (['__proto__','prototype','constructor'].includes(key)) throw new Error('Файл зөвшөөрөгдөөгүй талбартай байна.');
      safeTree(item, depth + 1);
    }
  }
}
function validDate(value) { return typeof value === 'string' && Number.isFinite(Date.parse(value)); }
export function validateArchive(value) {
  safeTree(value);
  if (!object(value) || value.format !== PROFILE_FORMAT) throw new Error('Энэ нь fast_read профайлын файл биш байна.');
  if (value.schemaVersion !== PROFILE_SCHEMA_VERSION) {
    if (Number.isInteger(value.schemaVersion) && value.schemaVersion > PROFILE_SCHEMA_VERSION) throw new Error('Энэ файл шинэ хувилбараар үүссэн байна. Програмаа шинэчлээд дахин импортлоорой.');
    throw new Error('Профайлын файлын хувилбар дэмжигдэхгүй байна.');
  }
  if (!Array.isArray(value.profiles) || !value.profiles.length || value.profiles.length > MAX_PROFILES) throw new Error(`Файлд 1–${MAX_PROFILES} профайл байна.`);
  const ids = new Set();
  for (const profile of value.profiles) {
    if (!object(profile) || typeof profile.id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(profile.id) || ids.has(profile.id)) throw new Error('Профайлын дугаар буруу эсвэл давхардсан байна.');
    ids.add(profile.id);
    profileName(profile.name);
    if (typeof profile.avatar !== 'string' || profile.avatar.length > 40 || !validDate(profile.createdAt) || !validDate(profile.updatedAt) || !object(profile.games)) throw new Error('Профайлын мэдээлэл дутуу байна.');
    for (const game of Object.values(profile.games)) {
      if (!object(game) || !Number.isInteger(game.version) || game.version < 1 || !object(game.state)) throw new Error('Тоглоомын ахицын бүтэц буруу байна.');
    }
  }
  if (value.activeProfileId !== undefined && !ids.has(value.activeProfileId)) throw new Error('Сонгосон профайл жагсаалтад алга байна.');
  return value;
}
// Add explicit v1 -> v2 migration here when the envelope changes. Never guess at
// a newer schema: an older application must leave that file intact.
export function parseProfileFile(text) {
  if (new TextEncoder().encode(text).length > MAX_PROFILE_FILE_BYTES) throw new Error('Файл 5 МБ-аас бага байх ёстой.');
  let value;
  try { value = JSON.parse(text); } catch { throw new Error('JSON файл уншигдсангүй. Зөв экспортолсон файл сонгоорой.'); }
  return clone(validateArchive(value));
}
export function makeProfile(name, avatar, now, id) {
  return { id, name:profileName(name), avatar:Object.hasOwn(AVATARS, avatar) ? avatar : 'bird', createdAt:now, updatedAt:now, games:{} };
}
export function makeArchive(profiles, activeProfileId, now) {
  return { format:PROFILE_FORMAT, schemaVersion:PROFILE_SCHEMA_VERSION, exportedAt:now, activeProfileId, profiles:clone(profiles) };
}
