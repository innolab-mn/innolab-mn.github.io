import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { readingStars, readingStarAward, readingStarProgress } from '../public/fast_read/reading-logic.js';
import { wordLetters, missingLetterExercise, letterTargets, shooterLetterPosition, SHOOTER_RANKS, shooterRank } from '../public/fast_read/shooter-logic.js';

const site=new URL('../public/fast_read/',import.meta.url);
const readJson=async path=>JSON.parse(await readFile(new URL(path,site),'utf8'));
const old=await readJson('data/words.json');
const extra=await readJson('data/shooter-extra.json');
const manifest=await readJson('assets/shooter-audio/manifest.json');
const words=[...old,...extra];
assert.equal(old.length,20);
assert.equal(extra.length,20);
assert.equal(new Set(words.map(word=>word.id)).size,40);
assert.equal(new Set(words.map(word=>word.text.toLocaleLowerCase('mn'))).size,40);
for(const word of words){
  const letters=wordLetters(word.text);
  const positions=letters.map((_,step)=>shooterLetterPosition(word.text,step));
  assert.equal(new Set(positions).size,letters.length,`${word.text}: every position once`);
  for(const position of positions){
    const exercise=missingLetterExercise(word.text,position);
    assert.equal([...exercise.masked].filter(letter=>letter==='*').length,1);
    assert.ok(letterTargets(word.text,()=>0.4).includes(exercise.answer));
  }
  assert.equal(manifest[word.id].word,word.text);
  assert.ok((await readFile(new URL(`assets/shooter-audio/${word.id}.mp3`,site))).length>500);
  await access(new URL(word.image,site));
}
assert.equal(SHOOTER_RANKS.length,9);
for(let i=0;i<SHOOTER_RANKS.length;i++){
  const count=SHOOTER_RANKS[i].min;
  assert.equal(shooterRank(words.slice(0,count).map(word=>word.id),words).rank,i);
  assert.equal(shooterRank(words.slice(0,count-1).map(word=>word.id),words).rank,i===0?null:i-1);
}
assert.equal(shooterRank(['dad','dad','future-unknown'],words).count,1);
const rec=(passageId,correct,elapsedMs=60000)=>({passageId,correct,elapsedMs,totalQuestions:5,words:200});
assert.deepEqual([0,1,2,3,4,5].map(correct=>readingStars(rec('a',correct))),[1,1,1,2,2,3]);
assert.equal(readingStars(rec('a',5,9999)),0);
assert.equal(readingStarProgress([rec('a',1),rec('a',5),rec('b',3)]).total,5);
assert.equal(readingStarAward([rec('a',3)],rec('a',5)),1);
assert.equal(readingStarAward([rec('a',5)],rec('a',3)),0);
assert.equal(readingStarAward([rec('a',3)],rec('b',1)),1);
console.log('Reading stars, shooter ranks, all letter positions, 40 words, local audio and images verified.');
