import { getLetterChoices } from './alphabet-lessons.js';
export { alphabetPromptClips as pictureShotClips } from './alphabet-audio.js';
import { shuffled } from './randomize.js';
import { shotLauncherMarkup } from './shot-ray.js';

export const PICTURE_SHOT_RANKS = Object.freeze([
  { name: 'Бяцхан харваач', min: 0, targets: 2, icon: '🌱' },
  { name: 'Үсгийн найз', min: 10, targets: 3, icon: '🎯' },
  { name: 'Оддын найз', min: 25, targets: 3, icon: '✨' },
  { name: 'Үсгийн хайгуулч', min: 50, targets: 4, icon: '🧭' },
  { name: 'Мэргэн нүд', min: 80, targets: 4, icon: '🏹' },
  { name: 'Үсгийн харваач', min: 120, targets: 5, icon: '🌟' },
  { name: 'Оддын аялагч', min: 180, targets: 5, icon: '🚀' },
  { name: 'Үсгийн манлай', min: 260, targets: 6, icon: '🏅' },
  { name: 'Үсгийн ертөнцийн баатар', min: 360, targets: 6, icon: '👑' },
]);

export function pictureShotRank(correctHits = 0) {
  const hits = Number.isSafeInteger(correctHits) && correctHits >= 0 ? correctHits : 0;
  const index = PICTURE_SHOT_RANKS.findLastIndex(rank => hits >= rank.min);
  return { ...PICTURE_SHOT_RANKS[index], index, hits, next: PICTURE_SHOT_RANKS[index + 1] };
}

export function pictureShotPlan(letters, count, random = Math.random) {
  const pool = letters.filter(letter => letter.lesson === 'beginner' && letter.usage === 'initial' && letter.picture);
  if (pool.length < 2) throw new Error('At least two picture letters are required');
  const queue = shuffled(pool, random).slice(0, count);
  // Prepare every rank's options up front; only the saved rank sets difficulty.
  return queue.map(letter => ({ letter, choicesByCount: Object.fromEntries(
    [2, 3, 4, 5, 6].map(size => [size, getLetterChoices(pool, letter, Math.min(size, pool.length), random)])
  ) }));
}

export function pictureShotAtRank(question, correctHits) {
  const rank = pictureShotRank(correctHits);
  return { letter: question.letter, rank, choices: question.choicesByCount[rank.targets] };
}

export function pictureShotBoard(question, font) {
  const targets = question.choices.map(letter => `
    <button type="button" class="star-letter font-${font}" data-letter-answer="${letter.id}" aria-label="${letter.upper} үсгийг харвах">
      <span>${letter.upper}</span>
    </button>`).join('');
  return `<div class="picture-hint">
      <img src="${question.letter.picture}" alt="${question.letter.word}">
      <button type="button" class="star-listen" aria-label="Үсэг, зургийн нэрийг дахин сонсох">🔊 Давтах</button>
      <small class="star-audio-note" role="status"></small>
    </div>
    <div class="star-range" role="group" aria-label="Харвах үсгүүд">
      <div class="star-targets" style="--target-columns:${Math.min(3, question.choices.length)}">${targets}</div>
      ${shotLauncherMarkup()}
    </div>`;
}
