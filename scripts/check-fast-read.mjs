import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { getLessonLetters, getLetterChoices } from '../public/fast_read/alphabet-lessons.js';
import { actionPool, sentenceTokens, sentenceIsCorrect, pictureDistractors } from '../public/fast_read/actions-logic.js';
import { countWords, wordsPerMinute, readingSummary, quizScore } from '../public/fast_read/reading-logic.js';
const root = new URL('../public/fast_read/', import.meta.url);
const words = JSON.parse(await readFile(new URL('data/words.json', root), 'utf8'));
assert.ok(words.length >= 20, 'At least 20 starter words are required');
assert.equal(new Set(words.map(word => word.id)).size, words.length, 'Word IDs must be unique');
assert.equal(new Set(words.map(word => word.text)).size, words.length, 'Word texts must be unique');
for (const word of words) {
  assert.match(word.id, /^[a-z][a-z0-9-]*$/);
  for (const key of ['text','category','categoryLabel','sentence','image','color']) assert.ok(typeof word[key] === 'string' && word[key].trim(), `${word.id}: missing ${key}`);
  assert.match(word.color, /^#[0-9a-f]{6}$/i);
  for (const asset of [word.image, word.model].filter(Boolean)) {
    assert.ok(!asset.includes('..') && asset.startsWith('assets/'), `Assets must stay local: ${asset}`);
    await access(new URL(asset, root));
  }
}
const modelWords = words.filter(word => word.model);
assert.ok(modelWords.length, 'Include a working 3D example');
for (const word of modelWords.filter(word => word.model.endsWith('.gltf'))) {
  const model = JSON.parse(await readFile(new URL(word.model, root), 'utf8'));
  assert.equal(model.asset.version, '2.0');
  for (const buffer of model.buffers) {
    const data = Buffer.from(buffer.uri.split(',')[1], 'base64');
    assert.equal(data.length, buffer.byteLength, 'Embedded glTF buffer length');
    for (const view of model.bufferViews) assert.ok((view.byteOffset || 0) + view.byteLength <= data.length, 'glTF bufferView bounds');
  }
}
const story = JSON.parse(await readFile(new URL('data/story.json', root), 'utf8'));
assert.deepEqual(story.chapters.map(chapter => chapter.id), [1,2,3]);
for (const chapter of story.chapters) {
  for (const text of [chapter.title, chapter.intro, chapter.goal, chapter.scene.title, chapter.scene.text]) assert.ok(text?.trim());
  assert.equal(chapter.scene.choices.length, 2, 'Two narrative choices per chapter');
  const assets = [chapter.image, chapter.scene.image];
  for (const choice of chapter.scene.choices) {
    assert.ok(choice.id && choice.label && choice.outcome);
    assets.push(choice.image);
    if (choice.repair) { assert.ok(choice.repaired && choice.repairImage); assets.push(choice.repairImage); }
  }
  for (const asset of assets) { assert.ok(asset.startsWith('assets/story/') && !asset.includes('..')); await access(new URL(asset, root)); }
}
const alphabet = JSON.parse(await readFile(new URL('data/alphabet.json', root), 'utf8'));
const order = 'АБВГДЕЁЖЗИЙКЛМНОӨПРСТУҮФХЦЧШЩЪЫЬЭЮЯ';
assert.equal(alphabet.letters.map(letter => letter.upper).join(''), order, 'Exactly 35 Mongolian letters in order');
assert.equal(new Set(alphabet.letters.map(letter => letter.id)).size, 35);
assert.equal(alphabet.fonts.length, 4);
assert.ok(alphabet.fonts.some(font=>font.id==='handwritten'));
const expectedLessons = {beginner:25,context:4,special:6};
for (const [id,count] of Object.entries(expectedLessons)) {
  const pool=getLessonLetters(alphabet,id);
  assert.equal(pool.length,count,`${id} lesson size`);
  for(const target of pool) {
    for(let trial=0;trial<12;trial++) {
      const options=getLetterChoices(pool,target,Math.min(4,pool.length));
      assert.equal(new Set(options.map(letter=>letter.id)).size,options.length);
      assert.ok(options.some(letter=>letter.id===target.id));
      assert.ok(options.every(letter=>letter.lesson===id),'Distractors stay in the lesson');
      if(id==='beginner') assert.ok(options.every(letter=>!['Ь','Ъ','Щ','Ы','Ф','К','В','Ё','Й','Ю'].includes(letter.upper)),'No advanced letters leak into early answers');
    }
    if(id==='beginner') assert.equal(target.usage,'initial');
  }
}
assert.deepEqual(getLessonLetters(alphabet,'special').map(letter=>letter.upper).sort(),['Ь','Ъ','Щ','Ы','Ф','К'].sort());
assert.ok(!alphabet.letters.some(letter=>['Ваар','Луу','Яст мэлхий','Кенгуру','Фламинго','Щедрин','Юүлүүр','Еэвэн','Ёотон','Шүхэр'].includes(letter.word)),'Retire unclear examples');
let letterAssets = 0;
for (const letter of alphabet.letters) {
  assert.equal(letter.lower, letter.upper.toLowerCase());
  assert.equal(letter.word[letter.highlightIndex].toUpperCase(), letter.upper, 'Example highlights the actual letter');
  if (letter.usage === 'initial') assert.equal(letter.highlightIndex, 0);
  if (['Й','Ъ','Ы','Ь'].includes(letter.upper)) assert.notEqual(letter.usage,'initial','Do not invent initial-letter examples');
  for (const font of alphabet.fonts) {
    for (const kind of ['illustrated','upper','lower']) {
      const asset = letter.variants[font.id][kind];
      assert.ok(asset.startsWith('assets/alphabet/') && !asset.includes('..'));
      const svg = await readFile(new URL(asset,root),'utf8');
      assert.match(svg, /<path /);
      assert.ok(!/<text|https?:.*(?:src|href)=/.test(svg), 'Letter images contain actual vector outlines');
      if (kind !== 'illustrated') assert.match(svg, /fill="#344362"/, 'Neutral answers must not reveal a letter through its color');
      letterAssets++;
    }
  }
}
for (const font of alphabet.fonts) await access(new URL(font.file,root));
const actions=JSON.parse(await readFile(new URL('data/actions.json',root),'utf8'));
assert.equal(actions.actions.length,12);
assert.equal(new Set(actions.actions.map(action=>action.id)).size,12);
assert.equal(actionPool(actions,'long').length,6);
for(const action of actions.actions){
  assert.ok(action.verb&&action.present&&action.subject&&action.hint);
  assert.ok(action.image.startsWith('assets/actions/')&&!action.image.includes('..'));
  await access(new URL(action.image,root));
  for(const length of ['short','long']){
    if(!action.sentences[length])continue;
    const tokens=sentenceTokens(action,length);
    assert.equal(tokens.length,length==='short'?3:4);
    assert.equal(tokens[0],action.subject);
    assert.equal(tokens.at(-2),action.present);
    assert.equal(tokens.at(-1),'байна.');
    assert.ok(sentenceIsCorrect(action,tokens,length));
    assert.ok(!sentenceIsCorrect(action,[...tokens].reverse(),length),'Word order matters');
    assert.ok(!sentenceIsCorrect(action,tokens.slice(0,-1),length),'Incomplete sentences are not accepted');
    const other=actions.actions.find(item=>item.present!==action.present);
    const wrong=[...tokens];wrong[wrong.length-2]=other.present;
    assert.ok(!sentenceIsCorrect(action,wrong,length),'An unrelated verb is not accepted');
    const options=pictureDistractors(actionPool(actions,length),action,2);
    assert.equal(options.length,2);
    assert.ok(options.every(item=>item.id!==action.id&&item.subject===action.subject),'Reading requires recognizing the action, not only the actor');
  }
}
const reading=JSON.parse(await readFile(new URL('data/readings.json',root),'utf8'));
assert.equal(reading.passages.length,60);
assert.equal(new Set(reading.passages.map(passage=>passage.id)).size,60);
assert.equal(new Set(reading.passages.map(passage=>passage.title)).size,60);
assert.deepEqual(reading.passages.map(passage=>passage.order),Array.from({length:60},(_,i)=>i+1));
assert.equal(new Set(reading.passages.flatMap(passage=>passage.paragraphs)).size,reading.passages.flatMap(passage=>passage.paragraphs).length,'No repeated filler paragraphs');
for(const passage of reading.passages){
  const text=passage.paragraphs.join(' ');
  assert.equal(passage.paragraphs.length,6);
  assert.ok(typeof passage.teaser==='string'&&passage.teaser.length>20);
  assert.ok(countWords(text)>200,`${passage.id}: 200+ words`);
  assert.equal(passage.wordCount,countWords(text));
  assert.equal(passage.questions.length,5);
  for(const question of passage.questions){
    assert.equal(question.choices.length,4);assert.equal(new Set(question.choices).size,4);
    assert.ok(Number.isInteger(question.correctIndex)&&question.correctIndex>=0&&question.correctIndex<4);
    assert.ok(question.prompt.length>10&&question.explanation.length>15);
    assert.ok(text.toLowerCase().includes(question.evidence.toLowerCase()),`${question.id}: evidence is in the passage`);
  }
  assert.equal(quizScore(passage.questions,passage.questions.map(question=>question.correctIndex)),5);
  assert.equal(quizScore(passage.questions,passage.questions.map(question=>(question.correctIndex+1)%4)),0);
}
assert.equal(new Set(reading.passages.flatMap(passage=>passage.questions.map(question=>question.id))).size,300);
for(const category of ['home','school','neighborhood','friends','discovery'])assert.equal(reading.passages.filter(passage=>passage.category===category).length,12);
assert.equal(countWords('Аав ном уншив.\n— Хүү: «Би ч уншъя!»'),7,'Punctuation-only tokens do not count');
assert.equal(wordsPerMinute(240,120000),120);
assert.equal(wordsPerMinute(240,0),null);
const timingExample=readingSummary([{passageId:'a',words:200,elapsedMs:120000,correct:4,totalQuestions:5},{passageId:'b',words:100,elapsedMs:30000,correct:5,totalQuestions:5},{passageId:'a',words:200,elapsedMs:1000,correct:3,totalQuestions:5}]);
assert.equal(timingExample.average,120,'Average is total words / total active minutes, not the mean of rounded speeds');
assert.equal(timingExample.accuracy,80,'Quiz results are independent of reading duration eligibility');
assert.equal(timingExample.completed,2);assert.equal(timingExample.validAttempts,2);
for (const file of ['index.html','app.js','alphabet.js','alphabet-lessons.js','actions.js','actions-logic.js','actions.css','exercise.css','reading.js','reading-logic.js','reading.css','style.css','settings.css','story.css','alphabet.css','assets/reading.svg','assets/favicon.svg','vendor/model-viewer.min.js','vendor/LICENSE-model-viewer.txt']) await access(new URL(file, root));
const html = await readFile(new URL('index.html', root), 'utf8');
assert.match(html, /lang="mn"/);
assert.ok(!/(?:src|href)="https?:/.test(html), 'Runtime entry must not depend on a CDN');
console.log(`fast_read: ${reading.passages.length} readings / 300 explained questions / weighted WPM and quiz scoring; ${words.length} starter words, 25/4/6 letter lessons, ${letterAssets} letter SVGs, 12 verbs, and glTF verified.`);
