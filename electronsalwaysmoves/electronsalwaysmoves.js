let ions = [];
let electrons = [];
let driftSlider;

function setup() {
  createCanvas(1280, 720);
  
  // Create a grid of ions (fixed lattice sites)
  let spacing = 120;
  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      ions.push(new Ion(x, y));
    }
  }
  
  // Create many electrons that will wander freely (delocalized)
  for (let i = 0; i < 60; i++) {
    electrons.push(new Electron(random(width), random(height)));
  }
  
  // Drift speed slider (controls net drift, simulating an applied electric field)
  driftSlider = createSlider(0, 5, 1, 0.1);
  driftSlider.position(20, 20);
}

function draw() {
  background(30);
  
  // Draw the ions (red circles, representing fixed positive lattice sites)
  for (let ion of ions) {
    ion.show();
  }
  
  // Get the drift speed value
  let driftSpeed = driftSlider.value();
  
  // Update and draw electrons (blue circles) that roam freely
  for (let electron of electrons) {
    electron.update(driftSpeed);
    electron.show();
  }
  
  // Display explanation text
  push();
    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    text("Even with current (drift) or without, delocalized electrons are not absorbed by individual atoms—they remain free throughout the lattice.", width / 2, height - 30);
  pop();
}

// ----- Ion Class -----
// Represents a fixed positive ion in the lattice.
class Ion {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.size = 30;
  }
  
  show() {
    push();
      noStroke();
      fill(220, 70, 70); // Red color for ions
      ellipse(this.pos.x, this.pos.y, this.size);
    pop();
  }
}

// ----- Electron Class -----
// Represents a conduction electron whose wavefunction is delocalized.
class Electron {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(1);
  }
  
  update(driftSpeed) {
    // Drift component: simulating the effect of an applied electric field
    let drift = createVector(driftSpeed, 0);
    // Random scattering component simulates quantum uncertainty/collisions
    let randomScatter = p5.Vector.random2D().mult(0.5);
    // The electron’s velocity is the sum of drift and random scattering
    this.vel = p5.Vector.add(drift, randomScatter);
    // Update position
    this.pos.add(this.vel);
    
    // Wrap around the canvas edges to mimic an infinite periodic lattice
    if (this.pos.x > width)  this.pos.x = 0;
    if (this.pos.x < 0)      this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0)      this.pos.y = height;
  }
  
  show() {
    push();
      noStroke();
      fill(50, 50, 255); // Blue color for electrons
      ellipse(this.pos.x, this.pos.y, 10);
    pop();
  }
}
