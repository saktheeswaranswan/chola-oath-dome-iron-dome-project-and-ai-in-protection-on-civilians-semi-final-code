let ions = [];
let electrons = [];

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
}

function draw() {
  background(30);
  
  // Draw the ions (red circles, representing fixed positive lattice sites)
  for (let ion of ions) {
    ion.show();
  }
  
  // Update and draw the electrons (blue circles)
  for (let electron of electrons) {
    electron.update();
    electron.show();
  }
  
  // Display explanation text
  push();
    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    text("Delocalized electrons aren’t bound to any one atom—they roam freely through the lattice.", width / 2, height - 30);
  pop();
}

// ----- Ion Class -----
// Each Ion represents a positive lattice site (an atom that has “lost” its valence electron).
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
// Each Electron represents a conduction electron whose wavefunction is spread out (delocalized)
// They move freely, not attached to any single ion.
class Electron {
  constructor(x, y) {
    this.pos = createVector(x, y);
    // Start with a small random velocity
    this.vel = p5.Vector.random2D().mult(1);
  }
  
  update() {
    // To simulate quantum uncertainty and scattering, add a small random vector each frame.
    let randomStep = p5.Vector.random2D().mult(0.5);
    this.vel.add(randomStep);
    // Limit maximum speed so electrons don’t zoom off too fast.
    this.vel.limit(3);
    this.pos.add(this.vel);
    
    // Wrap around the canvas (mimics an infinite, periodic lattice)
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }
  
  show() {
    push();
      noStroke();
      fill(50, 50, 255); // Blue color for electrons
      ellipse(this.pos.x, this.pos.y, 10);
    pop();
  }
}
