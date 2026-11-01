export function countWords(text){return text.trim().split(/\s+/u).filter(token=>/[\p{L}\p{N}]/u.test(token)).length;}
export const MIN_READING_MS=10000;
// Game milestones, not reading standards; all profile attempts use the same scale.
export const READING_RANKS=Object.freeze([
  {name:'Номын сониуч',min:0,icon:'🌱'},
  {name:'Үгийн найз',min:40,icon:'🍀'},
  {name:'Өгүүлбэрийн судлаач',min:60,icon:'🔎'},
  {name:'Түүхийн аялагч',min:80,icon:'🧭'},
  {name:'Номын нээлтчин',min:100,icon:'📚'},
  {name:'Үгийн жигүүртэн',min:120,icon:'🪶'},
  {name:'Түүхийн од',min:140,icon:'⭐'},
  {name:'Номын манлай',min:160,icon:'🏅'},
  {name:'Уншлагын оргил',min:180,icon:'👑'},
]);
export function readingRank(average){
  if(!Number.isFinite(average)||average<0)return null;
  for(let i=READING_RANKS.length-1;i>=0;i--)if(average>=READING_RANKS[i].min)return i;
  return null;
}
// A rank, once earned, is retained even when the current weighted average falls.
export function readingRankProgress(records){
  let words=0,ms=0,best=null;
  for(const record of records){
    if(!Number.isFinite(record.words)||record.words<=0||!Number.isFinite(record.elapsedMs)||record.elapsedMs<MIN_READING_MS)continue;
    words+=record.words;ms+=record.elapsedMs;
    const rank=readingRank(wordsPerMinute(words,ms));
    if(best===null||rank>best)best=rank;
  }
  return {best,average:wordsPerMinute(words,ms)};
}
export function readingRankPromotion(records,record){
  const before=readingRankProgress(records).best;
  const after=readingRankProgress([...records,record]).best;
  return after!==null&&(before===null||after>before)?after:null;
}
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
