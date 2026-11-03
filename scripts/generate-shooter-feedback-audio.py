"""Generate reusable Mongolian letter and feedback clips for the static site."""
import asyncio
import json
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.fast-read-tools'/'edge-tts'))
import edge_tts
from importlib.util import spec_from_file_location, module_from_spec

spec=spec_from_file_location('audio_clip_utils',ROOT/'scripts'/'audio-clip-utils.py')
audio_utils=module_from_spec(spec)
spec.loader.exec_module(audio_utils)

SITE=ROOT/'public'/'fast_read'
OUT=SITE/'assets'/'shooter-feedback'
VOICE={'voice':'mn-MN-YesuiNeural','rate':'+0%','pitch':'+50Hz'}

async def main():
    OUT.mkdir(parents=True,exist_ok=True)
    alphabet=json.loads((SITE/'data/alphabet.json').read_text(encoding='utf-8'))['letters']
    clips={'correct':'Зөв!', 'letter-joins':'үсэг орж', 'completed':'боллоо!', 'mismatch':'тохирохгүй байна.'}
    for letter in alphabet:
        char=letter['lower']
        # Signs are named explicitly because they do not have independent sounds.
        clips[f'u{ord(char):04x}']={'ь':'зөөлний тэмдэг','ъ':'хатуугийн тэмдэг','щ':'щэ'}.get(char,char)
    path=OUT/'manifest.json'
    manifest=json.loads(path.read_text(encoding='utf-8')) if path.exists() else {}
    for name,text in clips.items():
        target=OUT/(name+'.mp3')
        entry={'text':text,**VOICE}
        if manifest.get(name)==entry and target.exists() and target.stat().st_size>500: continue
        temp=target.with_suffix('.tmp')
        await edge_tts.Communicate(text,**VOICE).save(str(temp))
        if temp.stat().st_size<500: raise ValueError('Empty clip: '+str(temp))
        audio_utils.trim_speech(temp)
        temp.replace(target)
        manifest[name]=entry
        path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        print(name,flush=True)

if __name__=='__main__': asyncio.run(main())
