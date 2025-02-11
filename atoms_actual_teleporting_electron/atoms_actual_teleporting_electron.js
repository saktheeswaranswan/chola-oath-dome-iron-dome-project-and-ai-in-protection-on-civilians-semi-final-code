let speedSlider;
let extraSpeedSlider;
let glitchSlider;
let sCheckbox, pCheckbox, dCheckbox;
let selectedOrbital = "s";
let video;
let nucleusParticles = [];

function setup() {
  createCanvas(1280, 720, WEBGL);
  
  // Setup live webcam background
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();
  
  // UI: Base Speed slider (affects the basic electron speed)
  speedSlider = createSlider(1, 50, 10);
  speedSlider.position(20, 20);
  
  // UI: Extra Speed slider (multiplies the base speed)
  extraSpeedSlider = createSlider(1, 10, 1, 0.1);
  extraSpeedSlider.position(20, 140);
  
  // UI: Glitch Intensity slider (controls the webcam glitch effect)
  glitchSlider = createSlider(0, 100, 0);
  glitchSlider.position(20, 260);
  
  // UI: Checkboxes for orbital selection (only one active at a time)
  sCheckbox = createCheckbox("S-Orbital", true);
  sCheckbox.position(20, 50);
  sCheckbox.changed(() => updateOrbital("s"));
  
  pCheckbox = createCheckbox("P-Orbital", false);
  pCheckbox.position(20, 80);
  pCheckbox.changed(() => updateOrbital("p"));
  
  dCheckbox = createCheckbox("D-Orbital", false);
  dCheckbox.position(20, 110);
  dCheckbox.changed(() => updateOrbital("d"));
  
  // Setup nucleus particles: a red proton and a white neutron
  nucleusParticles.push(new NucleusParticle(createVector(-5, 0, 0), "proton"));
  nucleusParticles.push(new NucleusParticle(createVector(5, 0, 0), "neutron"));
}

function draw() {
  background(0);
  
  // Get glitch intensity from slider
  let glitchIntensity = glitchSlider.value();
  
  // Draw the webcam video as background
  push();
    translate(-width/2, -height/2, -500);
    texture(video);
    plane(width, height);
  pop();
  
  // Apply a glitch effect if intensity is set (draw extra copies with offsets)
  if (glitchIntensity > 0) {
    for (let i = 0; i < 3; i++) {
      push();
        let xOffset = random(-glitchIntensity, glitchIntensity);
        let yOffset = random(-glitchIntensity, glitchIntensity);
        translate(-width/2 + xOffset, -height/2 + yOffset, -500);
        tint(255, random(50, 150)); // semi-transparent glitch copy
        texture(video);
        plane(width, height);
      pop();
    }
  }
  
  // Enable 3D rotation with mouse
  orbitControl();
  
  // Draw nucleus particles (proton and neutron)
  for (let np of nucleusParticles) {
    np.show();
  }
  
  // Compute the time parameter t using both speed sliders
  let baseSpeed = speedSlider.value();
  let extraSpeed = extraSpeedSlider.value();
  let t = millis() * 0.001 * baseSpeed * extraSpeed;
  
  // Calculate the electron's position based on the selected orbital
  let electronPos;
  if (selectedOrbital === "s") {
    electronPos = sOrbital(t);
  } else if (selectedOrbital === "p") {
    electronPos = pOrbital(t);
  } else if (selectedOrbital === "d") {
    electronPos = dOrbital(t);
  }
  
  // Draw the electron as a blue sphere
  push();
    fill(0, 0, 255);
    noStroke();
    translate(electronPos.x, electronPos.y, electronPos.z);
    sphere(5);
  pop();
  
  // Display UI labels (resetting matrix to keep text fixed on screen)
  push();
    resetMatrix();
    fill(255);
    textSize(14);
    text("Base Speed", 160, 35);
    text("Extra Speed", 160, 155);
    text("Glitch Intensity", 160, 275);
  pop();
}

// --- Parametric Equations for Each Orbital ---

// S-Orbital: Covers a sphere of radius 50.
function sOrbital(t) {
  let r = 50;
  // Using sine and cosine functions to cover the spherical surface.
  let theta = 2 * PI * (0.5 + 0.5 * sin(t));
  let phi   = PI * (0.5 + 0.5 * cos(0.7 * t));
  let x = r * sin(phi) * cos(theta);
  let y = r * sin(phi) * sin(theta);
  let z = r * cos(phi);
  return createVector(x, y, z);
}

// P-Orbital: Approximates a dumbbell shape (upper and lower lobes).
function pOrbital(t) {
  let r = 80;
  let period = 5; // period length in seconds
  let phase = (t % period) / period;
  let phi;
  if (phase < 0.5) {
    // Upper lobe: phi moves from 0 to PI/4.
    phi = map(phase, 0, 0.5, 0, PI/4);
  } else {
    // Lower lobe: phi moves from 3PI/4 to PI.
    phi = map(phase, 0.5, 1, 3*PI/4, PI);
  }
  let theta = t * 2;
  let x = r * sin(phi) * cos(theta);
  let y = r * sin(phi) * sin(theta);
  let z = r * cos(phi);
  return createVector(x, y, z);
}

// D-Orbital: Approximates a cloverleaf (four-lobed) pattern.
function dOrbital(t) {
  let R = 100;
  let theta = t;
  // Using a four-leaf rose pattern in the x-y plane with a slight z oscillation.
  let r = R * abs(cos(2 * theta));
  let x = r * cos(theta);
  let y = r * sin(theta);
  let z = R * 0.2 * sin(4 * theta);
  return createVector(x, y, z);
}

// --- Utility: Update Orbital Selection ---
function updateOrbital(type) {
  selectedOrbital = type;
  sCheckbox.checked(type === "s");
  pCheckbox.checked(type === "p");
  dCheckbox.checked(type === "d");
}

// --- Nucleus Particle Class ---
class NucleusParticle {
  constructor(pos, type) {
    this.pos = pos;
    this.type = type; // "proton" or "neutron"
    this.size = 10;
  }
  
  show() {
    push();
      translate(this.pos.x, this.pos.y, this.pos.z);
      noStroke();
      if (this.type === "proton") {
        fill(255, 0, 0);  // Red for proton
      } else if (this.type === "neutron") {
        fill(255);       // White for neutron
      }
      sphere(this.size);
    pop();
  }
}

function windowResized() {
  resizeCanvas(1280, 720);
}
