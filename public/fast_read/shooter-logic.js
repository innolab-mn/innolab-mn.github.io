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
export function shooterStars(mistakes) {
  return mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
}
