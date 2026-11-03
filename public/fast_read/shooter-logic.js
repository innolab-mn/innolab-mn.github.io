import { shuffled } from './randomize.js';
export const beginnerWordIds = ['dad', 'mom', 'sun', 'book', 'milk'];
const easyLetters = [...'аэиоуөүбвгджзлмнпрстхцчш'];
export function wordLetters(word) {
  return [...word.normalize('NFC').trim().toLocaleLowerCase('mn')];
}
export function missingLetterExercise(word, index = Math.floor(wordLetters(word).length / 2)) {
  const letters = wordLetters(word);
  if (!letters.length || !Number.isInteger(index) || index < 0 || index >= letters.length) throw new Error('Invalid missing-letter position');
  return { letters, index, answer: letters[index], masked: letters.map((letter, i) => i === index ? '*' : letter).join('') };
}
export function shooterLetterPosition(word, step){
  const length=wordLetters(word).length;
  if(!length||!Number.isInteger(step)||step<0||step>=length)throw new Error('Invalid shooter step');
  return (Math.floor(length/2)+step)%length;
}
export function missingLetterIsCorrect(exercise, letter) {
  return wordLetters(letter).join('') === exercise.answer;
}
export function letterTargets(word, random = Math.random) {
  const required = [...new Set(wordLetters(word))];
  const distractors = easyLetters.filter(letter => !required.includes(letter));
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  return shuffle([...required, ...shuffle(distractors).slice(0, Math.max(2, 6 - required.length))]);
}
// Build each word and each hidden position once, before the child starts playing.
export function createShooterPlan(pool,random=Math.random){
  return shuffled(pool,random).map(word=>({
    word,
    steps:shuffled(wordLetters(word.text).map((_,index)=>index),random).map(index=>({
      exercise:missingLetterExercise(word.text,index),
      targets:letterTargets(word.text,random),
    })),
  }));
}
export function shooterStars(mistakes) {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
}
// Milestones reward distinct completed words, not repeated rounds.
export const SHOOTER_RANKS=Object.freeze([
  {name:'Бяцхан харваач',min:1,icon:'🌱'},
  {name:'Үсгийн анчин',min:3,icon:'🎯'},
  {name:'Оддын найз',min:5,icon:'✨'},
  {name:'Үгийн хайгуулч',min:8,icon:'🧭'},
  {name:'Мэргэн нүд',min:12,icon:'🏹'},
  {name:'Үгийн харваач',min:16,icon:'🌟'},
  {name:'Оддын аялагч',min:22,icon:'🚀'},
  {name:'Үсгийн манлай',min:30,icon:'🏅'},
  {name:'Одон харвааны оргил',min:40,icon:'👑'},
]);
export function shooterRank(learned,words){
  const valid=new Set(words.map(word=>word.id));
  const count=new Set(learned.filter(id=>valid.has(id))).size;
  let rank=null;
  for(let i=0;i<SHOOTER_RANKS.length;i++)if(count>=SHOOTER_RANKS[i].min)rank=i;
  return {count,rank};
}
