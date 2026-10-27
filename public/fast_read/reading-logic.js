export function countWords(text){return text.trim().split(/\s+/u).filter(token=>/[\p{L}\p{N}]/u.test(token)).length;}
export const MIN_READING_MS=10000;
export function wordsPerMinute(words,elapsedMs){return Number.isFinite(words)&&words>0&&Number.isFinite(elapsedMs)&&elapsedMs>0?words*60000/elapsedMs:null;}
export function readingSummary(records){
  const valid=records.filter(record=>Number.isFinite(record.elapsedMs)&&record.elapsedMs>=MIN_READING_MS&&Number.isFinite(record.words)&&record.words>0);
  const totalWords=valid.reduce((sum,record)=>sum+record.words,0);
  const totalMs=valid.reduce((sum,record)=>sum+record.elapsedMs,0);
  const totalQuestions=records.reduce((sum,record)=>sum+record.totalQuestions,0);
  const totalCorrect=records.reduce((sum,record)=>sum+record.correct,0);
  return {average:wordsPerMinute(totalWords,totalMs),accuracy:totalQuestions?Math.round(totalCorrect/totalQuestions*100):null,completed:new Set(records.map(record=>record.passageId)).size,attempts:records.length,validAttempts:valid.length};
}
export function quizScore(questions,answers){return questions.reduce((sum,question,index)=>sum+(question.correctIndex===answers[index]?1:0),0);}
