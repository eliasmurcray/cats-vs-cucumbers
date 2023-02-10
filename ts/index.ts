type Keys = {
  [key: string]: boolean;
};

const canvas = document.getElementById("i") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const keys = {};
setupKeys(canvas, keys);

const blockSize = 30;
const levelMaps = [
  [
    "000011100",
    "000100100",
    "010001001"
  ]
];
let level = 0;
const levelObjs: [number, number, string][] = [];
function bufferObjs(levelNum: number) {
  const currentMap = levelMaps[levelNum];
  for(let i = 0; i < currentMap.length; i++)
    for(let j = 0; j < currentMap[i].length; j++)
      switch(currentMap[i][j]) {
        case "1":
          levelObjs.push([j * blockSize, i * blockSize, "wall"]);
      }
}

function drawObjs() {
  levelObjs.forEach(([x, y, type]) => {
    switch(type) {
      case "wall":
        ctx.fillStyle = "#000";
        ctx.fillRect(x, y, blockSize, blockSize);
    }
  });
}

bufferObjs(level);

class Camera {

  targetX: number;
  targetY: number;

  constructor(public x: number, public y: number, public viewportWidth: number, public viewportHeight: number, public trackingSpeed?: number) {
    this.targetX = 0;
    this.targetY = 0;
    this.trackingSpeed = this.trackingSpeed ?? 0.1;
  }

  static lerp(value1: number, value2: number, amount: number): number {
    return ((value2 - value1) * amount) + value1;
  }

  update() {
    this.x = Camera.lerp(this.x, (this.viewportWidth >> 1) - this.targetX, this.trackingSpeed);
    this.y = Camera.lerp(this.y, (this.viewportHeight >> 1) - this.targetY, this.trackingSpeed);
  }

  track(x: number, y: number) {
    this.targetX = x;
    this.targetY = y;
  }
};

type Square = {
  x: number;
  y: number;
};

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}
function constrain(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

class Player {

  xVel: number;
  yVel: number;
  walkSpeed: number;
  isJumping: boolean;
  camera: Camera;

  constructor(public x: number, public y: number) {
    this.x = x;
    this.y = y;
    this.xVel = 0;
    this.yVel = 0;
    this.walkSpeed = 2;
    this.isJumping = false;
    this.camera = new Camera(x, y, canvas.width, canvas.height, 0.05);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(this.x + blockSize / 2, this.y + blockSize / 2, 15, 15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  circleSquareCollide(square: Square, checkX: boolean) {
    const halfSize = blockSize / 2;
    let closestX = constrain(this.x, square.x - halfSize, square.x + halfSize);
    let closestY = constrain(this.y, square.y - halfSize, square.y + halfSize);

    if(dist(closestX, closestY, this.x, this.y) >= halfSize) return;
    const angle = Math.atan2(this.x - closestX, this.y - closestY);
    this.x = closestX + Math.sin(angle) * halfSize;
    this.y = closestY + Math.cos(angle) * halfSize;
  }

  update() {
    this.xVel = 0;
    this.yVel = 0;
    if(keys["arrowup"])
      this.yVel -= this.walkSpeed;
    if(keys["arrowdown"])
      this.yVel += this.walkSpeed;
    if(keys["arrowright"])
      this.xVel += this.walkSpeed
    if(keys["arrowleft"])
      this.xVel -= this.walkSpeed
    this.x += this.xVel;
    levelObjs.forEach(([x, y, type]) => {
      switch(type) {
        case "wall":
          this.circleSquareCollide({ x, y }, true);
      }
    });

    this.y += this.yVel;
    levelObjs.forEach(([x, y, type]) => {
      switch(type) {
        case "wall":
          this.circleSquareCollide({ x, y }, false);
      }
    });

    this.camera.track(this.x, this.y);
    this.camera.update();
  }
};

let scene = game;
function game() {
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(player.camera.x | 0, player.camera.y | 0);
  player.render(ctx);
  player.update();
  drawObjs();
  ctx.restore();
}

const player = new Player(30, 30);

const FPS = 60;
const FRAME_TIME = 1000 / FPS;
function animationLoop(then: number) {
  const now = performance.now();
  const elapsed = now - then;
  if(elapsed > FRAME_TIME) {
    then = now - (elapsed % FRAME_TIME);
    // Execute game code here
    scene();
  }
  requestAnimationFrame(() => animationLoop(then));
}

animationLoop(performance.now());

function setupKeys(canvas: HTMLCanvasElement, keys: Keys) {
  canvas.tabIndex = -1;
  canvas.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
  }, false);
  canvas.addEventListener("keydown", (event) => {
    event.preventDefault();
    keys[event.key.toLowerCase()] = true;
  }, false);
}