export const lessons = [
  { id:'beginner', title:'Эхний үсэг', badge:'Эхлээд эндээс', description:'Танил зураг, үгийн эхний үсэгтэй богинохон тоглоё.' },
  { id:'context', title:'Үг доторх үсэг', badge:'Дараа нь хамтдаа', description:'Автобус, гоё, нохой, аюулгүй гэсэн танил үг дотроос үсгээ олъё.' },
  { id:'special', title:'Хэцүү үсэг', badge:'Тусад нь тайван', description:'Ь · Ъ · Щ · Ы · Ф · К үсгийг нэг нэгээр нь ажиглаж танилцъя.' },
];

export function getLessonLetters(data, lessonId) {
  return data.letters.filter(letter => letter.lesson === lessonId);
}

function shuffle(items, random) {
  const result = [...items];
  for (let i=result.length-1; i>0; i--) {
    const j = Math.floor(random() * (i+1));
    [result[i],result[j]] = [result[j],result[i]];
  }
  return result;
}

// Both targets and distractors must stay in the selected lesson. In particular,
// Щ must never leak into an early Ш question as a similar-looking distractor.
export function getLetterChoices(pool, target, count, random = Math.random) {
  const confusable = {o:['oe','s'],oe:['o','e'],u:['ue','ch'],ue:['u','ch'],sh:['shch','ts'],shch:['sh','ts'],'hard-sign':['soft-sign','y'],'soft-sign':['hard-sign','y'],ye:['yo','e'],yo:['ye','e'],i:['short-i','n'],'short-i':['i','n']};
  const others = pool.filter(letter => letter.id !== target.id);
  const similar = others.filter(letter => (confusable[target.id] || []).includes(letter.id));
  const fallback = others.filter(letter => !similar.some(item => item.id === letter.id));
  return shuffle([target,...[...shuffle(similar,random),...shuffle(fallback,random)].slice(0,count-1)],random);
}
