type Keys = {
  [key: string]: boolean;
};

const canvas = document.getElementById("i") as HTMLCanvasElement;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

const keys = {};
setupKeys(canvas, keys);

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
    this.camera = new Camera(x, y, canvas.width, canvas.height);
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, 15, 15, 0, 0, Math.PI * 2);
    ctx.fill();
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
    this.y += this.yVel;

    this.camera.track(this.x, this.y);
    this.camera.update();
  }
};

const player = new Player(30, 30);

const FPS = 60;
const FRAME_TIME = 1000 / FPS;
function animationLoop(then: number) {
  const now = performance.now();
  const elapsed = now - then;
  if(elapsed > FRAME_TIME) {
    then = now - (elapsed % FRAME_TIME);
    // Execute game code here
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(player.camera.x | 0, player.camera.y | 0);
    player.render(ctx);
    player.update();
    ctx.restore();
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