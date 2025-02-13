let stressData = [];
let minStress, maxStress;
let slider;
let downloadButton;
let video;
let boundary = [];
let elements = [];

function setup() {
  createCanvas(800, 600);
  video = createCapture(VIDEO);
  video.size(800, 600);
  video.hide();

  slider = createSlider(1, 1000, 1000, 1);
  slider.position(10, height + 10);
  
  downloadButton = createButton('Download CSV');
  downloadButton.position(10, height + 40);
  downloadButton.mousePressed(downloadCSV);
  
  generateClosedCurve(); // Generate parameterized closed curve
  generateElementsInside(); // Generate elements inside the boundary
  stressData = generateRandomStressData(elements.length);
  
  minStress = min(stressData.map(row => row.stress));
  maxStress = max(stressData.map(row => row.stress));
}

function draw() {
  image(video, 0, 0, width, height);
  let n = slider.value();
  
  noFill();
  stroke(0);
  beginShape();
  for (let p of boundary) {
    vertex(p.x, p.y);
  }
  endShape(CLOSE);
  
  for (let i = 0; i < min(n, elements.length); i++) {
    let e = elements[i];
    let stress = stressData[i].stress;
    let col = stressToColor(stress);
    fill(col);
    stroke(0);
    rect(e.x, e.y, e.w, e.h);
    
    stressData[i].color = col.toString();
  }
}

function stressToColor(stress) {
  let t = map(stress, minStress, maxStress, 0, 1);
  return lerpColor(color(0, 0, 255), color(255, 0, 0), t);
}

function generateRandomStressData(num) {
  let data = [];
  for (let i = 0; i < num; i++) {
    data.push({ stress: random(0, 100), color: '' });
  }
  return data;
}

function downloadCSV() {
  let csvContent = 'Element,X,Y,Width,Height,Stress,Color\n' + 
    stressData.map((row, index) => `${index},${elements[index].x},${elements[index].y},${elements[index].w},${elements[index].h},${row.stress},${row.color}`).join('\n');
  let blob = new Blob([csvContent], { type: 'text/csv' });
  let a = createA(URL.createObjectURL(blob), 'stress_data.csv');
  a.attribute('download', 'stress_data.csv');
  a.elt.click();
}

function generateClosedCurve() {
  boundary = [];
  for (let t = 0; t < TWO_PI; t += 0.1) {
    let x = width / 2 + 200 * cos(t) + 50 * cos(3 * t);
    let y = height / 2 + 150 * sin(t) + 30 * sin(5 * t);
    boundary.push({ x, y });
  }
}

function generateElementsInside() {
  elements = [];
  let stepX = 40, stepY = 40;
  for (let x = 50; x < width - 50; x += stepX) {
    for (let y = 50; y < height - 50; y += stepY) {
      if (pointInPolygon({ x: x + stepX / 2, y: y + stepY / 2 }, boundary)) {
        elements.push({ x, y, w: stepX, h: stepY });
      }
    }
  }
}

function pointInPolygon(point, poly) {
  let x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    let xi = poly[i].x, yi = poly[i].y;
    let xj = poly[j].x, yj = poly[j].y;
    let intersect = ((yi > y) !== (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}
