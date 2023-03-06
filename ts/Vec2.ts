import vMath from '../ts/vMath';

export default class Vec2 {

  x: number;
  y: number;

  constructor(x?: number | Vec2, y?: number) {
    if(x instanceof Vec2) {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x === undefined ? 0 : x;
      this.y = y === undefined ? 0 : y;
    }
  }

  set length(length) {
    this.mult(length / this.length);
  }

  get length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set(x: number | Vec2, y?: number): Vec2 {
    if(x instanceof Vec2) {
      this.x = x.x;
      this.y = x.y;
    } else {
      this.x = x === undefined ? 0 : x;
      this.y = y === undefined ? 0 : y;
    }
    return this;
  }

  copy(): Vec2 {
    return new Vec2(this);
  }

  equals(v: Vec2) {
    return this.x - v.x === 0 && this.y - v.y === 0;
  }

  isUnits(): boolean {
    return vMath.isUnit(this.x) && vMath.isUnit(this.y);
  }

  add(v: Vec2, out: Vec2 = this): Vec2 {
    out.x = this.x + v.x;
    out.y = this.y + v.y;
    return out;
  }

  sub(v: Vec2, out: Vec2 = this): Vec2 {
    out.x = this.x - v.x;
    out.y = this.y - v.y;
    return out;
  }

  mult(f: number, out: Vec2 = this): Vec2 {
    out.x = this.x * f;
    out.y = this.y * f;
    return out;
  }

  div(f: number, out: Vec2 = this): Vec2 {
    out.x = this.x / f;
    out.y = this.y / f;
    return out;
  }

  dot(v: Vec2): number {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vec2): number {
    return this.x * v.y - this.y * v.x;
  }

  reflect(n: Vec2): Vec2 {
    let dot = this.dot(n);
    let magSqr = n.length ** 2;
    let reflection = n.mult(2 * dot / magSqr);
    return this.sub(reflection);
  }

  normalize(): Vec2 {
    let magnitude = Math.sqrt(this.x * this.x + this.y * this.y);
    if(magnitude !== 0) {
      this.x /= magnitude;
      this.y /= magnitude;
    }
    return this;
  }
};