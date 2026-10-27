// Run from the repository root: node scripts/generate-fast-read-assets.mjs
// Original, editable SVG illustrations; no fonts or remote image services needed.
import { mkdir, writeFile } from 'node:fs/promises';
const root = new URL('../public/fast_read/', import.meta.url);
const write = (name, content) => writeFile(new URL(name, root), content);
await mkdir(new URL('assets/images/', root), {recursive:true});
await mkdir(new URL('assets/models/', root), {recursive:true});
await mkdir(new URL('assets/story/', root), {recursive:true});
await mkdir(new URL('data/', root), {recursive:true});
const stroke = 'stroke="#344362" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><g ${stroke}>${body}</g></svg>`;
const eyes = (y=87) => `<path d="M80 ${y}v3m40-3v3"/><path d="M91 ${y+20}q9 8 18 0" fill="none"/>`;
const person = (shirt, hair, child=false, girl=false) => `<path d="M${child?57:43} 188v-31q0-35 ${child?43:57}-35t${child?43:57} 35v31" fill="${shirt}" stroke="none"/><path d="M88 121v16q12 10 24 0v-16" fill="#f5c4a0"/><circle cx="100" cy="83" r="${child?40:43}" fill="#ffd7b4"/><path d="M${child?60:57} 84V67q0-43 43-39 46-4 43 51l-16-26q-20 17-57 9l-13 22" fill="${hair}"/>${girl?'<path d="M60 67q-32 4-27 38l28-6m78-32q32 4 28 38l-28-6" fill="'+hair+'"/>':''}${eyes()}${child?'':'<path d="m75 137 25 16 25-16" fill="none" stroke="#fff"/>'}${girl?'<path d="m125 37 17-9-3 21-14-12-11 12-3-21z" fill="#ee8895" stroke="none"/>':''}`;
const drawings = {
 dad:person('#7b9fdb','#594b46'), mom:person('#e59a9f','#665047',false,true), boy:person('#e7b966','#594b46',true), girl:person('#a597d4','#584945',true,true),
 dog:'<path d="M54 70 31 52q-21 63 11 69l20-35m84-16 23-18q21 63-11 69l-20-35" fill="#ad7b50"/><path d="M48 95q0-51 52-51t52 51v35q0 37-52 37t-52-37z" fill="#e6b77c"/><ellipse cx="100" cy="126" rx="32" ry="28" fill="#ffe5ba"/><path d="M89 116q11-8 22 0l-11 12z" fill="#4c4345"/><path d="M100 128v12m0-3q-12 13-19 0m19 0q12 13 19 0" fill="none"/><path d="M77 92v4m46-4v4"/>',
 cat:'<path d="m49 85-3-49 42 23m24 0 42-23-3 49" fill="#d6a36f"/><path d="m57 64 1-14 15 12m69 2-1-14-15 12" fill="#f5bab2" stroke="none"/><ellipse cx="100" cy="111" rx="58" ry="52" fill="#efc18d"/><path d="M76 101v4m48-4v4m-31 14 7 7 7-7z" fill="#a96d73"/><path d="M100 126q-2 18-16 9m16-9q2 18 16 9M68 124l-36-6m36 19-36 7m100-20 36-6m-36 19 36 7M91 62l4 15m14-15-4 15" fill="none"/>',
 sun:'<g stroke="#e6b64e" stroke-width="7"><path d="M100 21v15m0 128v15M21 100h15m128 0h15M44 44l11 11m90 90 11 11M44 156l11-11m90-90 11-11"/></g><circle cx="100" cy="100" r="49" fill="#f6cf70" stroke="#e6b64e"/><path d="M83 94v3m34-3v3m-29 17q12 12 24 0" fill="none" stroke="#a17d39"/>',
 moon:'<path d="M135 29Q57 40 80 110q18 48 76 32-24 39-65 29Q30 156 39 99q5-49 44-65 29-13 52-5" fill="#f3d887" stroke="#d4b96a"/><path d="m146 60 4 9 10 1-8 7 3 10-9-5-9 5 2-10-7-7 10-1z" fill="#f3d887" stroke="none"/>',
 water:'<path d="M100 23s-59 67-59 103a59 59 0 0 0 118 0c0-36-59-103-59-103z" fill="#8fc9ec" stroke="#5b9fce"/><path d="M61 124q0 30 27 36" fill="none" stroke="#e7f7ff" stroke-width="9"/>',
 milk:'<path d="m67 26-19 32v116h104V58l-19-32z" fill="#fcfdff"/><path d="M48 58h104v30H48zm0 79h104v37H48z" fill="#99badf" stroke="none"/><path d="M67 26v32h85M67 26l19 32v116" fill="none"/><path d="M107 98s-18 19-18 30a18 18 0 0 0 36 0c0-11-18-30-18-30z" fill="#91b6dc" stroke="none"/>',
 bread:'<path d="M40 92q-20-14-14-37 6-28 35-23 13-19 39-8 26-11 39 8 29-5 35 23 6 23-14 37v81H40z" fill="#e5af68" stroke="#b8854e"/><path d="M54 91q-22-27 5-40 14-5 25 1 16-16 32 0 11-6 25-1 27 13 5 40v66H54z" fill="#ffe3ab" stroke="none"/>',
 apple:'<path d="M98 60q-34-24-57 3-28 35 2 83 24 38 57 19 33 19 57-19 30-48 2-83-23-27-57-3" fill="#e99286" stroke="#c56f69"/><path d="M101 64q-8-26 5-40" fill="none" stroke="#896e4a"/><path d="M108 40q17-33 46-20-3 33-46 20" fill="#93b58c" stroke="#6e9469"/><path d="M61 79q-15 13-9 31" fill="none" stroke="#ffd2bd" stroke-width="8"/>',
 home:'<path d="M42 91v84h116V91" fill="#f9e3bd"/><path d="m25 94 75-64 75 64-13 14-62-52-62 52z" fill="#d78e79"/><path d="M88 124h29v51H88z" fill="#a1b9ce"/><path d="M56 115h22v24H56zm73 0h17v24h-17z" fill="#fcfcf3"/><path d="M137 59V30h19v44" fill="#d78e79"/>',
 ger:'<path d="m26 89 74-54 74 54v71H26z" fill="#fff9e9"/><path d="m26 89 74-54 74 54H26m0 17h148M28 149h144" fill="none" stroke="#b9886c"/><path d="M85 118h31v42H85z" fill="#df9e6f"/><path d="M88 118v42m24-42v42" stroke="#a66d52"/><path d="M91 34h18v10H91z" fill="#ddaa7c"/>',
 book:'<path d="M100 54Q64 33 26 48v112q38-15 74 6 36-21 74-6V48q-38-15-74 6z" fill="#fdf5e5"/><path d="M100 54v112" fill="none"/><path d="M26 48v112q38-15 74 6 36-21 74-6V48l8 8v115q-43-13-82 4-39-17-82-4V56z" fill="#7f9ed5" stroke="#5c7bac"/><path d="M42 75q22-7 41 4m-41 15q22-7 41 4m-41 15q22-7 41 4m34-38q19-11 41-4m-41 23q19-11 41-4m-41 23q19-11 41-4" fill="none" stroke="#c8baa3"/>',
 ball:'<circle cx="100" cy="100" r="68" fill="#9bb7dc"/><path d="M42 64q68 25 110 90M77 37q-28 68 27 131M34 112q71 12 127-42" fill="none" stroke="#edf3fa" stroke-width="12"/>',
 car:'<path d="m49 96 20-43h61l28 43" fill="#b5d8e5"/><path d="m49 96 20-43h61l28 43M99 53v43" fill="none"/><path d="M25 98q0-8 16-8h116l20 18v37H25z" fill="#e2b56f"/><path d="M25 112h20v12H25m132-12h20v12h-20" fill="#fff4d2"/><circle cx="59" cy="145" r="19" fill="#61718a"/><circle cx="143" cy="145" r="19" fill="#61718a"/><circle cx="59" cy="145" r="7" fill="#dbe1ea" stroke="none"/><circle cx="143" cy="145" r="7" fill="#dbe1ea" stroke="none"/>',
 tree:'<path d="M89 106h22v71H89z" fill="#bd966e"/><path d="M59 131q-37-14-18-49-2-25 23-33 7-37 37-25 35-10 42 24 28 5 23 34 24 37-15 50-21 13-49-3-24 18-43 2z" fill="#a3bf91" stroke="#799c73"/><path d="M100 128V77m0 24-19-16m19 28 23-17" fill="none" stroke="#799c73"/>',
 flower:'<path d="M100 103v73m0-20q-40 1-40-32 35-3 40 32m0-10q40 1 40-32-35-3-40 32" fill="#a0bd8a" stroke="#729563"/><path d="M82 43q18-32 36 0 34-9 34 20 24 28-11 39-6 35-41 14-35 21-41-14-35-11-11-39 0-29 34-20" fill="#eaa5b2" stroke="#c58294"/><circle cx="100" cy="79" r="24" fill="#f5d781" stroke="#d6b366"/>',
 bird:'<path d="M58 121q-23-3-33-25l36 5q-1-41 35-50 39-10 51 25l27 13-28 12q-6 42-49 45-29 3-39-25z" fill="#a0c1d2" stroke="#6c95ac"/><path d="M73 95q19-4 38 10-8 24-33 14" fill="#dcebf0" stroke="#6c95ac"/><path d="M121 76v2m-35 68-6 19m26-19 5 19"/><path d="m146 76 28 13-28 12" fill="#e6ba6b"/>'
};
const data = [
 ['dad','Аав','family','Гэр бүл','Аав ном уншиж байна.'], ['mom','Ээж','family','Гэр бүл','Ээж инээмсэглэж байна.'], ['boy','Хүү','family','Гэр бүл','Хүү бөмбөгөөр тоглож байна.'], ['girl','Охин','family','Гэр бүл','Охин ном уншиж байна.'],
 ['dog','Нохой','animals','Амьтад','Нохой бол бидний найз.'], ['cat','Муур','animals','Амьтад','Муур зөөлөн үстэй.'], ['bird','Шувуу','animals','Амьтад','Шувуу тэнгэрт нисэж байна.'],
 ['sun','Нар','nature','Байгаль','Нар дулаахан илчээ түгээнэ.'], ['moon','Сар','nature','Байгаль','Сар шөнө гэрэлтэнэ.'], ['tree','Мод','nature','Байгаль','Мод ногоон навчтай.'], ['flower','Цэцэг','nature','Байгаль','Цэцэг гоё дэлбээтэй.'], ['water','Ус','food','Идэх, уух','Ус уугаарай.'], ['milk','Сүү','food','Идэх, уух','Сүү цагаан өнгөтэй.'], ['bread','Талх','food','Идэх, уух','Талх амттай.'], ['apple','Алим','food','Идэх, уух','Алим модонд ургана.'],
 ['home','Байшин','things','Бидний эргэн тойрон','Байшин хаалга, цонхтой.'], ['ger','Гэр','things','Бидний эргэн тойрон','Монгол гэр дугуй хэлбэртэй.'], ['book','Ном','things','Бидний эргэн тойрон','Ном олон зурагтай.'], ['ball','Бөмбөг','things','Бидний эргэн тойрон','Бөмбөг бөөрөнхий.'], ['car','Машин','things','Бидний эргэн тойрон','Машин замаар явж байна.'],
];
const colors = {family:'#fdf1e7',animals:'#fcf0df',nature:'#edf4e8',food:'#fff4e3',things:'#edf0fa'};
for (const [id, drawing] of Object.entries(drawings)) await write(`assets/images/${id}.svg`, svg(drawing));
const birdAt=(x,y,s=.55)=>`<g transform="translate(${x} ${y}) scale(${s})">${drawings.bird}</g>`;
const catAt=(x,y,s=.48)=>`<g transform="translate(${x} ${y}) scale(${s})">${drawings.cat}</g>`;
const bookAt=(x,y,s=.52)=>`<g transform="translate(${x} ${y}) scale(${s})">${drawings.book}</g>`;
const ground='<ellipse cx="210" cy="202" rx="178" ry="24" fill="#d9e5cc" stroke="none"/>';
const clouds='<path d="M39 54q-4-14 12-15 7-20 23-6 15-3 19 13H39m253 12q-5-15 13-17 8-18 22-5 15-3 20 12h-55" fill="#ffffffaa" stroke="none"/>';
const bridge='<path d="M28 218q160-82 357 0" stroke="#a9cddc" stroke-width="27" fill="none"/><path d="M100 183q109-49 216 0" stroke="#ac8a68" stroke-width="17" fill="none"/><path d="M102 182v-42m213 42v-42M102 148q107-44 213 0" stroke="#ac8a68" stroke-width="5" fill="none"/>';
const scenes={
 'chapter-1':`<g transform="translate(28 44) scale(.72)">${drawings.home}</g>${birdAt(220,70)}${bookAt(135,117,.55)}<path d="m178 65 19-9m-12 24 21-3" stroke="#d4b266" fill="none"/>`,
 'together':`${birdAt(70,62,.68)}${birdAt(230,62,.68)}${bookAt(140,120,.64)}<path d="m206 43 6 7 6-7q15-6 12 7l-18 17-18-17q-3-13 12-7" fill="#e8adac" stroke="none"/>`,
 'chapter-2':`${bridge}${birdAt(28,77,.62)}${catAt(265,77,.62)}`,
 'bridge-friends':`${bridge}${birdAt(242,72,.62)}${catAt(15,77,.62)}<path d="m175 75 10 10 23-25" stroke="#8ba57b" fill="none" stroke-width="6"/>`,
 'chapter-3':`<g transform="translate(40 50) scale(.72)">${drawings.dog}</g>${birdAt(247,70,.6)}<g transform="translate(161 135) scale(.39)">${drawings.ball}</g>`,
 'ball-friends':`<g transform="translate(61 50) scale(.72)">${drawings.dog}</g>${birdAt(220,65,.7)}<g transform="translate(151 133) scale(.42)">${drawings.ball}</g><path d="m179 128 10-8m34 4 11 5" stroke="#d4b266" fill="none"/>`
};
for(const [id,body] of Object.entries(scenes))await write(`assets/story/${id}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 240"><g ${stroke}>${clouds}${ground}${body}</g></svg>`);
await write('data/words.json', JSON.stringify(data.map(([id,text,category,categoryLabel,sentence]) => ({id,text,category,categoryLabel,sentence,color:colors[category],image:`assets/images/${id}.svg`,...(id === 'ball' ? {model:'assets/models/ball.gltf'} : {})})),null,2)+'\n');
await write('assets/favicon.svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#425ddd"/><path d="M22 49V25q0-13 15-11h6v9h-5q-6-1-6 5h11v9H32v12z" fill="white"/></svg>');
await write('assets/reading.svg', `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 300"><ellipse cx="182" cy="257" rx="129" ry="13" fill="#d5dff4"/><circle cx="194" cy="136" r="105" fill="#dce6fb"/><g fill="#eebf62"><path d="m52 62 5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z"/><path d="m304 92 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/></g><path d="m286 210 10-53 22-8-12 58" fill="#92b29a"/><path d="m293 195-9-41-19-5 18 49" fill="#b2c8a5"/><path d="m277 203 39 1-7 45h-25z" fill="#d5b29d"/><g transform="translate(41 45) scale(.87)">${person('#e6b96d','#685248',true)}</g><g transform="translate(156 45) scale(.87)">${person('#98a5d5','#5e4b45',true,true)}</g><path d="M177 192q-51-31-106-12l12 73q52-15 95 11 42-26 95-11l12-73q-56-19-108 12z" fill="#6c85c9" stroke="#506cae" stroke-width="3" stroke-linejoin="round"/><path d="M177 197v60M92 193q38-8 66 10m-63 9q35-7 63 10m39-19q28-18 65-10m-65 29q29-17 62-10" fill="none" stroke="#d7e1f8" stroke-width="3" stroke-linecap="round"/><ellipse cx="84" cy="214" rx="13" ry="9" fill="#ffd7b4" transform="rotate(-15 84 214)"/><ellipse cx="269" cy="214" rx="13" ry="9" fill="#ffd7b4" transform="rotate(15 269 214)"/><path d="m90 34 4 10m-16 6 11 2m180 71 9 3m-7-17 4-7" stroke="#97abd6" stroke-width="3" stroke-linecap="round"/></svg>`);
// A self-contained glTF 2.0 sphere: UV-free, uncompressed and without external buffers.
const positions=[], normals=[], indices=[];
const rows=20, columns=32;
for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){
 const a=y/rows*Math.PI,b=x/columns*Math.PI*2;
 const v=[-Math.sin(a)*Math.cos(b),Math.cos(a),Math.sin(a)*Math.sin(b)];
 positions.push(...v);normals.push(...v);
}
for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
 const a=y*(columns+1)+x,b=a+columns+1;
 indices.push(a,b,a+1,b,b+1,a+1);
}
const pos=Buffer.from(new Float32Array(positions).buffer),norm=Buffer.from(new Float32Array(normals).buffer),idx=Buffer.from(new Uint16Array(indices).buffer);
const buffer=Buffer.concat([pos,norm,idx]);
const gltf={asset:{version:'2.0',generator:'fast_read original assets'},scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0}],meshes:[{primitives:[{attributes:{POSITION:0,NORMAL:1},indices:2,material:0}]}],materials:[{name:'Soft blue',pbrMetallicRoughness:{baseColorFactor:[.38,.57,.85,1],metallicFactor:0,roughnessFactor:.65},doubleSided:true}],buffers:[{uri:'data:application/octet-stream;base64,'+buffer.toString('base64'),byteLength:buffer.length}],bufferViews:[{buffer:0,byteOffset:0,byteLength:pos.length,target:34962},{buffer:0,byteOffset:pos.length,byteLength:norm.length,target:34962},{buffer:0,byteOffset:pos.length+norm.length,byteLength:idx.length,target:34963}],accessors:[{bufferView:0,componentType:5126,count:positions.length/3,type:'VEC3',min:[-1,-1,-1],max:[1,1,1]},{bufferView:1,componentType:5126,count:normals.length/3,type:'VEC3'},{bufferView:2,componentType:5123,count:indices.length,type:'SCALAR'}]};
await write('assets/models/ball.gltf',JSON.stringify(gltf));
console.log(`Generated ${data.length} words, 20 SVG images, hero illustration and a glTF sample.`);
