let video;
let domeSlider, gridSlider;
let domeSize = 300;
let gridSize = 10;

// View objects for the three dome views (top, left, right)
let topView, sideViewLeft, sideViewRight;
let currentView = null;
let topRotation = 0;
let sideRotationXLeft = 0; // Left dome rotation X-axis
let sideRotationYLeft = 0; // Left dome rotation Y-axis
let sideRotationXRight = 0; // Right dome rotation X-axis
let sideRotationYRight = 0; // Right dome rotation Y-axis

// New global variables for trajectory control and export
let trajectorySlider, toggleTrajectoryButton;
let exportButton, exportDiv;
let globalExtensionFactor = 1.2; // initial extension factor
let arcHeight = 50; // used for the fountain arc's parabolic offset

function setup() {
  createCanvas(800, 600, WEBGL);
  
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  domeSlider = createSlider(100, 600, 300, 1);
  domeSlider.position(10, 10);
  
  gridSlider = createSlider(5, 40, 10, 1);
  gridSlider.position(10, 40);
  
  topView = { pos: createVector(0, -200, 0), dragging: false };
  sideViewLeft = { pos: createVector(-300, 0, 0), dragging: false };
  sideViewRight = { pos: createVector(300, 0, 0), dragging: false };
  
  // Create a button in the camera view area to toggle the trajectory slider
  toggleTrajectoryButton = createButton("Adjust Trajectory");
  // Positioning the button near the bottom (adjust coordinates as desired)
  toggleTrajectoryButton.position(10, height - 60);
  toggleTrajectoryButton.mousePressed(toggleTrajectorySlider);
  
  // Create the slider to adjust the extension factor (total trajectory length)
  trajectorySlider = createSlider(1.0, 2.0, 1.2, 0.01);
  trajectorySlider.position(150, height - 60);
  trajectorySlider.style("width", "200px");
  trajectorySlider.hide(); // hidden until button is pressed
  
  // Create a button to export the parabola
  exportButton = createButton("Export Parabola");
  exportButton.position(10, height - 30);
  exportButton.mousePressed(exportParabola);
  
  // Create a div to display exported polynomial text
  exportDiv = createDiv("");
  exportDiv.position(10, height - 100);
  exportDiv.style("color", "white");
}

function draw() {
  background(0);
  domeSize = domeSlider.value();
  gridSize = gridSlider.value();
  
  // Update the global extension factor if the slider is visible
  if (trajectorySlider.elt.style.display !== "none") {
    globalExtensionFactor = trajectorySlider.value();
  }
  
  // Top view dome
  push();
  translate(topView.pos.x, topView.pos.y, topView.pos.z);
  rotateY(topRotation);
  drawDomeWithScreen(domeSize, gridSize);
  pop();
  
  // Left side view dome
  push();
  translate(sideViewLeft.pos.x, sideViewLeft.pos.y, sideViewLeft.pos.z);
  rotateX(sideRotationXLeft);
  rotateY(sideRotationYLeft);
  drawDomeWithScreen(domeSize, gridSize);
  pop();
  
  // Right side view dome
  push();
  translate(sideViewRight.pos.x, sideViewRight.pos.y, sideViewRight.pos.z);
  rotateX(sideRotationXRight);
  rotateY(sideRotationYRight);
  drawDomeWithScreen(domeSize, gridSize);
  pop();
  
  drawBottomCameraView();
}

function drawDomeWithScreen(radius, grid) {
  // Draw the video-textured plane behind the dome
  let side = sqrt(2) * radius;
  push();
  translate(0, 0, -0.1);
  texture(video);
  noStroke();
  plane(side, side);
  pop();
  
  // Draw the dome patches and fountain arcs
  drawDome(radius, grid);
}

function drawDome(radius, grid) {
  stroke(255);
  fill(0, 150, 255, 50);
  
  for (let i = 0; i < grid; i++) {
    for (let j = 0; j < grid; j++) {
      // Map grid indices to spherical angles (only half-sphere for dome)
      let theta1 = map(i, 0, grid, 0, HALF_PI);
      let theta2 = map(i + 1, 0, grid, 0, HALF_PI);
      let phi1 = map(j, 0, grid, 0, TWO_PI);
      let phi2 = map(j + 1, 0, grid, 0, TWO_PI);
      
      // Compute vertices for the current patch
      let p1 = spherePoint(radius, theta1, phi1);
      let p2 = spherePoint(radius, theta1, phi2);
      let p3 = spherePoint(radius, theta2, phi1);
      let p4 = spherePoint(radius, theta2, phi2);
      
      // Draw the patch (quadrilateral)
      beginShape();
      vertex(p1.x, p1.y, p1.z);
      vertex(p2.x, p2.y, p2.z);
      vertex(p4.x, p4.y, p4.z);
      vertex(p3.x, p3.y, p3.z);
      endShape(CLOSE);
      
      // Calculate the center of this patch
      let center = createVector(
        (p1.x + p2.x + p3.x + p4.x) / 4,
        (p1.y + p2.y + p3.y + p4.y) / 4,
        (p1.z + p2.z + p3.z + p4.z) / 4
      );
      
      // Draw a small red dot at the patch center
      push();
      translate(center.x, center.y, center.z);
      noStroke();
      fill(255, 0, 0);
      sphere(2);
      pop();
      
      // Draw the fountain arc from the dome's center to (and beyond) the patch center
      drawFountainArc(center);
    }
  }
}

