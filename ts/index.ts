import Vec2 from '../ts/Vec2';
import vMath from '../ts/vMath';
import Line2 from '../ts/Line2';

class Ball {
  constructor(public position: Vec2, public delta: Vec2, public radius: number) {}

  render(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, vMath.TAU);
    ctx.fill();
    ctx.closePath();
  }

  update(polygons: PolygonCollider[]) {
    this.position.add(this.delta);
    let point = new Vec2();
    for(let i = 0, l = polygons.length; i < l; i++) {
      let polygon = polygons[i];
      let result = polygon.findBallIntercept(this, point);
      if(result === undefined) continue;
      this.position.set(point);
      if(result.geometry instanceof Line2) {
        let n = result.geometry.normalVector;
        ball.delta.reflect(n);
      } else if(result.geometry instanceof Vec2) {
        let collisionVector = ball.position.sub(result.geometry).normalize();
        let velocityDot = ball.delta.dot(collisionVector);
        ball.delta.sub(collisionVector.mult(2 * velocityDot));
      }
      break;
    }
  }
};

class PolygonCollider {
  points: Vec2[];
  lines: Line2[];
  targetRadius: number;

  constructor(points: any[]) {
    this.points = [];
    for(let i = 0, l = points.length; i < l; i++) {
      if(points[i].x === undefined || points[i].y === undefined) {
        throw new Error('Polygon input points must have both "x" and "y" properties.');
      }
      if(!(points[i] instanceof Vec2)) {
        throw new Error('Polygon input points must be an instance of "Vec2".');
      }
    }
    this.points = points;
    this.lines = [];
  }

  set ballRadius(radius: number) {
    this.targetRadius = radius;
    for(let i = 0, l = this.points.length; i < l; i++) {
      let line = this.lines[i];
      if (line) { 
        line.set(this.points[i], this.points[(i + 1) % l])
      } else {
        line = new Line2(new Vec2(this.points[i]), new Vec2(this.points[(i + 1) % l]));
      }
      this.lines[i] = line.translateNormal(radius);
    }
  }

  render(ctx: CanvasRenderingContext2D): void {
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for(let i = 1, l = this.points.length; i < l; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.closePath();
    ctx.fill();
  }

  findBallIntercept(ball: Ball, out: Vec2 = new Vec2) {
    if(this.targetRadius !== ball.radius) {
      this.ballRadius = ball.radius;
    }

    let nearest: number = Infinity;
    let nearestPoint: Vec2 | Line2 | undefined = undefined;
    let units: Vec2 = new Vec2();
    let ballTrajectory: Line2 = new Line2(ball.position, ball.position.add(ball.delta, new Vec2));
    let outputGeometry: Vec2 | Line2 | undefined = undefined;

    this.points.forEach((point) => {
      const result = ballTrajectory.interceptsCircle(point, ball.radius, units);
      if(result !== undefined && units.x < nearest && vMath.isUnit(units.x)) {
        nearest = units.x;
        nearestPoint = ballTrajectory;
        outputGeometry = point;
      }
    });

    this.lines.forEach((line) => {
      const result = line.interceptsLine(ballTrajectory, units);
      if(result !== undefined && units.x < nearest && units.isUnits()) {
        nearest = units.x;
        nearestPoint = ballTrajectory;
        outputGeometry = line;
      }
    });

    if(nearestPoint) {
      return {
        point: ballTrajectory.unitDistOn(nearest, out),
        geometry: outputGeometry
      }
    }
    return;
  }

  drawBallLines(ctx: CanvasRenderingContext2D) {
    if (this.lines.length) {
      const r = this.targetRadius;
      ctx.beginPath();
      for (const l of this.lines) { 
        ctx.moveTo(l.p1.x, l.p1.y);
        ctx.lineTo(l.p2.x, l.p2.y);
      }
      for (const p of this.points) { 
        ctx.moveTo(p.x + r, p.y);
        ctx.arc(p.x, p.y, r, 0, vMath.TAU);
      }
      ctx.stroke()
    }
    }
};

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const width = canvas.width = window.innerWidth;
const height = canvas.height = window.innerHeight;

let ball = new Ball(new Vec2(248, 82), new Vec2(-1, 2), 10);
let polygon = new PolygonCollider([
  new Vec2(400, 336),
  new Vec2(200, 246),
  new Vec2(57, 125),
  new Vec2(159, 56)
]);

polygon.ballRadius = ball.radius;

function draw() {
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ff8888';
  ball.render(ctx);
  ctx.fillStyle = '#333';
  polygon.render(ctx);
  ctx.fillStyle = '#0000';
  ball.update([ polygon ]);
  let { x, y } = ball.position;
  let { x: xVel, y: yVel } = ball.delta;
  let { radius } = ball;
  if(x + xVel > width - radius || x + xVel < radius) {
    ball.delta.x = -xVel;
  }
  if(y + yVel > height - radius || y + yVel < radius) {
    ball.delta.y = -yVel;
  }
  requestAnimationFrame(draw);
}

for(let i = requestAnimationFrame(()=>{}); i--;) cancelAnimationFrame(i);
draw();