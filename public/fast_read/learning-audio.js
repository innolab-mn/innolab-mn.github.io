import { createAudioSequence } from './shooter-audio.js';

const player=createAudioSequence();
const idPattern=/^[a-z][a-z0-9-]*$/;

export function actionVerbClip(id){
  if(!idPattern.test(id))throw new Error('Invalid action id');
  return `assets/actions-audio/${id}-verb.mp3`;
}
export function actionSentenceClip(id,length){
  if(!idPattern.test(id)||!['short','long'].includes(length))throw new Error('Invalid sentence clip');
  return `assets/actions-audio/${id}-${length}.mp3`;
}
export function actionTokenClip(token){
  const clean=token.trim().replace(/[.,!?]+$/u,'').normalize('NFC').toLocaleLowerCase('mn');
  if(!clean||!/^\p{L}+$/u.test(clean))throw new Error('Invalid sentence word');
  const name=[...clean].map(char=>char.codePointAt(0).toString(16).padStart(4,'0')).join('');
  return `assets/actions-audio/token-${name}.mp3`;
}
export function stopLearningAudio(){player.stop();}
export function playLearningAudio(path,enabled,onError=()=>{}){
  if(!enabled){player.stop();return false;}
  return player.play(Array.isArray(path)?path:[path],onError);
}
