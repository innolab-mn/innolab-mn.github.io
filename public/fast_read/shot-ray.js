const effects = new WeakMap();
const initialized = new WeakSet();
const targetSelector = '[data-shoot-letter], [data-shoot-word], [data-letter-answer]';

export function shotLauncherMarkup() {
  return '<div class="shot-launcher" aria-hidden="true"><span class="shot-barrel"><i>✦</i></span><span class="shot-base"><i></i><i></i><i></i></span></div>';
}

export function shotGeometry(area, target, compact = false) {
  const pivotX = area.width / 2, pivotY = area.height - (compact ? 17 : 29);
  const x = target.left + target.width / 2 - area.left;
  const y = target.top + target.height / 2 - area.top;
  const dx = x - pivotX, dy = y - pivotY;
  const distance = Math.hypot(dx, dy);
  const muzzle = Math.min(compact ? 20 : 34, distance);
  const startX = pivotX + (distance ? dx / distance * muzzle : 0);
  const startY = pivotY + (distance ? dy / distance * muzzle : 0);
  return { x, y, startX, startY, dx: x - startX, dy: y - startY,
    aimAngle: Math.atan2(dx, -dy) * 180 / Math.PI,
    flightAngle: Math.atan2(dy, dx) * 180 / Math.PI };
}

function aimAt(button, stage) {
  const path = shotGeometry(stage.getBoundingClientRect(), button.getBoundingClientRect(), stage.classList.contains('star-range'));
  stage.style.setProperty('--aim-angle', `${path.aimAngle}deg`);
  return path;
}

export function initShotStage(stage) {
  if (!stage || initialized.has(stage)) return;
  initialized.add(stage);
  const aim = event => {
    const button = event.target.closest?.(targetSelector);
    if (button && stage.contains(button) && !button.disabled) aimAt(button, stage);
  };
  stage.addEventListener('pointerover', aim);
  stage.addEventListener('pointerdown', aim);
  stage.addEventListener('focusin', aim);
  stage.addEventListener('pointerleave', () => {
    if (!stage.contains(document.activeElement)) stage.style.setProperty('--aim-angle', '0deg');
  });
  stage.addEventListener('focusout', event => {
    if (!stage.contains(event.relatedTarget)) stage.style.setProperty('--aim-angle', '0deg');
  });
}

export function clearShotEffects(stage) {
  if (stage) effects.get(stage)?.();
}

// Visual effects never decide scores or advance a question. Only one effect
// lives on a stage, so quick retries cannot accumulate particles or timers.
export function drawRay(button, stage, correct = true) {
  clearShotEffects(stage);
  const path = aimAt(button, stage);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const effect = document.createElement('span');
  effect.className = `shot-effects ${correct ? 'is-hit' : 'is-miss'}`;
  effect.setAttribute('aria-hidden', 'true');
  effect.style.cssText = `--start-x:${path.startX}px;--start-y:${path.startY}px;--hit-x:${path.x}px;--hit-y:${path.y}px;--fly-x:${path.dx}px;--fly-y:${path.dy}px;--flight-angle:${path.flightAngle}deg`;
  const flight = document.createElement('span');
  flight.className = 'shot-flight';flight.textContent = '✦';
  const impact = document.createElement('span');impact.className = 'shot-impact';
  effect.append(flight, impact);
  const count = correct ? 8 : 4;
  const radius = stage.classList.contains('star-range') ? 32 : 48;
  for (let i = 0; i < count; i++) {
    const spark = document.createElement('i');
    spark.className = 'shot-spark';spark.textContent = correct && i % 2 === 0 ? '✦' : '•';
    const angle = i / count * Math.PI * 2;
    spark.style.cssText = `--spark-x:${Math.cos(angle) * radius}px;--spark-y:${Math.sin(angle) * radius}px;--spark-turn:${i * 45}deg`;
    effect.append(spark);
  }
  const targetClass = correct ? 'shot-hit' : 'shot-miss';
  button.classList.add(targetClass);stage.classList.add('shot-fired');stage.append(effect);
  const cleanup = () => {
    clearTimeout(timer);effect.remove();button.classList.remove(targetClass);stage.classList.remove('shot-fired');
    if (effects.get(stage) === cleanup) effects.delete(stage);
  };
  const timer = setTimeout(cleanup, 1100);
  effects.set(stage, cleanup);
}
