// Global variables
let video;
let domeSlider;
let domeSize = 300;  // Dome radius
let gridSize = 10;   // Number of grid divisions for the dome surface

// View objects for the three dome views (top, left, right)
let topView, sideViewLeft, sideViewRight;
let currentView = null; // Keeps track of which view is being interacted with

function setup() {
  createCanvas(800, 600, WEBGL);
  
  // Setup live webcam capture
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Slider to adjust dome size (radius)
  domeSlider = createSlider(100, 600, 300, 1);
  domeSlider.position(10, 10);
  
  // Initialize view objects:
  topView = { pos: createVector(0, -200, 0), dragging: false, lastMouseX: 0, lastMouseY: 0 };
  
  sideViewLeft = {
    pos: createVector(-300, 0, 0), 
    rotX: 0, // Pitch
    rotY: 0, // Yaw
    rotZ: 0, // Roll
    dragging: false, lastMouseX: 0, lastMouseY: 0
  };

  sideViewRight = {
    pos: createVector(300, 0, 0),   
    rotX: 0, rotY: 0, rotZ: 0,
    dragging: false, lastMouseX: 0, lastMouseY: 0
  };
}

function draw() {
  background(0);
  domeSize = domeSlider.value(); // Update dome radius from slider
  
  // --- Top (Front) View: Fixed orientation ---
  push();
    translate(topView.pos.x, topView.pos.y, topView.pos.z);
    drawDomeWithScreen(domeSize, gridSize);
  pop();
  
  // --- Left Side View: Full Rotation ---
  push();
    translate(sideViewLeft.pos.x, sideViewLeft.pos.y, sideViewLeft.pos.z);
    rotateX(sideViewLeft.rotX);
    rotateY(sideViewLeft.rotY);
    rotateZ(sideViewLeft.rotZ);
    drawDomeWithScreen(domeSize, gridSize);
  pop();
  
  // --- Right Side View: Full Rotation ---
  push();
    translate(sideViewRight.pos.x, sideViewRight.pos.y, sideViewRight.pos.z);
    rotateX(sideViewRight.rotX);
    rotateY(sideViewRight.rotY);
    rotateZ(sideViewRight.rotZ);
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

/* --- Mouse Interaction --- */
function mousePressed() {
  if (mouseX > 250 && mouseX < 550 && mouseY > 0 && mouseY < 200) {
    currentView = 'top';
    topView.dragging = true;
    topView.lastMouseX = mouseX;
    topView.lastMouseY = mouseY;
  }
  else if (mouseX > 0 && mouseX < 250 && mouseY > 150 && mouseY < 450) {
    currentView = 'left';
    sideViewLeft.dragging = true;
    sideViewLeft.lastMouseX = mouseX;
    sideViewLeft.lastMouseY = mouseY;
  }
  else if (mouseX > 550 && mouseX < 800 && mouseY > 150 && mouseY < 450) {
    currentView = 'right';
    sideViewRight.dragging = true;
    sideViewRight.lastMouseX = mouseX;
    sideViewRight.lastMouseY = mouseY;
  } else {
    currentView = null;
  }
}

function mouseDragged() {
  let dx = mouseX - (currentView === 'top' ? topView.lastMouseX : 
                     currentView === 'left' ? sideViewLeft.lastMouseX : 
                     sideViewRight.lastMouseX);
  
  let dy = mouseY - (currentView === 'top' ? topView.lastMouseY : 
                     currentView === 'left' ? sideViewLeft.lastMouseY : 
                     sideViewRight.lastMouseY);

  if (currentView === 'top' && topView.dragging) {
    topView.pos.x += dx;
    topView.pos.y += dy;
    topView.lastMouseX = mouseX;
    topView.lastMouseY = mouseY;
  }
  else if (currentView === 'left' && sideViewLeft.dragging) {
    sideViewLeft.rotY += dx * 0.01;  // Yaw (left-right)
    sideViewLeft.rotX += dy * 0.01;  // Pitch (up-down)
    sideViewLeft.rotZ += (dx + dy) * 0.005;  // Roll (tilt)
    sideViewLeft.lastMouseX = mouseX;
    sideViewLeft.lastMouseY = mouseY;
  }
  else if (currentView === 'right' && sideViewRight.dragging) {
    sideViewRight.rotY += dx * 0.01;
    sideViewRight.rotX += dy * 0.01;
    sideViewRight.rotZ += (dx + dy) * 0.005;
    sideViewRight.lastMouseX = mouseX;
    sideViewRight.lastMouseY = mouseY;
  }
}

function mouseReleased() {
  if (currentView === 'top') topView.dragging = false;
  else if (currentView === 'left') sideViewLeft.dragging = false;
  else if (currentView === 'right') sideViewRight.dragging = false;
  currentView = null;
}
