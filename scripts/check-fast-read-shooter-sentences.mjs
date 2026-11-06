import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createSentenceShooterPlan, createShooterPlan, shooterRank } from '../public/fast_read/shooter-logic.js';
import { actionVerbClip, actionSentenceClip, actionTokenClip } from '../public/fast_read/learning-audio.js';

const root=new URL('../public/fast_read/',import.meta.url);
const readJson=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const actions=(await readJson('data/actions.json')).actions;
const manifest=await readJson('assets/actions-audio/manifest.json');
const normalize=word=>word.replace(/[.,!?]+$/u,'').normalize('NFC').toLocaleLowerCase('mn');
const checkClip=async (path,text)=>{
  const name=path.split('/').at(-1).replace(/\.mp3$/,'');
  assert.equal(manifest[name]?.text,text,`${name} matches its visible word or sentence`);
  assert.ok((await readFile(new URL(path,root))).length>500,`${name} has local audio`);
};
const original=JSON.stringify(actions);
for(const length of ['short','long']){
  const expected=actions.filter(action=>action.sentences[length]);
  for(const random of [()=>0,()=>0.37,()=>0.999]){
    const plan=createSentenceShooterPlan(actions,length,random);
    assert.equal(plan.length,expected.length);
    assert.deepEqual(new Set(plan.map(item=>item.action.id)),new Set(expected.map(item=>item.id)));
    for(const item of plan){
      assert.deepEqual(item.steps.map(step=>step.word),item.action.sentences[length]);
      for(const step of item.steps){
        assert.equal(step.answer,normalize(step.word));
        assert.equal(step.targets.length,3);
        assert.equal(new Set(step.targets.map(normalize)).size,3);
        assert.equal(step.targets.filter(word=>normalize(word)===step.answer).length,1);
        for(const word of step.targets)await checkClip(actionTokenClip(word),normalize(word));
      }
      await checkClip(actionSentenceClip(item.action.id,length),item.action.sentences[length].join(' '));
    }
  }
}
assert.equal(JSON.stringify(actions),original,'Planning does not mutate source data');
const verbs=actions.map(action=>({id:`verb-${action.id}`,text:action.verb,actionId:action.id}));
for(const action of actions)await checkClip(actionVerbClip(action.id),action.verb);
for(const item of createShooterPlan(verbs,()=>0.37)){
  assert.equal(item.steps.length,[...item.word.text].length);
  assert.ok(item.steps.every(step=>step.targets.includes(step.exercise.answer)));
}
assert.equal(shooterRank(['verb-walk','verb-walk'],verbs).count,1,'Repeated verb does not inflate rank');
console.log('Sentence shooter: order, unique targets, local audio, verb letter plans and rank verified.');
