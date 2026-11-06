import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { actionVerbClip, actionSentenceClip, actionTokenClip } from '../public/fast_read/learning-audio.js';
import { shooterWordClip } from '../public/fast_read/shooter-audio.js';

const site=new URL('../public/fast_read/',import.meta.url);
const json=async file=>JSON.parse(await readFile(new URL(file,site),'utf8'));
const actions=(await json('data/actions.json')).actions;
const words=await json('data/words.json');
const manifest=await json('assets/actions-audio/manifest.json');
async function clip(path,text){
  const filename=path.split('/').at(-1).replace(/\.mp3$/,'');
  assert.equal(manifest[filename]?.text,text,`${filename}: audio matches visible text`);
  const bytes=await readFile(new URL(path,site));
  assert.ok(bytes.length>500,`${filename}: nonempty MP3`);
  assert.ok((bytes[0]===0xff&&(bytes[1]&0xe0)===0xe0)||bytes.subarray(0,3).toString()==='ID3');
}
assert.equal(actions.length,12);
for(const action of actions){
  await clip(actionVerbClip(action.id),action.verb);
  for(const [length,tokens] of Object.entries(action.sentences)){
    await clip(actionSentenceClip(action.id,length),tokens.join(' '));
    for(const token of tokens)await clip(actionTokenClip(token),token.replace(/[.,!?]+$/u,'').toLocaleLowerCase('mn'));
  }
}
for(const word of words)assert.ok((await readFile(new URL(shooterWordClip(word.id).split('?')[0],site))).length>500);
assert.equal(actionTokenClip('БАЙНА.'),actionTokenClip('байна'));
assert.throws(()=>actionVerbClip('../x'));
assert.throws(()=>actionSentenceClip('read','bad'));
assert.throws(()=>actionTokenClip('../'));
console.log('Action verbs, complete sentences, individual words and existing word clips verified.');
