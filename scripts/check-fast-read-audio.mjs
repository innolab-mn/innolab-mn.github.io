import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createWordSpeaker } from '../public/fast_read/alphabet-audio.js';

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
