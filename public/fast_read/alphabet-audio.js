import { letterClip } from './shooter-audio.js';

// The recordings ship with the site; no device voice or online API is needed.
export function alphabetWordClip(id) {
  if (!/^[a-z-]+$/.test(id)) throw new Error('Invalid alphabet word id');
  return `assets/alphabet-audio/${id}.mp3?v=4`;
}
export function alphabetPromptClips(letter) {
  return [
    letterClip(letter.lower),
    ...(letter.kind === 'sign' ? [] : ['assets/shooter-feedback/letter.mp3']),
    ...(letter.usage === 'shape' ? [] : [alphabetWordClip(letter.id)]),
  ];
}
export function createWordSpeaker(AudioClass = globalThis.Audio) {
  let current;
  return {
    stop() { if (current) { current.pause(); current = undefined; } },
    speak(id, onError = () => {}) {
      if (!AudioClass || !/^[a-z-]+$/.test(id)) return false;
      this.stop();
      const audio = new AudioClass(alphabetWordClip(id));
      current = audio;
      audio.onerror = () => { if (current === audio) onError(); };
      try {
        const result = audio.play();
        result?.catch(() => { if (current === audio) onError(); });
      } catch { if (current === audio) onError(); return false; }
      return true;
    },
  };
}
