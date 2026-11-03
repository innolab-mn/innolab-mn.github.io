const MONGOLIAN_LETTERS=new Set([...('абвгдеёжзийклмнопрстуүфхцчшщъыьэюяөү')]);

// Clip names use Unicode codepoints so filenames are portable across hosts.
const version='?v=2';
function letterClip(letter){
  const normalized=letter.normalize('NFC').toLocaleLowerCase('mn');
  if([...normalized].length!==1||!MONGOLIAN_LETTERS.has(normalized))throw new Error('Invalid feedback letter');
  const code=normalized.codePointAt(0).toString(16).padStart(4,'0');
  return `assets/shooter-feedback/u${code}.mp3${version}`;
}
export function shooterWordClip(wordId){
  if(!/^[a-z][a-z0-9-]*$/.test(wordId))throw new Error('Invalid word id');
  return `assets/shooter-audio/${wordId}.mp3${version}`;
}
export function shooterFeedbackClips(letter,wordId){
  return [`assets/shooter-feedback/correct.mp3${version}`,letterClip(letter),`assets/shooter-feedback/letter-joins.mp3${version}`,shooterWordClip(wordId),`assets/shooter-feedback/completed.mp3${version}`];
}
export function shooterWrongClips(letter){
  return [letterClip(letter),`assets/shooter-feedback/mismatch.mp3${version}`];
}

// A single audio element is reused across clips, including on mobile browsers.
// A generation token prevents an old ended/rejected event from restarting audio.
export function createAudioSequence(AudioClass=globalThis.Audio){
  let audio, generation=0;
  function stop(){
    generation++;
    if(audio){audio.onended=null;audio.onerror=null;audio.pause();audio=undefined;}
  }
  function play(paths,onError=()=>{}){
    stop();
    if(!AudioClass||!paths.length)return false;
    const token=generation;
    let index=0,failed=false;
    try{audio=new AudioClass();}catch{onError();return false;}
    const player=audio;
    const fail=()=>{if(token!==generation||failed)return;failed=true;stop();onError();};
    const next=()=>{
      if(token!==generation||failed)return;
      if(index===paths.length){player.onended=null;player.onerror=null;audio=undefined;return;}
      player.src=paths[index++];
      try{const result=player.play();result?.catch(fail);}catch{fail();}
    };
    player.onended=next;
    player.onerror=fail;
    next();
    return !failed;
  }
  return {play,stop};
}
