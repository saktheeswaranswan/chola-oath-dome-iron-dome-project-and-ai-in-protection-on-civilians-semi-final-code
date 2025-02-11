// Global variables
let video;
let domeSlider, gridSlider;
let domeSize = 300;  // Dome radius
let gridSize = 10;   // Number of grid divisions for the dome surface

// View objects for the three dome views (top, left, right)
let topView, sideViewLeft, sideViewRight;
let currentView = null; // Keeps track of which view is being interacted with
let topRotation = 0; // Controls top dome rotation

function setup() {
  createCanvas(800, 600, WEBGL);
  
  // Setup live webcam capture
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Slider to adjust dome size
  domeSlider = createSlider(100, 600, 300, 1);
  domeSlider.position(10, 10);
  
  // Slider to adjust grid resolution of the dome
  gridSlider = createSlider(5, 40, 10, 1);
  gridSlider.position(10, 40);
  
  // Initialize views
  topView = { pos: createVector(0, -200, 0), dragging: false, lastMouseX: 0, lastMouseY: 0 };
  
  // Left-side dome (Rotates arbitrarily)
  sideViewLeft = { pos: createVector(-300, 0, 0), rotX: 0, rotY: 0, dragging: false, lastMouseX: 0, lastMouseY: 0 };

  // Right-side dome (Rotates arbitrarily)
  sideViewRight = { pos: createVector(300, 0, 0), rotX: 0, rotY: 0, dragging: false, lastMouseX: 0, lastMouseY: 0 };
}

function draw() {
  background(0);
  domeSize = domeSlider.value();
  gridSize = gridSlider.value();
  
  // --- Top View (Free movement) ---
  push();
    translate(topView.pos.x, topView.pos.y, topView.pos.z);
    rotateY(topRotation);  // Allows full rotation in a 2D plane
    drawDomeWithScreen(domeSize, gridSize);
  pop();
  
  // --- Left Side View (Now Rotatable in Any Direction) ---
  push();
    translate(sideViewLeft.pos.x, sideViewLeft.pos.y, sideViewLeft.pos.z);
    rotateX(sideViewLeft.rotX);
    rotateY(sideViewLeft.rotY);
    drawDomeWithScreen(domeSize, gridSize);
  pop();
  
  // --- Right Side View (Now Rotatable in Any Direction) ---
  push();
    translate(sideViewRight.pos.x, sideViewRight.pos.y, sideViewRight.pos.z);
    rotateX(sideViewRight.rotX);
    rotateY(sideViewRight.rotY);
    drawDomeWithScreen(domeSize, gridSize);
  pop();
}

function drawDomeWithScreen(radius, grid) {
  let side = sqrt(2) * radius;
  push();
    translate(0, 0, -0.1);
    texture(video);
    noStroke();
    plane(side, side);
  pop();
  
  drawDome(radius, grid);
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
      
      // Center point of each square patch
      let centerX = (p1.x + p2.x + p3.x + p4.x) / 4;
      let centerY = (p1.y + p2.y + p3.y + p4.y) / 4;
      let centerZ = (p1.z + p2.z + p3.z + p4.z) / 4;

      // Draw red center point
      stroke(255, 0, 0);
      strokeWeight(3);
      point(centerX, centerY, centerZ);

      // Draw yellow rays from center to each patch center
      stroke(255, 255, 0);
      strokeWeight(1);
      line(0, 0, 0, centerX, centerY, centerZ);
    }
  }
  
  // Draw the central reference point
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

/* --- Mouse Interaction --- */
function mousePressed() {
  let mouse3D = createVector(mouseX - width / 2, mouseY - height / 2, 0);
  
  if (mouse3D.mag() < domeSize / 2) {  // Clicks only inside the top dome
    currentView = 'top';
    topView.dragging = true;
    topView.lastMouseX = mouseX;
    topView.lastMouseY = mouseY;
  }
  else if (mouseX < width / 2) {  // Clicks inside the left dome
    currentView = 'left';
    sideViewLeft.dragging = true;
    sideViewLeft.lastMouseX = mouseX;
    sideViewLeft.lastMouseY = mouseY;
  }
  else {  // Clicks inside the right dome
    currentView = 'right';
    sideViewRight.dragging = true;
    sideViewRight.lastMouseX = mouseX;
    sideViewRight.lastMouseY = mouseY;
  }
}

function mouseDragged() {
  let dx = mouseX - (currentView === 'top' ? topView.lastMouseX : currentView === 'left' ? sideViewLeft.lastMouseX : sideViewRight.lastMouseX);
  let dy = mouseY - (currentView === 'top' ? topView.lastMouseY : currentView === 'left' ? sideViewLeft.lastMouseY : sideViewRight.lastMouseY);

  if (currentView === 'top' && topView.dragging) {
    topView.pos.x += dx;
    topView.pos.y += dy;
    topRotation += dx * 0.01;
  }
  else if (currentView === 'left' && sideViewLeft.dragging) {
    sideViewLeft.rotX += dy * 0.01;
    sideViewLeft.rotY += dx * 0.01;
  }
  else if (currentView === 'right' && sideViewRight.dragging) {
    sideViewRight.rotX += dy * 0.01;
    sideViewRight.rotY += dx * 0.01;
  }

  topView.lastMouseX = mouseX;
  topView.lastMouseY = mouseY;
}

function mouseReleased() {
  currentView = null;
}
