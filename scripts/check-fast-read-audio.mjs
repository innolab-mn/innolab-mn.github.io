import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { alphabetPromptClips, createWordSpeaker } from '../public/fast_read/alphabet-audio.js';
import { PICTURE_SHOT_RANKS, pictureShotRank, pictureShotPlan, pictureShotAtRank, pictureShotClips, pictureShotBoard } from '../public/fast_read/alphabet-star.js';

const audios=[];
class FakeAudio {
  constructor(url) { this.url=url; this.paused=false; audios.push(this); }
  play() { return Promise.resolve(); }
  pause() { this.paused=true; }
}
const speaker=createWordSpeaker(FakeAudio);
assert.equal(speaker.speak('a'),true);
assert.equal(audios[0].url,'assets/alphabet-audio/a.mp3?v=4');
assert.equal(speaker.speak('ye'),true);
assert.equal(audios[0].paused,true);
speaker.stop();
assert.equal(audios[1].paused,true);
assert.equal(speaker.speak('../other'),false);
assert.equal(createWordSpeaker(null).speak('a'),false);
let failed=false;
class BlockedAudio extends FakeAudio { play() { return Promise.reject(new Error('autoplay blocked')); } }
const blocked=createWordSpeaker(BlockedAudio);
blocked.speak('a',()=>{ failed=true; });
await new Promise(resolve=>setTimeout(resolve,0));
assert.equal(failed,true,'Autoplay failure is reported');
const alphabet=JSON.parse(await readFile(new URL('../public/fast_read/data/alphabet.json',import.meta.url),'utf8'));
const manifest=JSON.parse(await readFile(new URL('../public/fast_read/assets/alphabet-audio/manifest.json',import.meta.url),'utf8'));
for (const letter of alphabet.letters.filter(item=>item.usage!=='shape')) {
  assert.deepEqual(manifest[letter.id],{word:letter.word,voice:'mn-MN-YesuiNeural',rate:'+0%',pitch:'+50Hz'},`${letter.id} recording matches the word and voice settings`);
  const clip=await readFile(new URL(`../public/fast_read/assets/alphabet-audio/${letter.id}.mp3`,import.meta.url));
  assert.ok(clip.length>500, `${letter.id} has a nonempty recording`);
  assert.ok((clip[0]===0xff && (clip[1]&0xe0)===0xe0) || clip.subarray(0,3).toString()==='ID3', `${letter.id} is MP3`);
}
for (const [upper,word,motif] of [['Е','Еэвэн','yoo-cookie'],['И','Ихэр','twin-girls']]) {
  const letter=alphabet.letters.find(item=>item.upper===upper);
  assert.equal(letter.word,word);
  assert.equal(letter.motif,motif);
  for (const variant of Object.values(letter.variants)) {
    const svg=await readFile(new URL('../public/fast_read/'+variant.illustrated,import.meta.url),'utf8');
    assert.match(svg,/<svg/);
  }
}
console.log('Alphabet: local MP3 coverage, playback, blocked autoplay, Е/И illustrations verified.');

const site = new URL('../public/fast_read/', import.meta.url);
const feedback = JSON.parse(await readFile(new URL('assets/shooter-feedback/manifest.json', site), 'utf8'));
for (const letter of alphabet.letters) {
  const clips=alphabetPromptClips(letter);
  const name=clips[0].split('/').at(-1).split('.')[0];
  assert.equal(feedback[name].text,({'ь':'зөөлний тэмдэг','ъ':'хатуугийн тэмдэг','щ':'щэ'})[letter.lower]||letter.lower);
  assert.equal(clips.includes('assets/shooter-feedback/letter.mp3'),letter.kind!=='sign','Signs are named as signs');
  assert.equal(clips.some(clip=>clip.includes('alphabet-audio/')),letter.usage!=='shape','Shape-only Щ does not request a nonexistent word recording');
  for (const clip of clips) assert.ok((await readFile(new URL(clip.split('?')[0], site))).length>500);
}
const beginner = alphabet.letters.filter(letter => letter.lesson === 'beginner');
const fullRound = pictureShotPlan(alphabet.letters, beginner.length, () => 0.4);
assert.deepEqual(new Set(fullRound.map(shot => shot.letter.id)), new Set(beginner.map(letter => letter.id)));
for (const count of [3, 5, 10, 25]) {
  const plan = pictureShotPlan(alphabet.letters, count);
  assert.equal(plan.length, count);
  for (const [hits, expected] of [[0,2],[9,2],[10,3],[49,3],[50,4],[119,4],[120,5],[259,5],[260,6],[1000,6]]) {
    assert.ok(plan.every(shot => pictureShotAtRank(shot, hits).choices.length === expected), `${hits} hits: difficulty stays at ${expected} targets regardless of question number`);
  }
}
assert.equal(PICTURE_SHOT_RANKS.length, 9);
for (const [index, rank] of PICTURE_SHOT_RANKS.entries()) {
  assert.equal(pictureShotRank(rank.min).index, index);
  if (index) assert.equal(pictureShotRank(rank.min - 1).index, index - 1);
}
for (const invalid of [undefined, null, -1, 2.5, '50', NaN, Infinity]) assert.equal(pictureShotRank(invalid).hits, 0);
for (const planned of fullRound) for (const rank of PICTURE_SHOT_RANKS) {
  const shot = pictureShotAtRank(planned, rank.min);
  const {letter, choices} = shot;
  assert.equal(letter.word[0], letter.upper);
  assert.ok(choices.every(choice => choice.lesson === 'beginner'));
  assert.equal(new Set(choices.map(choice => choice.id)).size, choices.length);
  assert.equal(choices.filter(choice => choice.id === letter.id).length, 1);
  const picture = await readFile(new URL(letter.picture, site), 'utf8');
  assert.doesNotMatch(picture, /<text\b|<clipPath\b/);
  assert.notEqual(letter.picture, letter.variants.nunito.illustrated);
  const board = pictureShotBoard(shot, 'handwritten');
  assert.equal(Array.from(board.matchAll(/data-letter-answer=/g)).length, choices.length);
  const clips = pictureShotClips(letter);
  assert.equal(manifest[letter.id].word, letter.word);
  assert.equal(feedback[clips[0].split('/').at(-1).split('.')[0]].text, letter.lower);
  assert.equal(feedback.letter.text, 'үсэг');
  for (const clip of clips) assert.ok((await readFile(new URL(clip.split('?')[0], site))).length > 500);
}
assert.deepEqual(pictureShotClips(beginner.find(letter => letter.upper === 'Ж')), [
  'assets/shooter-feedback/u0436.mp3?v=2', 'assets/shooter-feedback/letter.mp3', 'assets/alphabet-audio/zh.mp3?v=4'
]);
assert.deepEqual(pictureShotClips(beginner.find(letter => letter.upper === 'Я')), [
  'assets/shooter-feedback/u044f.mp3?v=2', 'assets/shooter-feedback/letter.mp3', 'assets/alphabet-audio/ya.mp3?v=4'
]);
console.log('04 Одон харваа: 25 picture clues, nine ranks, rank-limited 2–6 targets and letter–word audio verified.');