// This function draws a parabolic fountain arc from the origin toward a patch center,
// then extending beyond it. The arc is split into two segments:
// - The inner segment (from the origin to the dome surface) is drawn in blinking laser red.
// - The outer segment (from the dome surface outward) is drawn in bright green.
function drawFountainArc(patchCenter) {
  // Compute the extended endpoint by applying the global extension factor.
  let extensionFactor = globalExtensionFactor;
  let extendedEndpoint = p5.Vector.mult(patchCenter, extensionFactor);
  
  // Determine the t value at which the arc meets the dome surface.
  let tSurface = 1 / extensionFactor;
  
  let steps = 20;
  
  // First segment: from t = 0 to t = tSurface (inside the dome)
  // Blinking laser red segment (blink on for half the frames)
  if (frameCount % 30 < 15) {
    stroke(255, 0, 0);
    noFill();
    beginShape();
    for (let i = 0; i <= steps; i++) {
      let t = i / steps;
      if (t > tSurface) break;
      let P = p5.Vector.lerp(createVector(0, 0, 0), extendedEndpoint, t);
      // Add a parabolic offset in z; 4*t*(1-t) peaks at t=0.5
      P.z += arcHeight * 4 * t * (1 - t);
      vertex(P.x, P.y, P.z);
    }
    endShape();
  }
  
  // Second segment: from t = tSurface to t = 1 (outside the dome)
  stroke(0, 255, 0);
  noFill();
  beginShape();
  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    if (t < tSurface) continue;
    let P = p5.Vector.lerp(createVector(0, 0, 0), extendedEndpoint, t);
    P.z += arcHeight * 4 * t * (1 - t);
    vertex(P.x, P.y, P.z);
  }
  endShape();
}

function drawBottomCameraView() {
  // Draw the camera feed as a textured plane
  push();
  translate(0, height / 2 - 100, 0);
  texture(video);
  noStroke();
  plane(200, 200);
  pop();
  
  // Overlay a 20x20 grid on top of the camera feed
  push();
  translate(0, height / 2 - 100, 1);
  noFill();
  stroke(255, 255, 0);
  let gridCount = 20;
  let planeSize = 200;
  let step = planeSize / gridCount;
  
  // Draw vertical grid lines
  for (let i = 0; i <= gridCount; i++) {
    let x = -planeSize / 2 + i * step;
    line(x, -planeSize / 2, 0, x, planeSize / 2, 0);
  }
  
  // Draw horizontal grid lines
  for (let j = 0; j <= gridCount; j++) {
    let y = -planeSize / 2 + j * step;
    line(-planeSize / 2, y, 0, planeSize / 2, y, 0);
  }
  pop();
}

// Converts spherical coordinates to Cartesian coordinates.
function spherePoint(r, theta, phi) {
  let x = r * sin(theta) * cos(phi);
  let y = r * sin(theta) * sin(phi);
  let z = r * cos(theta);
  return createVector(x, y, z);
}

function mousePressed() {
  if (mouseX < width / 2) {
    currentView = 'left';
  } else {
    currentView = 'right';
  }
}

function mouseDragged() {
  let dx = movedX * 0.01;
  let dy = movedY * 0.01;
  
  if (currentView === 'left') {
    sideRotationXLeft += dy;
    sideRotationYLeft += dx;
  } else if (currentView === 'right') {
    sideRotationXRight += dy;
    sideRotationYRight += dx;
  }
}

// Toggle the trajectory slider's visibility.
function toggleTrajectorySlider() {
  if (trajectorySlider.elt.style.display === "none") {
    trajectorySlider.show();
  } else {
    trajectorySlider.hide();
  }
}

// Export a representative fountain arc as polynomial functions x(t), y(t), z(t)
// for the dome patch located near the center of the grid.
function exportParabola() {
  // Use the dome's current settings.
  let ds = domeSlider.value();
  let gs = gridSlider.value();
  // Choose the patch in the center of the grid.
  let i = floor(gs / 2);
  let j = floor(gs / 2);
  // Use the patch center as the midpoint of the cell.
  let theta = map(i + 0.5, 0, gs, 0, HALF_PI);
  let phi = map(j + 0.5, 0, gs, 0, TWO_PI);
  let patchCenter = spherePoint(ds, theta, phi);
  let extendedEndpoint = p5.Vector.mult(patchCenter, globalExtensionFactor);
  
  // For our fountain arc, the interpolation is linear plus a parabolic offset in z.
  // Thus:
  // x(t) = extendedEndpoint.x * t
  // y(t) = extendedEndpoint.y * t
  // z(t) = extendedEndpoint.z * t + arcHeight * 4 * t * (1 - t)
  // Which can be written as:
  // z(t) = (extendedEndpoint.z + 4 * arcHeight) * t - 4 * arcHeight * t^2
  let x_poly = `x(t) = ${nf(extendedEndpoint.x, 1, 2)} * t`;
  let y_poly = `y(t) = ${nf(extendedEndpoint.y, 1, 2)} * t`;
  let z_poly = `z(t) = (${nf(extendedEndpoint.z + 4 * arcHeight, 1, 2)}) * t - ${nf(4 * arcHeight, 1, 2)} * t^2`;
  
  let exportText = x_poly + "<br>" + y_poly + "<br>" + z_poly;
  exportDiv.html(exportText);
}
