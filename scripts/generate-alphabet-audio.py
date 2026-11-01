"""Generate static Mongolian word clips with edge-tts (install separately).

Run from the project root. Generated MP3s are served locally at runtime.
"""
import asyncio
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / '.fast-read-tools' / 'edge-tts'))
import edge_tts

SITE = ROOT / 'public' / 'fast_read'
OUT = SITE / 'assets' / 'alphabet-audio'
VOICE = {'voice': 'mn-MN-YesuiNeural', 'rate': '+0%', 'pitch': '+50Hz'}


async def main():
    OUT.mkdir(parents=True, exist_ok=True)
    letters = json.loads((SITE / 'data' / 'alphabet.json').read_text(encoding='utf-8'))['letters']
    manifest_path = OUT / 'manifest.json'
    manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
    for letter in letters:
        if letter['usage'] == 'shape':
            continue
        target = OUT / (letter['id'] + '.mp3')
        entry = {'word': letter['word'], **VOICE}
        if manifest.get(letter['id']) == entry and target.exists() and target.stat().st_size >= 500:
            continue
        temporary = target.with_suffix('.tmp')
        await edge_tts.Communicate(letter['word'].lower(), **VOICE).save(str(temporary))
        if temporary.stat().st_size < 500:
            raise ValueError(f'Empty audio: {temporary}')
        temporary.replace(target)
        manifest[letter['id']] = entry
        manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(letter['id'], target.stat().st_size, flush=True)


if __name__ == '__main__':
    asyncio.run(main())
