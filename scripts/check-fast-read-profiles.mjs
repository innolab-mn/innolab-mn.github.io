import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createProfileStore, PROFILES_KEY } from '../public/fast_read/profiles-store.js';
import { GAME_KEYS, clone, parseProfileFile, validateArchive, MAX_PROFILE_FILE_BYTES } from '../public/fast_read/profiles-model.js';
const memory = () => {
  const entries = new Map();
  return { getItem:key => entries.get(key) ?? null, setItem:(key,value) => entries.set(key,value), removeItem:key => entries.delete(key) };
};
let counter = 0;
const options = { now:() => '2026-10-28T08:00:00.000Z', id:() => `test-${++counter}` };
const storage = memory();
const legacy = {
  'fast-read-progress-v1':{ learned:['dad'], completed:{1:3}, sound:false, questionSeconds:60, storyChoices:{1:'help'} },
  'fast-read-alphabet-v1':{ learned:['a'], rounds:2, best:{art:3} },
  'fast-read-actions-v1':{ learned:['walk'], rounds:3, best:{short:3} },
  'fast-read-reading-v1':{ records:[{passageId:'r01',words:236,elapsedMs:120000,correct:4,totalQuestions:5}], fontSize:24 },
  'fast-read-shooter-v1':{ learned:['dad','mom'], rounds:1, best:2 },
};
for (const [key,value] of Object.entries(legacy)) storage.setItem(key, JSON.stringify(value));
const first = createProfileStore(storage, options);
const firstId = first.current().id;
for (const [key,value] of Object.entries(legacy)) {
  assert.deepEqual(JSON.parse(first.storage.getItem(key)), value, `${key} migrates into the initial child`);
  assert.deepEqual(JSON.parse(storage.getItem(key)), value, 'Legacy recovery keys stay unchanged');
}
first.rename('Ану', 'cat');
const secondProfile = first.create('Бат', 'dog');
first.select(secondProfile.id);
const second = createProfileStore(storage, options);
assert.equal(second.current().id, secondProfile.id);
for (const key of Object.keys(GAME_KEYS)) assert.equal(second.storage.getItem(key), null, 'A new child starts with empty progress/settings');
// This older tab must continue saving Ану's work even after another child is selected.
first.storage.setItem('fast-read-shooter-v1', JSON.stringify({learned:['dad','mom','sun'],rounds:2,best:3}));
second.storage.setItem('fast-read-progress-v1', JSON.stringify({learned:['sun'],completed:{},sound:true,questionSeconds:15}));
assert.deepEqual(JSON.parse(first.storage.getItem('fast-read-progress-v1')), legacy['fast-read-progress-v1']);
assert.deepEqual(JSON.parse(second.storage.getItem('fast-read-progress-v1')).learned, ['sun']);
assert.deepEqual(JSON.parse(second.storage.getItem('fast-read-shooter-v1')), null);
assert.deepEqual(JSON.parse(first.storage.getItem('fast-read-shooter-v1')).learned, ['dad','mom','sun']);
const one = first.export([firstId]);
assert.equal(one.profiles.length, 1);
const archive = parseProfileFile(JSON.stringify(first.export(first.list().map(profile => profile.id))));
assert.equal(archive.profiles.length, 2);
const destinationStorage = memory();
const destination = createProfileStore(destinationStorage, options);
const beforeImport = destination.export(destination.list().map(profile => profile.id));
const imported = destination.import(archive, archive.profiles.map(profile => profile.id));
assert.equal(imported.length, 2);
assert.ok(imported.every(profile => !archive.profiles.some(original => original.id === profile.id)));
assert.deepEqual(destination.current(), beforeImport.profiles[0], 'Import does not switch or overwrite the existing child');
assert.deepEqual(imported[0].games, archive.profiles[0].games, 'Every game and setting survives file transfer');
assert.equal(destination.list().length, 3);
destination.import(archive, [archive.profiles[0].id]);
assert.equal(destination.list().length, 4, 'Repeated imports add independent copies');
const reloaded = createProfileStore(destinationStorage, options);
assert.equal(reloaded.list().length, 4, 'Profiles survive reload');
// Unknown profile/game/state fields are carried through old clients unchanged.
const extended = clone(one);
extended.profiles[0].futureProfileField = {badge:'moon'};
extended.profiles[0].games.futureGame = {version:7,state:{coins:42},extra:'keep'};
extended.profiles[0].games.core.state.futureSetting = {color:'blue'};
const [extendedCopy] = destination.import(extended, [firstId]);
destination.select(extendedCopy.id);
const olderClient = createProfileStore(destinationStorage, options);
olderClient.storage.setItem('fast-read-progress-v1', JSON.stringify({learned:['mom'],completed:{},sound:true}));
const roundTrip = olderClient.export([extendedCopy.id]).profiles[0];
assert.deepEqual(roundTrip.futureProfileField, {badge:'moon'});
assert.deepEqual(roundTrip.games.futureGame, extended.profiles[0].games.futureGame);
assert.deepEqual(roundTrip.games.core.state.futureSetting, {color:'blue'});
// Reset affects only this child and the requested game, including empty objects.
olderClient.storage.removeItem('fast-read-alphabet-v1');
assert.equal(olderClient.storage.getItem('fast-read-alphabet-v1'), null);
assert.deepEqual(JSON.parse(first.storage.getItem('fast-read-alphabet-v1')), legacy['fast-read-alphabet-v1']);
olderClient.storage.setItem('fast-read-progress-v1', JSON.stringify({completed:{},learned:[]}));
assert.deepEqual(JSON.parse(olderClient.storage.getItem('fast-read-progress-v1')).completed, {});
const futureGame = clone(one);
futureGame.profiles[0].games.core.version = 2;
const [futureCopy] = destination.import(futureGame, [firstId]);
destination.select(futureCopy.id);
const oldVersion = createProfileStore(destinationStorage, options);
assert.throws(() => oldVersion.storage.getItem('fast-read-progress-v1'));
assert.throws(() => oldVersion.storage.setItem('fast-read-progress-v1','{}'));
assert.throws(() => oldVersion.storage.removeItem('fast-read-progress-v1'));
assert.equal(oldVersion.export([futureCopy.id]).profiles[0].games.core.version, 2);
const beforeInvalid = storage.getItem(PROFILES_KEY);
for (const invalid of [
  '{broken', '{}', JSON.stringify({...one,schemaVersion:99}),
  JSON.stringify({...one,profiles:[one.profiles[0],one.profiles[0]]}),
  JSON.stringify({...one,profiles:[{...one.profiles[0],name:''}]}),
  JSON.stringify({...one,profiles:[{...one.profiles[0],games:{core:{version:1,state:[]}}}]}),
  '{"format":"fast-read-profiles","schemaVersion":1,"profiles":[],"__proto__":{"polluted":true}}',
  ' '.repeat(MAX_PROFILE_FILE_BYTES + 1),
]) assert.throws(() => parseProfileFile(invalid));
assert.equal(storage.getItem(PROFILES_KEY), beforeInvalid, 'Invalid files cannot mutate any profile');
assert.equal({}.polluted, undefined);
const futureStorage = memory();
futureStorage.setItem(PROFILES_KEY, JSON.stringify({...one,schemaVersion:99}));
const untouched = futureStorage.getItem(PROFILES_KEY);
const blocked = createProfileStore(futureStorage, options);
assert.throws(() => blocked.create('Сар', 'bird'));
assert.equal(futureStorage.getItem(PROFILES_KEY), untouched, 'Never overwrite a newer local registry');
const quotaStorage = memory();
const quota = createProfileStore(quotaStorage, options);
quotaStorage.setItem = () => { throw new Error('quota exceeded'); };
assert.throws(() => quota.storage.setItem('fast-read-shooter-v1',JSON.stringify({learned:['sun']})));
assert.deepEqual(quota.export([quota.current().id]).profiles[0].games.shooter.state.learned, ['sun'], 'Unsaved in-memory work can still be exported');
const schema = JSON.parse(await readFile(new URL('../public/fast_read/data/profile-format.schema.json', import.meta.url),'utf8'));
assert.equal(schema.properties.schemaVersion.const, 1);
validateArchive(archive);
for (const module of ['app','alphabet','actions','reading','shooter']) {
  const source = await readFile(new URL(`../public/fast_read/${module}.js`,import.meta.url),'utf8');
  assert.ok(!source.includes('localStorage.'), `${module} cannot write global child progress`);
  assert.ok(source.includes('profileStorage'));
}
console.log('Profiles: legacy migration, independent children/settings, tab isolation, round-trip import/export, unknown data preservation, version refusal, reset isolation, invalid files and storage quota verified.');
