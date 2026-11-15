import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import * as lessons from '../public/fast_read/alphabet-lessons.js';
import * as shots from '../public/fast_read/alphabet-star.js';
import { alphabetPromptClips, createWordSpeaker } from '../public/fast_read/alphabet-audio.js';

const source=(await readFile(new URL('../public/fast_read/alphabet.js',import.meta.url),'utf8'))
  .replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'');
const data=JSON.parse(await readFile(new URL('../public/fast_read/data/alphabet.json',import.meta.url),'utf8'));
let fixtureId=0;
async function fixture({hits=0,sound=true,blocked=false,seconds=0}={}) {
  const audio=[],timers=new Map(),nodes=new Map();let timerId=0,saved={starHits:hits};
  class FakeAudio {
    constructor(){this.played=[];audio.push(this);}
    play(){this.played.push(this.src);return blocked?Promise.reject(Error('blocked')):Promise.resolve();}
    pause(){this.paused=true;}
  }
  globalThis.Audio=FakeAudio;
  const learning=await import(`../public/fast_read/learning-audio.js?fixture=${fixtureId++}`);
  const node=()=>({hidden:true,disabled:false,isConnected:true,style:{},classList:{add(){},toggle(){}},setAttribute(){},focus(){},append(){},insertAdjacentHTML(){}});
  const content=node();content.buttons=[];
  Object.defineProperty(content,'innerHTML',{
    get(){return this.html;},set(html){
      this.html=html;nodes.clear();
      this.buttons=[...html.matchAll(/data-letter-answer="([^"]+)"/g)].map(match=>({...node(),dataset:{letterAnswer:match[1]}}));
    },
  });
  content.querySelectorAll=()=>content.buttons;
  const dialog={...node(),open:false,showModal(){this.open=true;},close(){this.open=false;}};
  const document={querySelector(selector){
    if(selector==='#alphabet-content')return content;
    if(selector==='#alphabet-content .letter-game'&&!content.html?.includes('letter-game'))return null;
    if(selector==='#alphabet-content .result-title'&&!content.html?.includes('result-title'))return null;
    if(!nodes.has(selector))nodes.set(selector,node());
    return nodes.get(selector);
  }};
  const context=vm.createContext({
    ...lessons,...shots,...learning,alphabetPromptClips,createWordSpeaker:()=>createWordSpeaker(FakeAudio),drawRay(){},initShotStage(){},clearShotEffects(){},document,
    profileStorage:{getItem:()=>JSON.stringify(saved),setItem:(_,value)=>{saved=JSON.parse(value);},removeItem:()=>{saved=null;}},
    setTimeout:(fn,delay)=>{const id=++timerId;timers.set(id,{fn,delay});return id;},clearTimeout:id=>timers.delete(id),
    setInterval:()=>0,clearInterval(){},dataFixture:data,dialogFixture:dialog,
    hooksFixture:{chime(){},toast(){},isSoundOn:()=>sound,getQuestionSeconds:()=>seconds},
  });
  vm.runInContext(source,context);
  vm.runInContext('data=dataFixture;hooks=hooksFixture;dialog=dialogFixture;',context);
  const run=code=>vm.runInContext(code,context);
  const choose=correct=>{
    const id=run('round.queue[round.index].id');
    const button=content.buttons.find(item=>(item.dataset.letterAnswer===id)===correct);
    assert.ok(button,'An eligible answer is rendered');button.onclick();return button;
  };
  const flush=()=>{const pending=[...timers.values()];timers.clear();pending.forEach(task=>task.fn());};
  return {run,choose,flush,audio,timers,content,nodes,dialog,saved:()=>saved};
}

