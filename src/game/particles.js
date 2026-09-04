/** Частицы и всплывающие подписи — только визуал, на логику не влияют. */

export class Effects {
  constructor() {
    this.parts = [];
    this.floats = [];
    this.fades = [];
    this.shake = 0;
  }

  clear() {
    this.parts.length = 0;
    this.floats.length = 0;
    this.fades.length = 0;
    this.shake = 0;
  }

  burst(x, y, color, count = 6, power = 1) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (40 + Math.random() * 130) * power;
      this.parts.push({
        x, y, color,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60 * power,
        life: 0.45 + Math.random() * 0.4,
        age: 0,
        size: 2 + Math.random() * 3.5,
      });
    }
  }

  /** Исчезающий блок на месте очищенной клетки. */
  fade(x, y, size, color, delay = 0) {
    this.fades.push({ x, y, size, color, age: -delay, life: 0.34 });
  }

  float(x, y, text, color = '#ffffff', scale = 1) {
    this.floats.push({ x, y, text, color, age: 0, life: 1.0, scale });
  }

  kick(power = 1) {
    this.shake = Math.min(10, this.shake + power * 5);
  }

  update(dt) {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.age += dt;
      if (p.age >= p.life) { this.parts.splice(i, 1); continue; }
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (let i = this.fades.length - 1; i >= 0; i--) {
      const f = this.fades[i];
      f.age += dt;
      if (f.age >= f.life) this.fades.splice(i, 1);
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i];
      f.age += dt;
      if (f.age >= f.life) this.floats.splice(i, 1);
    }
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 40);
  }

  get busy() {
    return this.parts.length + this.fades.length + this.floats.length > 0;
  }
}
