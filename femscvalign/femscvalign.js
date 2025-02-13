let stressData = [];
let minStress, maxStress;
let slider;
let downloadButton;

function preload() {
  stressData = generateRandomStressData(1000);
}

function setup() {
  createCanvas(800, 600);
  slider = createSlider(1, 1000, 1000, 1);
  slider.position(10, height + 10);
  
  downloadButton = createButton('Download CSV');
  downloadButton.position(10, height + 40);
  downloadButton.mousePressed(downloadCSV);
  
  minStress = min(stressData.map(row => row.stress));
  maxStress = max(stressData.map(row => row.stress));
}

function draw() {
  background(255);
  let n = slider.value();
  let cols = floor(sqrt(n));
  let rows = ceil(n / cols);
  let w = width / cols;
  let h = height / rows;

  for (let i = 0; i < n; i++) {
    let x = (i % cols) * w;
    let y = floor(i / cols) * h;
    let stress = stressData[i].stress;
    let col = stressToColor(stress);
    fill(col);
    rect(x, y, w, h);
    
    stressData[i].x = x;
    stressData[i].y = y;
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
    data.push({ stress: random(0, 100), x: 0, y: 0, color: '' });
  }
  return data;
}

function downloadCSV() {
  let csvContent = 'Element,X,Y,Stress,Color\n' + 
    stressData.map((row, index) => `${index},${row.x},${row.y},${row.stress},${row.color}`).join('\n');
  let blob = new Blob([csvContent], { type: 'text/csv' });
  let a = createA(URL.createObjectURL(blob), 'stress_data.csv');
  a.attribute('download', 'stress_data.csv');
  a.elt.click();
}
