// Icons are decorative; the visible Mongolian label is the accessible name.
export function pauseControlMarkup(paused){
  return `<span class="kid-control-icon" aria-hidden="true">${paused?'▶':'Ⅱ'}</span><span>${paused?'Үргэлжлүүлэх':'Түр зогсоох'}</span>`;
}
