import Vec2 from '../ts/Vec2';
import vMath from './vMath';

const wV1 = new Vec2();
const wV2 = new Vec2();
const wV3 = new Vec2();

export default class Line2 {
  p1: Vec2;
  p2: Vec2;

  constructor(p1: Vec2 | Line2, p2?: Vec2) {
    if(this.p1 instanceof Line2) {
      p1 = p1 as Line2;
      this.p1 = p1.p1;
      this.p2 = p1.p2;
    } else {
      p1 = p1 as Vec2;
      this.p1 = p1;
      this.p2 = p2;
    }
  }

  set(p1: Vec2 | Line2, p2?: Vec2) {
    if(this.p1 instanceof Line2) {
      p1 = p1 as Line2;
      this.p1 = p1.p1;
      this.p2 = p1.p2;
    } else {
      p1 = p1 as Vec2;
      this.p1 = p1;
      this.p2 = p2;
    }
  }

  copy(): Line2 {
    return new Line2(this);
  }

  asVec(out: Vec2 = new Vec2()) {
    return this.p2.sub(this.p1, out);
  }

  unitDistOn(u: number, out: Vec2 = new Vec2()): Vec2 {
    return this.p2.sub(this.p1, out).mult(u).add(this.p1);
  }

  translate(v: Vec2, out: Line2 = this): Line2 {
    this.p1.add(v, out.p1);
    this.p2.add(v, out.p2);
    return out;
  }

  translateNormal(n: number, out: Line2 = this): Line2 {
    let v = this.asVec(wV1);
    let y = v.x;
    v.x = -v.y;
    v.y = y;
    v.length = -n;
    this.translate(wV1, out);
    return out;
  }

  interceptsLine(line: Line2, out: Vec2 = new Vec2): Vec2 | undefined {
    this.asVec(wV1);
    line.asVec(wV2);
    let c = wV1.cross(wV2);
    if(vMath.isSmall(c)) {
      return;
    }
    wV3.set(this.p1).sub(line.p1);
    out.set(wV1.cross(wV3) / c, wV2.cross(wV3) / c);
    return out;
  }

  interceptsCircle(point: Vec2, radius: number, out: Vec2) {
    this.asVec(wV1);
    let b = -2 * this.p1.sub(point, wV2).dot(wV1);
    let wV1l = (wV1.x * wV1.x + wV1.y * wV1.y);
    let wV2l = (wV2.x * wV2.x + wV2.y * wV2.y);
    let c = 2 * wV1l;
    let d = (b * b - 2 * c * (wV2l - radius * radius)) ** 0.5;
    if(isNaN(d)) {
      return;
    }
    return out.set((b - d) / c, (b + d) / c);
  }

  get normalVector(): Vec2 {
    const vector = this.p2.sub(this.p1);
    const { length } = vector;
    return new Vec2(-vector.y / length, vector.x / length);
  }
};