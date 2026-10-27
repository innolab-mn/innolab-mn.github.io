import { PROFILE_FORMAT, PROFILE_SCHEMA_VERSION, MAX_PROFILES, GAME_KEYS, clone, profileName, makeProfile, makeArchive, validateArchive } from './profiles-model.js';
export const PROFILES_KEY = 'fast-read-profiles-v1';

export function createProfileStore(storage, options = {}) {
  const now = options.now || (() => new Date().toISOString());
  const id = options.id || (() => crypto.randomUUID());
  let registry, warning = '', memoryOnly = !storage, blocked = false;
  const write = next => {
    if (blocked) throw new Error(warning);
    validateArchive(next);
    registry = next;
    if (!memoryOnly) {
      try { storage.setItem(PROFILES_KEY, JSON.stringify(next)); return true; }
      catch { memoryOnly = true; }
    }
    warning = 'Энэ хөтөч ахицыг төхөөрөмжид хадгалж чадсангүй. Хуудсаа хаахаас өмнө JSON файлаар экспортлоорой.';
    return false;
  };
  try {
    const raw = storage?.getItem(PROFILES_KEY);
    if (raw) registry = clone(validateArchive(JSON.parse(raw)));
  } catch {
    blocked = true;
    warning = 'Хадгалсан профайлын сан уншигдахгүй эсвэл шинэ хувилбартай байна. Хуучин санг дарж бичихгүй. Програмаа шинэчлээрэй.';
  }
  if (!registry) {
    const timestamp = now();
    const profile = makeProfile('Миний профайл', 'bird', timestamp, id());
    // Import the real, pre-profile browser saves once. Keep the original keys as
    // a recovery copy; all new writes go only to the selected profile.
    for (const [key, gameId] of Object.entries(GAME_KEYS)) {
      try {
        const state = JSON.parse(storage?.getItem(key) || 'null');
        if (state && typeof state === 'object' && !Array.isArray(state)) profile.games[gameId] = { version:1, state };
      } catch { /* Leave unreadable legacy keys untouched. */ }
    }
    registry = { format:PROFILE_FORMAT, schemaVersion:PROFILE_SCHEMA_VERSION, activeProfileId:profile.id, profiles:[profile] };
    if (!blocked) write(registry);
  }
  // A tab owns the profile it opened with. Another tab selecting a different
  // child cannot accidentally redirect this tab's saves to that child.
  const boundId = registry.activeProfileId || registry.profiles[0].id;
  function fresh() {
    if (!memoryOnly && !blocked) {
      try {
        const raw = storage.getItem(PROFILES_KEY);
        if (raw) registry = clone(validateArchive(JSON.parse(raw)));
      } catch {
        blocked = true;
        warning = 'Профайлын сан өөрчлөгдсөн тул дарж хадгалахгүй. Програмаа шинэчлээд дахин нээгээрэй.';
      }
    }
    return registry;
  }
  function current() {
    const profile = fresh().profiles.find(item => item.id === boundId);
    if (!profile) throw new Error('Энэ цонхны профайл олдсонгүй. Хуудсаа дахин нээгээрэй.');
    return profile;
  }
  function committed(next) {
    if (!write(next)) throw new Error(warning);
  }
  return {
    warning:() => warning,
    current:() => clone(current()),
    list:() => clone(fresh().profiles),
    create(name, avatar) {
      const next = clone(fresh());
      if (next.profiles.length >= MAX_PROFILES) throw new Error(`Нэг хөтөчид ${MAX_PROFILES} хүртэл профайл хадгална.`);
      const profile = makeProfile(name, avatar, now(), id());
      next.profiles.push(profile); committed(next); return clone(profile);
    },
    rename(name, avatar) {
      const next = clone(fresh());
      const profile = next.profiles.find(item => item.id === boundId);
      if (!profile) throw new Error('Профайл олдсонгүй.');
      profile.name = profileName(name);
      profile.avatar = typeof avatar === 'string' && avatar.length <= 40 ? avatar : profile.avatar;
      profile.updatedAt = now(); committed(next);
    },
    select(profileId) {
      const next = clone(fresh());
      if (!next.profiles.some(profile => profile.id === profileId)) throw new Error('Профайл олдсонгүй.');
      next.activeProfileId = profileId; committed(next);
    },
    export(profileIds) {
      const source = fresh();
      const profiles = source.profiles.filter(profile => profileIds.includes(profile.id));
      if (!profiles.length) throw new Error('Экспортлох профайл сонгоорой.');
      // Preserve unknown envelope metadata as well as future game modules.
      return { ...clone(source), ...makeArchive(profiles, profiles.some(profile => profile.id === boundId) ? boundId : profiles[0].id, now()) };
    },
    import(archive, selectedIds) {
      validateArchive(archive);
      const incoming = archive.profiles.filter(profile => selectedIds.includes(profile.id));
      if (!incoming.length) throw new Error('Импортлох профайл сонгоорой.');
      const next = clone(fresh());
      if (next.profiles.length + incoming.length > MAX_PROFILES) throw new Error(`Нийт профайл ${MAX_PROFILES}-аас хэтэрч байна.`);
      const timestamp = now();
      const copies = incoming.map(profile => ({ ...clone(profile), id:id(), name:profileName(profile.name), updatedAt:timestamp, importedFrom:{ profileId:profile.id, importedAt:timestamp } }));
      next.profiles.push(...copies); committed(next); return clone(copies);
    },
    // LocalStorage-shaped adapter keeps every game on the same profile without
    // coupling its scoring code to the archive format.
    storage: {
      getItem(key) {
        const game = current().games[GAME_KEYS[key]];
        if (!game) return null;
        if (game.version !== 1) throw new Error('Энэ ахиц шинэ тоглоомын хувилбартай байна.');
        return JSON.stringify(game.state);
      },
      setItem(key, value) {
        const gameId = GAME_KEYS[key];
        if (!gameId) throw new Error('Unknown game storage key');
        const next = clone(fresh());
        const profile = next.profiles.find(item => item.id === boundId);
        if (!profile) throw new Error('Профайл олдсонгүй.');
        const previous = profile.games[gameId];
        if (previous && previous.version !== 1) throw new Error('Шинэ хувилбарын ахицыг хуучин програмаар дарж бичихгүй.');
        const state = JSON.parse(value);
        profile.games[gameId] = { ...previous, version:1, state:{ ...previous?.state, ...state } };
        profile.updatedAt = now(); committed(next);
      },
      removeItem(key) {
        const gameId = GAME_KEYS[key];
        if (!gameId) throw new Error('Unknown game storage key');
        const next = clone(fresh());
        const profile = next.profiles.find(item => item.id === boundId);
        if (!profile) throw new Error('Профайл олдсонгүй.');
        if (profile.games[gameId] && profile.games[gameId].version !== 1) throw new Error('Шинэ хувилбарын ахицыг хуучин програмаар арилгахгүй.');
        delete profile.games[gameId]; profile.updatedAt = now(); committed(next);
      },
    },
  };
}

let storage;
try { storage = globalThis.localStorage; } catch { /* Export remains available if storage is blocked. */ }
export const profiles = createProfileStore(storage);
export const profileStorage = profiles.storage;
