export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** smoothstep entre a e b */
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Interpola um vetor de números. Retorna a função de cancelamento.
 * No servidor (sem rAF) entrega o estado final imediatamente.
 */
export function tween(
  from: number[],
  to: number[],
  ms: number,
  onFrame: (v: number[]) => void,
  ease: (t: number) => number = easeOut,
): () => void {
  if (typeof requestAnimationFrame === 'undefined' || prefersReducedMotion() || ms <= 0) {
    onFrame(to);
    return () => {};
  }
  const start = performance.now();
  let id = 0;
  const step = (now: number) => {
    const t = clamp((now - start) / ms);
    const e = ease(t);
    onFrame(to.map((v, i) => lerp(from[i] ?? v, v, e)));
    if (t < 1) id = requestAnimationFrame(step);
  };
  id = requestAnimationFrame(step);
  return () => cancelAnimationFrame(id);
}

export interface Spring {
  easing: string;
  duration: number;
}

const springCache = new Map<string, Spring>();

/**
 * Mola amortecida convertida em `linear()` do CSS — assim o WAAPI usa física
 * real sem biblioteca. Cai para uma curva cúbica onde `linear()` não existe.
 */
export function spring(stiffness = 220, damping = 22): Spring {
  const key = `${stiffness}/${damping}`;
  const hit = springCache.get(key);
  if (hit) return hit;

  const supported =
    typeof CSS !== 'undefined' && CSS.supports?.('animation-timing-function', 'linear(0, 1)');
  let result: Spring = { easing: 'cubic-bezier(.22,1,.36,1)', duration: 520 };

  if (supported) {
    const dt = 1 / 240;
    let x = 0;
    let v = 0;
    let t = 0;
    const samples: number[] = [0];
    let settledFor = 0;
    while (t < 2 && settledFor < 0.08) {
      v += (-stiffness * (x - 1) - damping * v) * dt;
      x += v * dt;
      t += dt;
      if (Math.round(t / dt) % 4 === 0) samples.push(+x.toFixed(4));
      settledFor = Math.abs(x - 1) < 0.0015 && Math.abs(v) < 0.01 ? settledFor + dt : 0;
    }
    samples.push(1);
    result = { easing: `linear(${samples.join(',')})`, duration: Math.round(t * 1000) };
  }
  springCache.set(key, result);
  return result;
}
