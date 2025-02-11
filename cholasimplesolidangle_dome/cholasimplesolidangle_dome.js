// Global variables
let video;
let domeSlider;
let domeSize = 300;
let domePos;
let lockButton, releaseButton;
let domeLocked = false;
let lockedDomePos = null;
let domeSpeed = 2;
let gridSize = 10;

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
  
  domePos = createVector(-300, 0, 0);
}

function draw() {
  background(0);
  domeSize = domeSlider.value();
  
  if (!domeLocked) {
    domePos.x += domeSpeed;
    domePos.y += domeSpeed * 0.5;
    if (domePos.x > 300 || domePos.x < -300) {
      domeSpeed *= -1;
    }
  } else if (lockedDomePos !== null) {
    domePos = lockedDomePos.copy();
  }
  
  push();
  translate(domePos.x, domePos.y, domePos.z - 5);
  texture(video);
  plane(2 * domeSize, 2 * domeSize);
  pop();
  
  push();
  translate(domePos.x, domePos.y, domePos.z);
  drawDome(domeSize, gridSize);
  pop();
}

function lockDome() {
  domeLocked = true;
  lockedDomePos = domePos.copy();
}

function releaseDome() {
  domeLocked = false;
}

function drawDome(radius, grid) {
  stroke(255);
  strokeWeight(1);
  fill(0, 150, 255, 50);
  
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      let theta1 = map(i, 0, grid, 0, HALF_PI);
      let theta2 = map(i + 1, 0, grid, 0, HALF_PI);
      let phi1 = map(j, 0, grid, 0, TWO_PI);
      let phi2 = map(j + 1, 0, grid, 0, TWO_PI);
      
      let p1 = spherePoint(radius, theta1, phi1);
      let p2 = spherePoint(radius, theta1, phi2);
      let p3 = spherePoint(radius, theta2, phi1);
      let p4 = spherePoint(radius, theta2, phi2);
      
      beginShape();
      vertex(p1.x, p1.y, p1.z);
      vertex(p2.x, p2.y, p2.z);
      vertex(p4.x, p4.y, p4.z);
      vertex(p3.x, p3.y, p3.z);
      endShape(CLOSE);
      
      stroke(255, 0, 0);
      line(0, 0, 0, p1.x, p1.y, p1.z);
      line(0, 0, 0, p2.x, p2.y, p2.z);
      line(0, 0, 0, p3.x, p3.y, p3.z);
      line(0, 0, 0, p4.x, p4.y, p4.z);
    }
  }
  
  stroke(255, 0, 0);
  strokeWeight(5);
  point(0, 0, 0);
}

function spherePoint(r, theta, phi) {
  let x = r * sin(theta) * cos(phi);
  let y = r * sin(theta) * sin(phi);
  let z = r * cos(theta);
  return createVector(x, y, z);
}
