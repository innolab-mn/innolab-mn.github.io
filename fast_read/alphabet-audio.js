// The recordings ship with the site; no device voice or online API is needed.
export function createWordSpeaker(AudioClass = globalThis.Audio) {
  let current;
  return {
    stop() { if (current) { current.pause(); current = undefined; } },
    speak(id, onError = () => {}) {
      if (!AudioClass || !/^[a-z-]+$/.test(id)) return false;
      this.stop();
      const audio = new AudioClass(`assets/alphabet-audio/${id}.mp3?v=4`);
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
