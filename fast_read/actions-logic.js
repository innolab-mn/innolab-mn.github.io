export const actionModes=[
  {id:'learn',title:'Үйл үгээ олъё',description:'Зургийг ажиглаад, хийж байгаа үйлдлийн үгийг сонгоно.',symbol:'↗'},
  {id:'build',title:'Өгүүлбэр бүтээе',description:'Үгэнд хүрч сонгоод, зурагт тохирох өгүүлбэр өрнө.',symbol:'▤'},
  {id:'read',title:'Уншаад зургаа олъё',description:'Богино өгүүлбэрээ уншаад, тохирох үйлдлийн зургийг олно.',symbol:'◉'},
];
export function sentenceTokens(action,length='short') {
  const tokens=action.sentences[length];
  if(!tokens) throw new Error(`Missing ${length} sentence for ${action.id}`);
  return [...tokens];
}
export function actionPool(data,length='short',mode='build') {
  return data.actions.filter(action=>mode==='learn'||action.sentences[length]);
}
export function sentenceIsCorrect(action,selected,length='short') {
  const target=sentenceTokens(action,length);
  return selected.length===target.length&&target.every((word,index)=>word===selected[index]);
}
export function pictureDistractors(pool,target,count=2) {
  const other=pool.filter(action=>action.id!==target.id);
  const sameSubject=other.filter(action=>action.subject===target.subject);
  return [...sameSubject,...other.filter(action=>action.subject!==target.subject)].slice(0,count);
}
