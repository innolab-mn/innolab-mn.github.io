"""Generate local Mongolian action, sentence and individual-word recordings.

Requires edge-tts, imageio-ffmpeg and an internet connection to generate.
The generated site plays the MP3 files without either dependency.
"""
import asyncio
import json
import shutil
import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.fast-read-tools'/'edge-tts'))
import edge_tts

spec=spec_from_file_location('audio_clip_utils',ROOT/'scripts'/'audio-clip-utils.py')
audio_utils=module_from_spec(spec)
spec.loader.exec_module(audio_utils)
SITE=ROOT/'public'/'fast_read'
OUT=SITE/'assets'/'actions-audio'
VOICE={'voice':'mn-MN-YesuiNeural','rate':'+0%','pitch':'+50Hz'}

def token_name(token):
    token=token.strip().rstrip('.,!?').lower()
    return 'token-'+''.join(f'{ord(char):04x}' for char in token)

async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    actions=json.loads((SITE/'data/actions.json').read_text(encoding='utf-8'))['actions']
    words=json.loads((SITE/'data/words.json').read_text(encoding='utf-8'))
    word_audio={word['text'].lower():SITE/'assets'/'shooter-audio'/(word['id']+'.mp3') for word in words}
    clips={}
    for action in actions:
        clips[action['id']+'-verb']=action['verb']
        for length,tokens in action['sentences'].items():
            clips[action['id']+'-'+length]=' '.join(tokens)
            for token in tokens:
                clean=token.strip().rstrip('.,!?').lower()
                clips[token_name(clean)]=clean
    path=OUT/'manifest.json'
    manifest=json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
    for name,text in clips.items():
        target=OUT/(name+'.mp3')
        entry={'text':text,**VOICE}
        if manifest.get(name)==entry and target.exists() and target.stat().st_size>500: continue
        temp=target.with_suffix('.tmp')
        source=word_audio.get(text.lower())
        if source and source.exists():
            shutil.copyfile(source,temp)
        else:
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(text,**VOICE,receive_timeout=15).save(str(temp))
                    break
                except Exception:
                    if attempt==2: raise
                    await asyncio.sleep(2*(attempt+1))
            audio_utils.trim_speech(temp)
        if temp.stat().st_size<500: raise ValueError('Empty clip: '+str(temp))
        temp.replace(target)
        manifest[name]=entry
        path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(name,flush=True)

if __name__=='__main__': asyncio.run(main())
