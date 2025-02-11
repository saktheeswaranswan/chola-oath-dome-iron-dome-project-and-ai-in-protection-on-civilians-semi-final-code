let ions = [];
let electrons = [];
let driftSlider;

function setup() {
  createCanvas(1280, 720);
  
  // Create a grid of ions (fixed positive lattice sites)
  let spacing = 100;
  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      ions.push(new Ion(x, y));
    }
  }
  
  // Create many electrons (delocalized carriers)
  for (let i = 0; i < 100; i++) {
    electrons.push(new Electron(random(width), random(height)));
  }
  
  // Drift speed slider (controls net drift in the electron motion)
  driftSlider = createSlider(0, 5, 1, 0.1);
  driftSlider.position(20, 20);
}

function draw() {
  background(30);
  
  // Draw UI text for the slider
  push();
    fill(255);
    textSize(16);
    text("Drift Speed", driftSlider.x * 1.0 + driftSlider.width + 10, 35);
  pop();
  
  // Draw the ions (fixed lattice)
  for (let ion of ions) {
    ion.show();
  }
  
  // Get the current drift speed from the slider
  let driftSpeed = driftSlider.value();
  
  // Update and draw each electron
  for (let electron of electrons) {
    electron.update(driftSpeed);
    electron.show();
  }
  
  // Optional overlay text explaining the concept
  push();
    fill(255);
    textSize(16);
    text("In a metal, conduction electrons are delocalized and flow through the entire lattice.", 20, height - 20);
  pop();
}

// ----- Ion Class -----
// Represents a fixed positive ion in the metallic lattice.
class Ion {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.size = 20;
  }
  
  show() {
    push();
      noStroke();
      fill(255, 100, 100); // Reddish tone for positive ions
      ellipse(this.pos.x, this.pos.y, this.size);
    pop();
  }
}

// ----- Electron Class -----
// Represents a conduction electron moving throughout the lattice.
class Electron {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
  }
  
  update(driftSpeed) {
    // Drift component to the right (simulate an applied electric field)
    let drift = createVector(driftSpeed, 0);
    // Random scattering (to mimic collisions and quantum uncertainty)
    let randomScatter = p5.Vector.random2D().mult(0.5);
    // The new velocity is the sum of the drift and random components.
    this.vel = p5.Vector.add(drift, randomScatter);
    // Update position
    this.pos.add(this.vel);
    
    // Wrap around the canvas edges to mimic a periodic (delocalized) system.
    if (this.pos.x > width)  this.pos.x = 0;
    if (this.pos.x < 0)      this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0)      this.pos.y = height;
  }
  
  show() {
    push();
      noStroke();
      fill(0, 0, 255); // Blue for electrons
      ellipse(this.pos.x, this.pos.y, 8);
    pop();
  }
}
