import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAudioSequence, shooterFeedbackClips, shooterWrongClips } from '../public/fast_read/shooter-audio.js';

const root=new URL('../public/fast_read/',import.meta.url);
const readJson=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const letters=(await readJson('data/alphabet.json')).letters;
const words=[...await readJson('data/words.json'),...await readJson('data/shooter-extra.json')];
const clips=await readJson('assets/shooter-feedback/manifest.json');
assert.equal(letters.length,35);
for(const letter of letters){
  const paths=shooterFeedbackClips(letter.upper,'girl');
  assert.equal(paths.length,5);
  const code=letter.lower.codePointAt(0).toString(16).padStart(4,'0');
  assert.equal(paths[1],`assets/shooter-feedback/u${code}.mp3?v=2`);
  assert.ok(clips[`u${code}`]);
  assert.ok((await readFile(new URL(paths[1].split('?')[0],root))).length>500);
  assert.deepEqual(shooterWrongClips(letter.upper),[paths[1],'assets/shooter-feedback/mismatch.mp3?v=2']);
}
for(const name of ['correct','letter-joins','completed','mismatch'])assert.ok((await readFile(new URL(`assets/shooter-feedback/${name}.mp3`,root))).length>500);
for(const word of words)for(const letter of word.text.toLocaleLowerCase('mn'))assert.equal(shooterFeedbackClips(letter,word.id)[3],`assets/shooter-audio/${word.id}.mp3?v=2`);
assert.throws(()=>shooterFeedbackClips('../','girl'));
assert.throws(()=>shooterFeedbackClips('и','../girl'));

const instances=[];
class FakeAudio{
  constructor(){this.played=[];this.paused=false;instances.push(this);}
  play(){this.played.push(this.src);return Promise.resolve();}
  pause(){this.paused=true;}
}
const player=createAudioSequence(FakeAudio);
const sequence=shooterFeedbackClips('и','girl');
assert.equal(player.play(sequence),true);
const audio=instances.at(-1);
for(let i=1;i<sequence.length;i++)audio.onended();
assert.deepEqual(audio.played,sequence,'Feedback clips play in sentence order');
audio.onended();
assert.equal(audio.onended,null);
const wrong=shooterWrongClips('с');
assert.equal(player.play(wrong),true);
const wrongAudio=instances.at(-1);
wrongAudio.onended();
assert.deepEqual(wrongAudio.played,wrong,'Wrong-letter response plays letter, then mismatch phrase');
wrongAudio.onended();
player.play(sequence);
const interrupted=instances.at(-1),oldEnded=interrupted.onended;
player.stop();
assert.equal(interrupted.paused,true);
oldEnded();
assert.equal(interrupted.played.length,1,'Stopped sequences cannot resume');
let failed=0;
player.play(sequence,()=>failed++);
instances.at(-1).onerror();
assert.equal(failed,1);
assert.equal(createAudioSequence(null).play(sequence),false);
console.log('Feedback: 35 Mongolian letters, sentence order, word clips, interruption and failure handling verified.');
