import assert from 'node:assert/strict';
import { shuffled } from '../public/fast_read/randomize.js';
import { createShooterPlan, wordLetters } from '../public/fast_read/shooter-logic.js';
import { createReadingQuiz, quizScore } from '../public/fast_read/reading-logic.js';

// Deterministic random sources make order changes and answer mapping repeatable.
const original=[1,2,3,4,5];
assert.deepEqual(shuffled(original,()=>0.999),original);
assert.deepEqual(shuffled(original,()=>0),[2,3,4,5,1]);
assert.deepEqual(original,[1,2,3,4,5],'Source order must remain untouched');
const words=[{id:'dad',text:'Аав'},{id:'mom',text:'Ээж'},{id:'sun',text:'Нар'}];
const plan=createShooterPlan(words,()=>0);
assert.deepEqual(plan.map(item=>item.word.id),['mom','sun','dad']);
assert.deepEqual(words.map(item=>item.id),['dad','mom','sun']);
for(const item of plan){
  const letters=wordLetters(item.word.text);
  assert.deepEqual(item.steps.map(step=>step.exercise.index).sort((a,b)=>a-b),letters.map((_,i)=>i));
  for(const step of item.steps){
    assert.ok(step.targets.includes(step.exercise.answer));
    assert.equal(step.exercise.masked.replace('*',step.exercise.answer),letters.join(''));
  }
}
const questions=Array.from({length:5},(_,i)=>({id:`q${i}`,choices:['a','b','c','d'],correctIndex:i%4}));
const quiz=createReadingQuiz(questions,()=>0);
assert.deepEqual(quiz.questions.map(q=>q.id),['q1','q2','q3','q4','q0']);
assert.deepEqual(questions.map(q=>q.id),['q0','q1','q2','q3','q4']);
const selections=quiz.questions.map((question,index)=>{
  const displayedPosition=quiz.order[index].indexOf(question.correctIndex);
  return quiz.order[index][displayedPosition];
});
assert.equal(quizScore(quiz.questions,selections),5,'Correct answers follow shuffled questions');
selections[2]=(selections[2]+1)%4;
assert.equal(quizScore(quiz.questions,selections),4);
console.log('Random exercise plans: source preservation, all shooter positions, quiz mapping and scoring verified.');
