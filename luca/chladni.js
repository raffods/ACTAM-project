let particles, sliders, m, n, a, b;

// vibration strength params
let A = 0.02;
let minWalk = 0.001;
const canvasWidth = 1000;
const canvasHeight = 1000;
let line_suddivision = 85;
let height_suddivision = 50;

const settings = {
  nParticles : 50000,
  canvasSize : [canvasWidth, canvasHeight],
  drawNotemap : false
}

//Notesmap canvas
let canvasOverlay = document.getElementById("canvas-overlay");
canvasOverlay.width = canvasWidth;
canvasOverlay.height = canvasHeight;
let ctxOverlay = canvasOverlay.getContext("2d");

//Density function
let cell_density = new Array(line_suddivision * height_suddivision).fill(0);
let densityCanvas = document.getElementById("density-graph");
densityCanvas.width = 200;
densityCanvas.height = 50;
let ctxGraph = densityCanvas.getContext("2d");

const pi = 3.1415926535;

// chladni 2D closed-form solution - returns between -1 and 1 (a * sin(pi * n * x) * sin(pi * m * y) + b * sin(pi * m * x) * sin(pi * n * y))
const chladni = (x, y, a, b, m, n) => 
  a * sin(pi * n * x) * sin(pi * m * y) + b * sin(pi * m * x) * sin(pi * n * y); 

/* Initialization */
const DOMinit = () => {
  let canvas = createCanvas(...settings.canvasSize);
  canvas.parent('sketch-container');


  // sliders
  sliders = {
    m : select('#mSlider'), // freq param 1
    n : select('#nSlider'), // freq param 2
    a : select('#aSlider'), // freq param 3
    b:  select('#bSlider'), // freq param 4
    v : select('#vSlider'), // velocity
    num : select('#numSlider'), // number
  }
}

const setupParticles = () => {
  // particle array
  particles = [];
  for (let i = 0; i < settings.nParticles; i++) {
    particles[i] = new Particle();
  }
}


/* Particle dynamics */

class Particle {

  constructor() {
    this.x = random(0,1);
    this.y = random(1,0);
    this.stochasticAmplitude;
    
    this.updateOffsets();
  }

  move() {
    // what is our chladni value i.e. how much are we vibrating? (between -1 and 1, zeroes are nodes)
    let eq = chladni(this.x, this.y, a, b, m, n);

    // set the amplitude of the move -> proportional to the vibration
    this.stochasticAmplitude = v * abs(eq);

    if (this.stochasticAmplitude <= minWalk && random() >= 0.5) this.stochasticAmplitude = minWalk;

    // perform one random walk
    this.x += random(-this.stochasticAmplitude, this.stochasticAmplitude);
    this.y += random(-this.stochasticAmplitude, this.stochasticAmplitude);
 
    this.updateOffsets();
  }

  updateOffsets() {
    // handle edges
    if (this.x <= 0) this.x = 0;
    if (this.x >= 1) this.x = 1;
    if (this.y <= 0) this.y = 0;
    if (this.y >= 1) this.y = 1;

    // convert to screen space
    this.xOff = width * this.x; // (this.x + 1) / 2 * width;
    this.yOff = height * this.y; // (this.y + 1) / 2 * height;
  }

  show() {
    point(this.xOff, this.yOff)
  }
}

const notesPlayed = [
  "C",
  "E",
  "G",
  "B",
  "D",
  "F",
  "A"
];

let cell = [];
const drawNotes = () => {
  ctxOverlay.clearRect(0,0,canvasOverlay.width,canvasOverlay.height);
  if(settings.drawNotemap){
    // ctxOverlay.beginPath();
    const cell_width = canvasWidth/line_suddivision;
    const line_height = canvasHeight/height_suddivision;

    // for(let i = 0; i <= height_suddivision; i++){
    //     ctxOverlay.moveTo(0, i*line_height);
    //     ctxOverlay.lineTo(cell_width * line_suddivision, i*line_height);
    //   for(let j = 0; j <= line_suddivision; j++){
    //     ctxOverlay.moveTo(j*cell_width, i*line_height);
    //     ctxOverlay.lineTo(j*cell_width, -1 * (line_height));
    //   }
    // }

    // ctxOverlay.strokeStyle = "red";
    // ctxOverlay.stroke();

    ctxOverlay.beginPath();
    ctxOverlay.strokeStyle = "orange";
    cell = cell_density;
    for(let i = 0; i < 4; i++){
      let maxDensityArea = cell.indexOf(Math.max(...cell));
      let area_x = (maxDensityArea % line_suddivision) * cell_width;
      let area_y = Math.floor(maxDensityArea / line_suddivision) * line_height;

      ctxOverlay.arc(area_x + cell_width/2, area_y + line_height/2, 50, 0, 2 * pi);
      
      ctxOverlay.font = "40px arial"
      ctxOverlay.strokeText(notesPlayed[i], area_x - cell_width / 2, area_y + line_height);

      cell.splice(maxDensityArea,1,0);
    }

    ctxOverlay.stroke();
  }
}

const getDensityFunction = async () => {
  cell_density = new Array(line_suddivision * height_suddivision).fill(0);
  let activeParticles = particles.slice(0,N);

  const cell_width = canvasWidth/line_suddivision;
  const line_height = canvasHeight/height_suddivision;

  for(let particle of activeParticles){
    if((particle.xOff >= 20 && particle.xOff <= canvasWidth-20) && (particle.yOff >= 20 && particle.yOff <= canvasHeight-20)){
      const cell_x = Math.floor(particle.xOff / cell_width);
      const cell_y = Math.floor(particle.yOff / line_height);

      const index = cell_y * line_suddivision + cell_x;
      if(index <= cell_density.length - 1) cell_density[index]++;
    }
  }

  drawDensityFunction();
  console.log(cell_density);
}

const drawDensityFunction = () => {
    ctxGraph.clearRect(0, 0, densityCanvas.width, densityCanvas.height);
    ctxGraph.lineWidth = 1;
    ctxGraph.strokeStyle = "white";

    const maxVal = Math.max(...cell_density);
    if (maxVal === 0) return;

    const dx = densityCanvas.width / (cell_density.length - 1);

    ctxGraph.beginPath();

    for (let i = 0; i < cell_density.length; i++) {
        const x = i * dx;
        const y = densityCanvas.height - (cell_density[i] / maxVal) * densityCanvas.height;

        if (i === 0) ctxGraph.moveTo(x, y);
        else ctxGraph.lineTo(x, y);
    }

    ctxGraph.stroke();
}

const moveParticles = () => {
  let movingParticles = particles.slice(0, N);

  // particle movement
  for(let particle of movingParticles) {
    particle.move();
    particle.show();
  }
}

const updateParams = () => {
  m = sliders.m.value();
  n = sliders.n.value();
  a = sliders.a.value();
  b = sliders.b.value()
  v = sliders.v.value();
  N = sliders.num.value();
  settings.drawNotemap = document.getElementById("showNotes").checked;
  //grid_suddivision = document.getElementById("gridSubdivision").value;
}

const wipeScreen = () => {
  background(30);
  stroke(255);
}

// run at DOM load
function setup() {
  DOMinit();
  frameRate(30);
  setupParticles();
}

let frame_counter = 0;
// run each frame
function draw() {
  wipeScreen();
  updateParams();
  moveParticles();
  if(frame_counter % 10 == 0) getDensityFunction();
  if(frame_counter % 10 == 0) drawNotes();

  frame_counter++;
}

document.getElementById("showNotes").onchange = () =>{
  getDensityFunction();
}