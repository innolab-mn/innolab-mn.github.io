import type { Locale } from '@/lib/i18n';
// Server-rendered artwork; all movement is CSS, with a native pause control.
export default function Halloween({ locale = 'mn' }: { locale?: Locale }) {
  const pauseLabel = locale === 'en' ? 'Pause decoration animations' : 'Чимэглэлийн хөдөлгөөнийг түр зогсоох';
  return <>
    <input className="decoration-motion-toggle" type="checkbox" id="decoration-motion-toggle" aria-label={pauseLabel} />
    <label className="decoration-motion-control" htmlFor="decoration-motion-toggle" title={pauseLabel}>
      <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path className="decoration-pause-icon" d="M7 5v10M13 5v10"/><path className="decoration-play-icon" d="m7 4 9 6-9 6Z"/></svg>
    </label>
    <div className="halloween-scene" aria-hidden="true">
    <svg className="halloween-web halloween-web-left" viewBox="0 0 180 200" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <g className="halloween-web-lines">
        <path d="M0 0 174 8M0 0 161 77M0 0 124 124M0 0 77 161M0 0 8 174" />
        <path d="M36 2Q28 13 32 16Q24 24 24 24Q13 28 16 32Q6 32 2 36M73 4Q56 27 66 32Q49 49 49 49Q27 56 32 66Q12 66 4 73M110 6Q85 41 100 48Q73 73 73 73Q41 85 48 100Q17 100 6 110M148 8Q115 55 135 65Q98 98 98 98Q55 115 65 135Q22 135 8 148" />
      </g>
      <g className="halloween-circuit-traces"><path d="M6 18h19l16 16h24M7 61h12l16 16v24M66 7v15l19 19h21" /><circle cx="66" cy="34" r="3"/><circle cx="35" cy="104" r="3"/><circle cx="109" cy="41" r="3"/></g>
      <path d="M135 65v62" className="halloween-thread" />
      <g className="halloween-chip-spider">
        <path d="m126 132-12-8-7 5m19 10h-16l-5 7m22-1-12 11v8m29-32 12-8 7 5m-19 10h16l5 7m-22-1 12 11v8" />
        <rect x="125" y="127" width="20" height="24" rx="7" /><path d="M130 127v-4m10 4v-4m-10 28v4m10-4v4"/>
        <circle cx="131" cy="137" r="2" className="halloween-spider-eye"/><circle cx="139" cy="137" r="2" className="halloween-spider-eye"/>
      </g>
    </svg>
    <svg className="halloween-night" viewBox="0 0 210 175" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <g className="halloween-web-lines"><path d="M210 0H98m112 0-81 65m81-65-35 91m35-91v114M179 0q3 20 10 18 1 13 10 13M146 0q4 39 23 32 3 25 21 29M111 0q6 57 35 51 6 37 25 43"/></g>
      <path className="halloween-moon" d="M86 22a27 27 0 1 0 32 40A28 28 0 0 1 86 22Z" />
      <g className="halloween-moon-marks"><path d="M68 44a14 14 0 0 0 9 21"/><circle cx="81" cy="68" r="2"/><circle cx="71" cy="51" r="2"/></g>
      <g className="halloween-bat" transform="translate(26 83) rotate(-14)"><path d="M0 10Q9-5 25 0L22 8l9 4 7-8 5 8 9-4L49 0Q65-5 74 10q-12-2-13 12-10-6-16 6l-8-6-8 6Q23 16 13 22 12 8 0 10Z"/><path className="halloween-wing-trace" d="m15 5 12 11h7m26-11L48 16h-7"/></g>
      <g className="halloween-bat halloween-bat-small" transform="translate(131 96) rotate(16) scale(.58)"><path d="M0 10Q9-5 25 0L22 8l9 4 7-8 5 8 9-4L49 0Q65-5 74 10q-12-2-13 12-10-6-16 6l-8-6-8 6Q23 16 13 22 12 8 0 10Z"/></g>
      <g className="halloween-stars"><path d="M44 24v12m-6-6h12m94 37v10m-5-5h10M107 130v8m-4-4h8"/><circle cx="34" cy="58" r="2"/><circle cx="156" cy="141" r="2"/></g>
    </svg>
    <svg className="halloween-pumpkin" viewBox="0 0 176 174" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <ellipse className="halloween-ground" cx="86" cy="158" rx="75" ry="8" />
      <path className="pumpkin-board" d="m19 142 106-9 28 16-107 12-27-12Z"/>
      <g className="pumpkin-board-traces"><path d="m34 145 26 8 19-2m8-2 27-3 10 4m-25-13 15 4 14-2"/><circle cx="82" cy="151" r="2"/><circle cx="127" cy="151" r="2"/></g>
      <g className="pumpkin-character">
      <path className="pumpkin-stem" d="M76 54q-8-21 7-30l8 7q-12 5-9 22"/>
      <path className="pumpkin-leaf" d="M84 52q13-19 30-12-8 17-30 15"/>
      <path className="pumpkin-vine" d="m89 49 18-5m-26 8c-12-16-27-12-22-5 4 5 13-2 7-6"/>
      <path className="pumpkin-body" d="M80 59C33 28 10 74 24 112c8 23 30 30 55 24 27 6 49-1 56-25 14-37-12-82-55-52Z"/>
      <path className="pumpkin-ribs" d="M80 59c-28-16-40 4-40 37 0 24 13 42 39 40m1-77c29-15 39 5 39 38 0 24-13 40-40 39M80 59c-12 13-14 59-1 77m1-77c14 14 14 60-1 77"/>
      <path className="pumpkin-highlight" d="M32 72q5-14 15-12m2 1 4 1M30 88v6"/>
      <path className="pumpkin-headband" d="m28 79 23 5m57-1 25-8"/>
      <rect className="pumpkin-goggles" x="46" y="75" width="68" height="27" rx="10" transform="rotate(-6 80 89)"/>
      <path className="pumpkin-eye" d="m54 91 11-9 5 10Zm35 0 5-12 12 9Z"/>
      <path className="pumpkin-lens-shine" d="m52 81 9-1m40-2 5-1"/>
      <path className="pumpkin-face" d="m55 112 12 5 6-4 8 8 8-8 6 3 13-7c-8 23-43 26-53 3Z"/>
      <path className="pumpkin-antenna" d="M48 72 38 53V43"/><circle className="pumpkin-led" cx="38" cy="39" r="5"/>
      <g className="pumpkin-screws"><path d="M34 104h5m-2.5-2.5v5m84-8h5m-2.5-2.5v5"/></g>
      <path className="pumpkin-copper-wire" d="M37 110v9q0 5 5 5h7v-11m60 11h8q6 0 6-6v-10"/>
      <g className="pumpkin-gear" transform="translate(113 111)">
        <path d="M-3-8h6l1 3 3 1 3-1 3 5-3 2v3l1 3-5 3-2-3H1l-3 1-3-5 3-2v-3l-3-2 3-5 3 1Z"/>
        <circle cx="3" cy="1" r="3"/>
      </g>
      </g>
      <g className="pumpkin-companion"><g transform="translate(128 109) rotate(10)"><path className="pumpkin-stem" d="M16 5V0h4v6"/><path className="pumpkin-body" d="M17 8C1-1-7 15 0 27c4 9 12 9 17 7 9 3 18-1 20-10C42 10 31 0 17 8Z"/><path className="pumpkin-ribs" d="M17 8q-8 12 0 26m2-26q9 12 0 26"/><path className="pumpkin-face" d="m4 18 6-5 2 6Zm19 1 2-6 7 5ZM9 25h17l-4 5h-9Z"/></g></g>
      <g className="halloween-stars"><path d="M14 64v12m-6-6h12m126-37v12m-6-6h12M119 13v8m-4-4h8"/><circle cx="19" cy="119" r="2"/></g>
    </svg>
    <svg className="halloween-ghost" viewBox="0 0 110 156" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <ellipse className="halloween-ground" cx="57" cy="146" rx="31" ry="5"/>
      <g className="ghost-float">
      <path className="ghost-tail" d="m55 122 5 12-6 5"/>
      <path className="ghost-body" d="M24 58C24 9 86 9 86 58v28l12 20-17-4-4 25-19-11-18 10-6-23-17 5 7-23Z"/>
      <path className="ghost-seam" d="M31 53c0-17 9-25 20-27"/>
      <rect className="ghost-visor" x="35" y="48" width="41" height="23" rx="9" transform="rotate(8 55 60)"/>
      <path className="ghost-eyes" d="M44 57v5m20-3v5"/>
      <rect className="ghost-chip" x="43" y="83" width="25" height="21" rx="4" transform="rotate(8 55 93)"/>
      <path className="ghost-code" d="m50 89-4 3 3 3m12-4 3 4-4 2m-6-9-2 10"/>
      <path className="ghost-pins" d="m41 87-5-1m5 7-5-1m33-1 5 1m-6 5 5 1M50 81v-5m10 6 1-5m-13 26-1 5m12-3-1 5"/>
      <path className="ghost-stitches" d="m27 80 5 1m-6 5 5 1m-6 5 5 1m48 20 4 2m-7 3 4 2"/>
      <path className="ghost-lens-shine" d="m41 52 12 2"/>
      </g>
      <g className="halloween-stars"><path d="M18 22v10m-5-5h10m68 39v8m-4-4h8"/><circle cx="78" cy="13" r="2"/></g>
    </svg>
    </div>
  </>;
}
