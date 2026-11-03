"""Trim generated speech clips while retaining a small, natural ending gap."""
import subprocess
import sys
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'.fast-read-tools'/'ffmpeg'))
import imageio_ffmpeg

def trim_speech(path):
    path=Path(path)
    target=path.with_name(path.name+'.trim.mp3')
    # A conservative threshold keeps quiet consonants and short vowels audible.
    filters=('silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB,'
             'areverse,silenceremove=start_periods=1:start_duration=0.01:'
             'start_threshold=-50dB,areverse,apad=pad_dur=0.04')
    subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(),'-hide_banner','-loglevel','error',
                    '-y','-i',str(path),'-af',filters,'-ac','1','-ar','24000',
                    '-b:a','48k','-f','mp3',str(target)],check=True)
    if target.stat().st_size<500:
        raise ValueError('Trimmed clip is empty: '+str(path))
    target.replace(path)
