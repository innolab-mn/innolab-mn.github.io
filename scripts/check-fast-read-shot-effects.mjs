import assert from 'node:assert/strict';
import { shotGeometry, shotLauncherMarkup, initShotStage, drawRay, clearShotEffects } from '../public/fast_read/shot-ray.js';

const area={left:100,top:50,width:600,height:300};
for (const compact of [false,true]) for (const target of [
  {left:140,top:80,width:60,height:60},
  {left:370,top:100,width:60,height:60},
  {left:600,top:190,width:60,height:60},
]) {
  const path=shotGeometry(area,target,compact);
  assert.ok(Object.values(path).every(Number.isFinite));
  assert.ok(Math.abs(path.startX+path.dx-(target.left+target.width/2-area.left))<.001,'Projectile ends at the target centre');
  assert.ok(Math.abs(path.startY+path.dy-(target.top+target.height/2-area.top))<.001);
  assert.equal(Math.sign(path.aimAngle),Math.sign(target.left+target.width/2-area.left-area.width/2),'Launcher turns toward the selected target');
}
assert.ok(Object.values(shotGeometry(area,{left:400,top:321,width:0,height:0})).every(Number.isFinite),'Coincident target and launcher cannot produce NaN');
assert.match(shotLauncherMarkup(),/aria-hidden="true"/,'The decorative launcher does not add a fake control');

let reduced=false,nextTimer=0;
const timers=new Map();
const previous={window:globalThis.window,document:globalThis.document,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
function element(rect={}){
  const classes=new Set(),styles=new Map(),events=new Map();
  return {
    children:[],disabled:false,styles,events,
    style:{setProperty:(key,value)=>styles.set(key,value)},
    classList:{add:value=>classes.add(value),remove:value=>classes.delete(value),contains:value=>classes.has(value)},
    setAttribute(key,value){this[key]=value;},
    append(...children){for(const child of children){this.children.push(child);child.parent=this;}},
    remove(){this.parent.children=this.parent.children.filter(child=>child!==this);},
    getBoundingClientRect:()=>rect,
    addEventListener(name,fn){events.set(name,[...(events.get(name)||[]),fn]);},
    contains(target){return target===this||this.children.includes(target);},
    closest(){return this;},
  };
}
try {
  globalThis.window={matchMedia:()=>({matches:reduced})};
  globalThis.document={createElement:()=>element(),activeElement:null};
  globalThis.setTimeout=(callback)=>{const id=++nextTimer;timers.set(id,callback);return id;};
  globalThis.clearTimeout=id=>timers.delete(id);
  const stage=element(area),left=element({left:140,top:80,width:60,height:60}),right=element({left:600,top:80,width:60,height:60});
  stage.append(left,right);initShotStage(stage);initShotStage(stage);
  assert.ok([...stage.events.values()].every(list=>list.length===1),'Stage handlers bind only once');
  for(const name of ['pointerover','pointerdown','focusin']){
    stage.events.get(name)[0]({target:right});assert.ok(parseFloat(stage.styles.get('--aim-angle'))>0,`${name} aims right`);
  }
  right.disabled=true;stage.events.get('focusin')[0]({target:left});
  const angle=stage.styles.get('--aim-angle');
  stage.events.get('pointerdown')[0]({target:right});assert.equal(stage.styles.get('--aim-angle'),angle,'Disabled answers cannot change aim');
  drawRay(left,stage,true);
  assert.equal(stage.children.length,3);
  assert.equal(stage.children.at(-1).children.length,10,'One star flight, one ring and eight success sparks');
  assert.equal(stage.children.at(-1)['aria-hidden'],'true');
  assert.equal(left.disabled,false,'The visual effect never changes game controls');
  const oldCleanup=[...timers.values()][0];
  for(let i=0;i<20;i++)drawRay(left,stage,false);
  assert.equal(stage.children.length,3,'Rapid retries keep at most one effect');
  assert.equal(stage.children.at(-1).children.length,6,'Misses use a smaller, distinct effect');
  assert.equal(timers.size,1,'Rapid retries keep at most one cleanup timer');
  clearShotEffects(stage);assert.equal(stage.children.length,2);assert.equal(timers.size,0);
  oldCleanup();assert.equal(stage.children.length,2,'Old cleanup is harmless after a cancelled shot');
  drawRay(left,stage);[...timers.values()][0]();
  assert.equal(stage.children.length,2,'A finished animation cleans up its particles');
  reduced=true;drawRay(left,stage);
  assert.equal(stage.children.length,2);assert.equal(timers.size,0,'Reduced motion creates no particles or animation timers');
  stage.events.get('focusout')[0]({relatedTarget:null});assert.equal(stage.styles.get('--aim-angle'),'0deg');
} finally {Object.assign(globalThis,previous);}
console.log('Shooting effects: aim geometry, pointer/keyboard controls, hit/miss particles, rapid retries, cleanup and reduced motion verified.');
