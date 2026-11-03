"""Create local Mongolian clips for shooter words; requires edge-tts and internet."""
import asyncio
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.fast-read-tools' / 'edge-tts'))
import edge_tts
from importlib.util import spec_from_file_location, module_from_spec

spec=spec_from_file_location('audio_clip_utils',ROOT/'scripts'/'audio-clip-utils.py')
audio_utils=module_from_spec(spec)
spec.loader.exec_module(audio_utils)

SITE = ROOT / 'public' / 'fast_read'
OUT = SITE / 'assets' / 'shooter-audio'
VOICE = {'voice':'mn-MN-YesuiNeural','rate':'+0%','pitch':'+50Hz'}

async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    words = json.loads((SITE/'data/words.json').read_text(encoding='utf-8')) + json.loads((SITE/'data/shooter-extra.json').read_text(encoding='utf-8'))
    alphabet = json.loads((SITE/'data/alphabet.json').read_text(encoding='utf-8'))['letters']
    alphabet_manifest = json.loads((SITE/'assets/alphabet-audio/manifest.json').read_text(encoding='utf-8'))
    manifest_path=OUT/'manifest.json'
    manifest=json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
    for word in words:
        target=OUT/(word['id']+'.mp3')
        entry={'word':word['text'],**VOICE}
        if manifest.get(word['id'])==entry and target.exists() and target.stat().st_size>500:
            continue
        match=next((letter for letter in alphabet if letter['word']==word['text'] and alphabet_manifest.get(letter['id'])==entry),None)
        temp=target.with_suffix('.tmp')
        if match:
            shutil.copyfile(SITE/'assets/alphabet-audio'/(match['id']+'.mp3'),temp)
        else:
            await edge_tts.Communicate(word['text'].lower(),**VOICE).save(str(temp))
        if temp.stat().st_size<500: raise ValueError('Empty audio: '+str(temp))
        audio_utils.trim_speech(temp)
        temp.replace(target)
        manifest[word['id']]=entry
        manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(word['id'],flush=True)

if __name__=='__main__': asyncio.run(main())
