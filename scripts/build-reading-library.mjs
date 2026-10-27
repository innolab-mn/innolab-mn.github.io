import { readFile,writeFile,readdir } from 'node:fs/promises';
import { countWords } from '../public/fast_read/reading-logic.js';
const source=new URL('../content/fast_read/readings/',import.meta.url);
const files=(await readdir(source)).filter(file=>file.endsWith('.json')).sort();
const passages=(await Promise.all(files.map(file=>readFile(new URL(file,source),'utf8').then(JSON.parse)))).flat().sort((a,b)=>a.order-b.order);
const categories={home:'Гэрийн жижиг нууц',school:'Сургуулийн өдрүүд',neighborhood:'Хорооллын учрал',friends:'Найзуудын төлөвлөгөө',discovery:'Бяцхан нээлт'};
let failed=false;
for(const passage of passages){
  const count=countWords(passage.paragraphs.join('\n\n'));
  console.log(`${passage.id}: ${count} үг · ${passage.title}`);
  if(count<=200){failed=true;console.error('  Must contain more than 200 words.');}
  if(passage.quiz.length!==5)throw Error(`${passage.id}: 5 questions required`);
  for(const item of passage.quiz){if(item.length!==7||new Set(item.slice(1,5)).size!==4)throw Error(`${passage.id}: invalid quiz`);if(!passage.paragraphs.join(' ').toLowerCase().includes(item[6].toLowerCase()))throw Error(`${passage.id}: evidence not in story: ${item[6]}`);}
}
if(process.argv.includes('--draft'))process.exit(failed?1:0);
if(!passages.length)throw Error('Reading library is empty');
if(new Set(passages.map(passage=>passage.id)).size!==passages.length)throw Error('Duplicate passage IDs');
if(new Set(passages.map(passage=>passage.title)).size!==passages.length)throw Error('Duplicate passage titles');
if(passages.some((passage,index)=>passage.order!==index+1))throw Error('Passage order must be consecutive');
if(failed)throw Error('Some passages contain 200 words or fewer');
const result={version:1,age:9,passages:passages.map(passage=>({...passage,categoryLabel:categories[passage.category],wordCount:countWords(passage.paragraphs.join('\n\n')),questions:passage.quiz.map((item,index)=>{const original=item.slice(1,5);const shift=(passage.order+index)%4;const choices=[...original.slice(shift),...original.slice(0,shift)];return{id:`${passage.id}-q${index+1}`,prompt:item[0],choices,correctIndex:(4-shift)%4,explanation:item[5],evidence:item[6]};}),quiz:undefined}))};
await writeFile(new URL('../public/fast_read/data/readings.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(`Published local library: ${passages.length} original passages and ${passages.reduce((sum,passage)=>sum+passage.quiz.length,0)} explained questions.`);
