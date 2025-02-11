let ions = [];
let electrons = [];
let driftSlider, modeButton;
let fieldOn = false;

function setup() {
  createCanvas(1280, 720);
  
  // Create a grid of ions (fixed positive lattice sites)
  let spacing = 120;
  for (let x = spacing / 2; x < width; x += spacing) {
    for (let y = spacing / 2; y < height; y += spacing) {
      ions.push(new Ion(x, y));
    }
  }
  
  // Create many electrons (delocalized carriers)
  for (let i = 0; i < 60; i++) {
    electrons.push(new Electron(random(width), random(height)));
  }
  
  // Slider to control drift speed (simulating an applied electric field)
  driftSlider = createSlider(0, 5, 0, 0.1);
  driftSlider.position(20, 20);
  
  // Button to toggle field on/off
  modeButton = createButton("Toggle Field Mode");
  modeButton.position(20, 60);
  modeButton.mousePressed(() => fieldOn = !fieldOn);
}

function draw() {
  background(30);
  
  // Draw ions (red circles representing the metal lattice)
  for (let ion of ions) {
    ion.show();
  }
  
  // Determine the drift speed: if the field is off, drift is zero.
  let driftSpeed = fieldOn ? driftSlider.value() : 0;
  
  // Update and draw electrons (blue circles)
  for (let electron of electrons) {
    electron.update(driftSpeed);
    electron.show();
  }
  
  // Overlay explanatory text
  push();
    fill(255);
    textSize(18);
    textAlign(CENTER, CENTER);
    let modeText = fieldOn ? "Field ON: Electrons gain net drift (current flows)" 
                           : "Field OFF: Electrons move randomly with no net drift";
    text(modeText, width/2, height - 30);
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
      fill(220, 70, 70); // Red for ions
      ellipse(this.pos.x, this.pos.y, this.size);
    pop();
  }
}

// ----- Electron Class -----
// Represents a conduction electron that is delocalized.
class Electron {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(1);
  }
  
  update(driftSpeed) {
    // Drift component: simulating acceleration by an applied electric field.
    let drift = createVector(driftSpeed, 0);
    // Random scattering simulates thermal motion and collisions.
    let randomScatter = p5.Vector.random2D().mult(0.5);
    this.vel = p5.Vector.add(drift, randomScatter);
    this.vel.limit(3);
    this.pos.add(this.vel);
    
    // Wrap around edges to mimic an infinite lattice.
    if (this.pos.x > width)  this.pos.x = 0;
    if (this.pos.x < 0)      this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0)      this.pos.y = height;
  }
  
  show() {
    push();
      noStroke();
      fill(50, 50, 255); // Blue for electrons
      ellipse(this.pos.x, this.pos.y, 10);
    pop();
  }
}