const game=await fixture({hits:9});game.run("start('star')");
assert.equal(game.content.buttons.length,2);
const prompt=game.audio.at(-1);prompt.onended();prompt.onended();
assert.deepEqual(prompt.played,game.run('pictureShotClips(round.queue[0])'),'A new picture automatically says letter, үсэг, word');
const button=game.choose(true);
assert.equal(prompt.paused,true,'The answer stops the picture prompt');
assert.equal(game.saved().starHits,10);
assert.equal(game.audio.at(-1).src,'assets/shooter-feedback/answer-correct.mp3');
assert.equal(game.run('round.index'),0,'Wait for the short correct feedback');
button.onclick();assert.equal(game.saved().starHits,10,'Repeated clicks cannot award extra stars');
game.audio.at(-1).onended();game.flush();
assert.equal(game.run('round.index'),1,'Correct feedback advances without a Next click');
assert.equal(game.content.buttons.length,3,'The newly earned rank controls the next picture immediately');
assert.ok(game.nodes.get('.letter-feedback').innerHTML.includes('Цол ахилаа'));
game.choose(false);assert.equal(game.audio.at(-1).src,'assets/shooter-feedback/answer-wrong.mp3');
assert.equal(game.run('round.index'),1,'Wrong answers stay on the same picture');
game.choose(true);assert.equal(game.saved().starHits,10,'Retries do not increase difficulty');
game.audio.at(-1).onended();game.flush();assert.equal(game.run('round.index'),2);
game.choose(true);game.run('leaveAlphabet()');game.flush();assert.equal(game.dialog.open,false,'Leaving cancels pending automatic advancement');
assert.equal(game.run('round.index'),2);

for(const settings of [{sound:false},{blocked:true}]){
  const current=await fixture(settings);current.run("start('star')");current.choose(true);
  await Promise.resolve();await Promise.resolve();current.flush();
  assert.equal(current.run('round.index'),1,'Muted or blocked audio cannot prevent automatic advancement');
  current.run('leaveAlphabet()');
}
const stalled=await fixture();stalled.run("start('star')");stalled.choose(true);stalled.flush();
assert.equal(stalled.run('round.index'),1,'A stalled audio download has a bounded fallback');stalled.run('leaveAlphabet()');
const last=await fixture({sound:false});last.run("questionCount=3;start('star')");
for(let i=0;i<3;i++){last.choose(true);last.flush();}
assert.ok(last.content.html.includes('result-title'),'The last correct answer opens the result automatically');
assert.equal(last.saved().rounds,1);
const timed=await fixture({seconds:15});timed.run("start('star');round.deadline=0");timed.choose(true);
assert.equal(timed.saved().starHits,0,'Timeouts do not award stars');
assert.equal(timed.nodes.get('.letter-next').hidden,false,'Timeouts allow a calm manual continuation');
assert.equal(timed.timers.size,0);
for (const mode of ['font','case']) {
  const exercise=await fixture();exercise.run(`start('${mode}',data.letters.find(letter=>letter.id==='a'))`);
  const prompt=exercise.audio.at(-1);prompt.onended();prompt.onended();
  assert.deepEqual(prompt.played,[
    'assets/shooter-feedback/u0430.mp3?v=2','assets/shooter-feedback/letter.mp3','assets/alphabet-audio/a.mp3?v=4',
  ],`${mode}: automatically says А үсэг, алим`);
  exercise.nodes.get('.star-listen').onclick();
  assert.equal(prompt.paused,true,'Replay replaces the previous prompt');
  const repeated=exercise.audio.at(-1);
  exercise.choose(true);
  assert.equal(repeated.paused,true,'Answer feedback replaces the spoken prompt');
  exercise.nodes.get('.letter-next').onclick();
  assert.equal(exercise.run('round.index'),1);
  assert.equal(exercise.audio.at(-1).src,'assets/shooter-feedback/u0430.mp3?v=2','The next font/case question starts audio automatically');
  exercise.run('leaveAlphabet()');assert.equal(exercise.audio.at(-1).paused,true);
  const muted=await fixture({sound:false});muted.run(`start('${mode}')`);
  assert.equal(muted.audio.length,0,'Autoplay respects the sound setting');muted.run('leaveAlphabet()');
  const blocked=await fixture({blocked:true});blocked.run(`start('${mode}')`);
  await Promise.resolve();await Promise.resolve();
  assert.match(blocked.nodes.get('.star-audio-note').textContent,/дахин/,'Blocked autoplay offers the replay button');
  blocked.run('leaveAlphabet()');
}
console.log('Alphabet flow: autoplay, correct/wrong audio, promotion, retry, automatic completion, mute, failure, timeout and exit verified without a browser.');
