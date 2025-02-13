let stressData = [];
let minStress, maxStress;
let slider;
let downloadButton;

function preload() {
  stressData = loadTable('stress_data.csv', 'csv', 'header');
}

function setup() {
  createCanvas(800, 600);
  slider = createSlider(1, stressData.getRowCount(), stressData.getRowCount(), 1);
  slider.position(10, height + 10);
  
  downloadButton = createButton('Download CSV');
  downloadButton.position(10, height + 40);
  downloadButton.mousePressed(downloadCSV);
  
  minStress = min(stressData.getColumn('Stress'));
  maxStress = max(stressData.getColumn('Stress'));
}

function draw() {
  background(255);
  let n = slider.value();
  let w = width / sqrt(n);
  let h = height / sqrt(n);

  for (let i = 0; i < n; i++) {
    let x = (i % sqrt(n)) * w;
    let y = floor(i / sqrt(n)) * h;
    let stress = float(stressData.getString(i, 'Stress'));
    let col = stressToColor(stress);
    fill(col);
    rect(x, y, w, h);
  }
}

function stressToColor(stress) {
  let t = map(stress, minStress, maxStress, 0, 1);
  return color(lerpColor(color(0, 0, 255), color(255, 0, 0), t));
}

function downloadCSV() {
  saveTable(stressData, 'stress_data.csv');
}
