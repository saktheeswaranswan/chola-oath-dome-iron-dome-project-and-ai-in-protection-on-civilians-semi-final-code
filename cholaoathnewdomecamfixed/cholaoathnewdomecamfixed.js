// Global variables
let video;
let domeSlider;
let domeSize = 300;
let domePos;
let missiles = [];
let counterMissiles = [];
let rocketStructures = [];
let lockButton, releaseButton;
let domeLocked = false;
let lockedDomePos = null;
let cameraAngle = 0;
let lockXYButton, lockYZButton, lockXZButton;
let lockedPlane = null;

function setup() {
  createCanvas(800, 600, WEBGL);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  domeSlider = createSlider(100, 600, 300, 1);
  domeSlider.position(10, 10);
  
  lockButton = createButton('Lock Dome');
  lockButton.position(10, 40);
  lockButton.mousePressed(lockDome);
  
  releaseButton = createButton('Release Dome');
  releaseButton.position(100, 40);
  releaseButton.mousePressed(releaseDome);
  
  lockXYButton = createButton('Lock XY Plane');
  lockXYButton.position(10, 70);
  lockXYButton.mousePressed(() => lockCamera("XY"));
  
  lockYZButton = createButton('Lock YZ Plane');
  lockYZButton.position(100, 70);
  lockYZButton.mousePressed(() => lockCamera("YZ"));
  
  lockXZButton = createButton('Lock XZ Plane');
  lockXZButton.position(200, 70);
  lockXZButton.mousePressed(() => lockCamera("XZ"));
  
  domePos = createVector(0, 0, 0);
}

function draw() {
  background(0);
  domeSize = domeSlider.value();
  
  if (!domeLocked) {
    let t = frameCount * 0.005;
    domePos.x = sin(t) * 200;
    domePos.y = cos(t) * 200;
    domePos.z = 0;
  } else if (lockedDomePos !== null) {
    domePos = lockedDomePos.copy();
  }
  
  if (lockedPlane === "XY") {
    rotateX(HALF_PI);
  } else if (lockedPlane === "YZ") {
    rotateY(HALF_PI);
  } else if (lockedPlane === "XZ") {
    rotateZ(HALF_PI);
  }
  
  push();
  translate(domePos.x, domePos.y, domePos.z - 5);
  texture(video);
  plane(2 * domeSize, 2 * domeSize);
  pop();
  
  push();
  translate(domePos.x, domePos.y, domePos.z);
  fill(0, 150, 255, 50);
  stroke(0, 150, 255, 150);
  strokeWeight(2);
  sphere(domeSize);
  pop();
}

function lockDome() {
  domeLocked = true;
  lockedDomePos = domePos.copy();
}

function releaseDome() {
  domeLocked = false;
}

function lockCamera(plane) {
  lockedPlane = plane;
}
