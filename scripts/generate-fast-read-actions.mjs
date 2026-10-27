// Original action scenes and explicit Mongolian sentence data. No runtime build.
import { mkdir, writeFile } from 'node:fs/promises';
const root=new URL('../public/fast_read/',import.meta.url);
await mkdir(new URL('assets/actions/',root),{recursive:true});
const rows=[
  ['walk','Алхах','алхаж','Хүү',null,'Нэг хөлөө нөгөөгийнхөө өмнө тавиад тайван алхъя.'],
  ['run','Гүйх','гүйж','Охин',null,'Хөлөө хурдан хөдөлгөөд гүйж байна.'],
  ['jump','Үсрэх','үсэрч','Хүү',null,'Хоёр хөлөөрөө газраас хөндийрч үсэрье.'],
  ['sit','Суух','сууж','Охин',null,'Сандал дээр сууж байна.'],
  ['sleep','Унтах','унтаж','Хүү',null,'Нүдээ аниад тайван унтаж байна.'],
  ['eat','Идэх','идэж','Охин','алим','Амтат алимаа идэж байна.'],
  ['drink','Уух','ууж','Хүү','ус','Аяганаас ус ууж байна.'],
  ['read','Унших','уншиж','Охин','ном','Номоо дэлгээд уншиж байна.'],
  ['draw','Зурах','зурж','Хүү','нар','Харандаагаар нар зурж байна.'],
  ['laugh','Инээх','инээж','Охин',null,'Найзтайгаа хөгжилтэй инээе.'],
  ['wash','Угаах','угааж','Хүү','гараа','Усаар гараа угааж байна.'],
  ['play','Тоглох','тоглож','Охин','бөмбөгөөр','Найзтайгаа бөмбөгөөр тоглож байна.'],
];
const outline='stroke="#53647e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
function head(x,y,girl=false,expression='smile'){
 return `<g transform="translate(${x} ${y})">${girl?'<path d="m-24-13-19 2 5 25 20-8m42-19 19 2-5 25-20-8" fill="#72594b"/>':''}<circle r="29" fill="#ffd8b8"/><path d="M-29-2v-14q3-28 30-22 29-3 29 25l-9-10q-19 15-41 5z" fill="#71594b"/>${expression==='sleep'?'<path d="m-15 3 8 2 7-2m8 0 8 2 7-2m-14 14h5" fill="none"/>':expression==='laugh'?'<path d="m-18 5 7-4 7 4m9 0 7-4 7 4" fill="none"/><path d="M-10 13h22q-1 20-11 20-11-1-11-20" fill="#b87878"/>':'<circle cx="-10" cy="5" r="2" fill="#53647e" stroke="none"/><circle cx="11" cy="5" r="2" fill="#53647e" stroke="none"/><path d="M-7 17q8 7 15 0" fill="none"/>'}</g>`;
}
function child(girl=false,pose='stand'){
 const shirt=girl?'#b5a5d2':'#8eadd5';
 const arms=pose==='jump'?'<path d="m160 113-28-43m53 43 30-43"/>':pose==='run'?'<path d="m157 110-21 26-20-13m67-13 20-26 18 15"/>':'<path d="m157 112-17 42m43-42 19 42"/>';
 const legs=pose==='jump'?'<path d="m164 159-22 39m35-39 26 39"/>':pose==='run'?'<path d="m164 159-29 16 14 35m28-51 28 28 21-13"/>':'<path d="m164 159-17 53m30-53 20 53"/>';
 return `<g class="${pose==='jump'?'jumping':pose==='walk'?'walking':pose==='run'?'running':'still'}">${head(170,69,girl)}<path d="M153 105q17-9 34 0l5 57h-44z" fill="${shirt}"/><g fill="none" stroke="#d5a98c" stroke-width="10">${arms}</g><g fill="none" stroke="#7f91ab" stroke-width="12">${legs}</g><path d="M134 216h22m32 0h23" stroke="#667a96" stroke-width="9"/></g>`;
}
const table='<path d="M84 167h191m-174 0v56m156-56v56" stroke="#bd9d7e" stroke-width="10"/>';
const upper=(girl=false,expression='smile')=>`${head(159,69,girl,expression)}<path d="M139 106q20-10 40 0l8 62h-56z" fill="${girl?'#b5a5d2':'#8eadd5'}"/>`;
const apple='<path d="M-1-11q-12-9-19 2-6 13 3 26 7 8 17 3 10 5 17-3 9-13 3-26-7-11-19-2" fill="#df8f82"/><path d="M1-9v-10m0 3q7-12 16-7-5 12-16 7" fill="#96af83"/>';
const book='<path d="M0-19q-26-16-53-5v58q29-8 53 8 24-16 53-8v-58q-27-11-53 5z" fill="#fdf7e8"/><path d="M0-19v61m-41-49 28 7m-28 8 28 7m26-15 28-7m-28 22 28-7" fill="none" stroke="#b4b9cb"/>';
const scenes={
 walk:`<path d="M85 220h34m116 0h34" stroke="#bed0b4"/>${child(false,'walk')}`,
 run:`<path d="M65 90h44m-55 26h36m-26 27h36" fill="none" stroke="#c3cce0"/>${child(true,'run')}`,
 jump:`<path d="M244 143V86m-11 12 11-13 11 13" stroke="#d7bd7f" fill="none"/>${child(false,'jump')}`,
 sit:`<path d="M137 105h93v76h-93zm7 76v39m76-39v39" fill="#ddc6a5" stroke="#bca184"/>${head(150,79,true)}<path d="M133 115q17-8 34 0l13 53h-49z" fill="#b5a5d2"/><path d="m139 171 57 8v39m-33-45 53 3v42" stroke="#899bb3" stroke-width="11" fill="none"/><path d="M185 222h23m-3 0h23" stroke="#6d7c96" stroke-width="8"/><path d="m137 127 16 33 24 5m-14-40 13 27 14 7" stroke="#d4a98c" stroke-width="9" fill="none"/>`,
 sleep:`<path d="M77 134v83m226-83v83M77 193h226" stroke="#bc9d7b" stroke-width="10"/><rect x="81" y="129" width="220" height="64" rx="13" fill="#f7f2df"/><rect x="91" y="127" width="61" height="49" rx="14" fill="#fffdf7"/>${head(125,139,false,'sleep')}<path class="breathing" d="M153 137q58-22 140 11v43H153z" fill="#a4bddb"/><path d="M78 56q-30 0-21 22 7 14 25 5-12 20-28 4-17-21 7-30z" fill="#e2c67d" stroke="none"/>`,
 eat:`${upper(true)}${table}<path d="m139 120-20 9 4-30m54 23 26 25" stroke="#d4a98c" stroke-width="10" fill="none"/><g transform="translate(126 93) scale(.8)">${apple}</g><ellipse cx="228" cy="163" rx="31" ry="8" fill="#e1e9ed"/><g transform="translate(229 145)">${apple}</g>`,
 drink:`${upper(false)}<path d="m140 120-18 27 25 18m31-45 25-11-4-20" stroke="#d4a98c" stroke-width="10" fill="none"/><g class="cup"><path d="m183 92 4 42h31l5-42z" fill="#cee7ef"/><path d="M187 108h32m-30 8h28" stroke="#a3cadc"/><path d="m199 98-19-16" stroke="#b7a885"/></g><path d="m151 168-2 49m24-49 4 49" stroke="#8c9db5" stroke-width="13"/>`,
 read:`${upper(true)}<path d="m145 169-31 35 38 12m23-47 35 36-42 11" fill="none" stroke="#8e9db6" stroke-width="13"/><g transform="translate(159 145)">${book}</g><path d="M109 149h13m75 0h12" stroke="#d4a98c" stroke-width="11"/>`,
 draw:`${upper(false)}${table}<path d="m174 117 32 17 23 18m-88-31-13 26 11 11" fill="none" stroke="#d4a98c" stroke-width="10"/><path d="m183 153 64-9 16 22-65 10z" fill="#fffdf6" stroke="#b9c4cc"/><circle cx="226" cy="158" r="8" fill="#e5bf69" stroke="none"/><path d="m206 115 28 38" stroke="#d5a965" stroke-width="7"/><path d="m233 151 3 6" stroke="#6f7f91"/><path d="M85 138h22v28H85z" fill="#c1cfda"/><path d="m89 139-2-22m10 22 4-27" stroke="#bf91a4"/>`,
 laugh:`${head(170,72,true,'laugh')}<path d="M149 112q20-10 42 0l7 60h-57z" fill="#b5a5d2"/><path d="m151 123-25-12-7-20m70 32 24-12 8-20" stroke="#d4a98c" stroke-width="10" fill="none"/><path d="m156 175-2 43m27-43 3 43" stroke="#8c9db5" stroke-width="13"/><path d="m104 56-10-8m8 28H86m148-20 10-8m-8 28h16" stroke="#d7b477" fill="none"/>`,
 wash:`${upper(false)}<path d="m144 124 36 22 19-3m-19-19 26 22 11-5" stroke="#d4a98c" stroke-width="10" fill="none"/><path d="M132 163h166v26H132z" fill="#c5dce7"/><ellipse cx="215" cy="161" rx="64" ry="18" fill="#e9f1f4"/><path d="M267 151V93q0-17-17-17h-19v16h15" fill="none" stroke="#9baebc" stroke-width="9"/><path class="water-flow" d="M235 97v29m11-29v29" stroke="#9ecfdf" stroke-width="4" stroke-dasharray="4 7"/><circle cx="206" cy="131" r="7" fill="#e8f7fb"/><circle cx="190" cy="137" r="5" fill="#e8f7fb"/><path d="m153 190-2 29m26-29 2 29" stroke="#8c9db5" stroke-width="13"/>`,
 play:`${child(true)}<g class="ball-bounce"><circle cx="255" cy="150" r="31" fill="#f7f8ef"/><path d="m255 134 14 10-6 16h-17l-6-16zm-30 8 15 2m6 16-9 13m26-13 10 13m-4-29 15-2m-29-8v-14" fill="#8eabc1"/></g><path d="M220 214h70" stroke="#c2d0b9"/>`,
};
const style=`<style>.walking{transform-origin:170px 210px;animation:walk 1.3s ease-in-out infinite}.running{transform-origin:170px 210px;animation:run .45s ease-in-out infinite}.jumping{animation:jump 1.6s ease-in-out infinite}.breathing{transform-origin:150px 190px;animation:breathe 3s ease-in-out infinite}.ball-bounce{animation:ball 1.3s ease-in-out infinite}.water-flow{animation:water .7s linear infinite}@keyframes walk{50%{transform:rotate(3deg) translateY(-3px)}}@keyframes run{50%{transform:rotate(8deg) translateY(-9px)}}@keyframes jump{45%{transform:translateY(-24px)}}@keyframes breathe{50%{transform:scaleY(1.05)}}@keyframes ball{50%{transform:translateY(-28px)}}@keyframes water{to{stroke-dashoffset:-22}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}</style>`;
for(const [id,,,,,] of rows){
 const scene=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260">${style}<circle cx="180" cy="126" r="111" fill="#eef3e9"/><ellipse cx="180" cy="226" rx="125" ry="11" fill="#dae4d4"/><g ${outline}>${scenes[id]}</g></svg>`;
 await writeFile(new URL(`assets/actions/${id}.svg`,root),scene);
}
const actions=rows.map(([id,verb,present,subject,object,hint])=>({id,verb,present,subject,object,hint,image:`assets/actions/${id}.svg`,sentences:{short:[subject,present,'байна.'],...(object?{long:[subject,object,present,'байна.']}:{})}}));
await writeFile(new URL('data/actions.json',root),JSON.stringify({version:1,actions},null,2)+'\n');
console.log(`Generated ${actions.length} action scenes, ${actions.length} short and ${actions.filter(action=>action.object).length} extended sentences.`);
