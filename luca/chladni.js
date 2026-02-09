let particles, sliders, m, n, lo, ho, s, gs, autoOct, autoVelocity;
let rect;
let generativeArea = [];
let firstTime = true;

let savedParticles = {};

// vibration strength params
let A = 0.02;
let minWalk = 0.001;
let canvasWidth = 695;
let canvasHeight = 695;
let line_suddivision = 85;
let height_suddivision = 50;

const a = -2, b = -2;

//Notes overlay
let canvasOverlay = document.getElementById("canvas-overlay");
let ctxOverlay = canvasOverlay.getContext("2d");

//Octaves
let loKnob = document.getElementById("loKnob");
let hoKnob = document.getElementById("hoKnob");
let bracket = document.getElementById("bracket");
let value_top = document.getElementById("value-top");
let value_bottom = document.getElementById("value-bottom");

//Chladni plate
const settings = {
  nParticles : 5000,
  canvasSize : [canvasWidth, canvasHeight],
  drawNotemap : true
}

//Density function
let cell_density = new Array(line_suddivision * height_suddivision).fill(0);

const pi = 3.1415926535;

// chladni 2D closed-form solution - returns between -1 and 1 (a * sin(pi * n * x) * sin(pi * m * y) + b * sin(pi * m * x) * sin(pi * n * y))
const chladni = (x, y, a, b, m, n) => 
  a * sin(pi * n * x) * sin(pi * m * y) + b * sin(pi * m * x) * sin(pi * n * y); 

function resizeToContainer() {
  const rect = canvasOverlay.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // overlay canvas for circles and notes
  canvasOverlay.width  = Math.round(rect.width  * dpr);
  canvasOverlay.height = Math.round(rect.height * dpr);
  ctxOverlay.setTransform(dpr, 0, 0, dpr, 0, 0);

  // refresh the size
  settings.canvasSize = [rect.width, rect.height];

  // p5 canvas background of Particle
  if (typeof resizeCanvas === "function") {
    resizeCanvas(rect.width, rect.height);
  }

  ctxOverlay.clearRect(0, 0, rect.width, rect.height);
}

/* Initialization */
const DOMinit = () => {
  //Notesmap canvas
  rect = canvasOverlay.getBoundingClientRect();

  const dpr = window.devicePixelRatio || 1;

  canvasOverlay.width  = Math.round(rect.width  * dpr);
  canvasOverlay.height = Math.round(rect.height * dpr);
  ctxOverlay.setTransform(dpr, 0, 0, dpr, 0, 0);

  settings.canvasSize  = [rect.width, rect.height];

  canvas = createCanvas(...settings.canvasSize);
  canvas.parent('sketch-container');

  // sliders
  sliders = {
    m : select('#mSlider'), // freq param 1
    n : select('#nSlider'), // freq param 2
    lo : select('#loSlider'), // freq param 3
    ho:  select('#hoSlider'), // freq param 4
    s: select('#sSlider'), // scanning freq. slider
    gs: select("#gsSlider"), // grain size
    v : select('#vSlider'), // velocity
    num : select('#numSlider'), // number
    ao: select('#autoOctave'),
    av: select('#autoVelocity')
  }
}

const setupParticles = () => {
  // particle array
  particles = [];
  for (let i = 0; i < settings.nParticles; i++) {
    particles[i] = new Particle();
  }
}

//Extract from database
const updateParticles = () => {
  let index = 0;

  for (const [key, value] of Object.entries(savedParticles)) {
    console.log(index);

    movingParticles[index].setXY(Number(key.split(',')[0]), Number(key.split(',')[1]));
    movingParticles[index].setSound(value);
    index++;
  }
}

const saveParticleState = () => {
  savedParticles = {};
  for (let i = 0; i < movingParticles.length; i++) 
    savedParticles[`${movingParticles[i].x},${movingParticles[i].y}`] = movingParticles[i].sound;
}

/* Particle dynamics */

class Particle {

  constructor() {
    this.x = random(0,1);
    this.y = random(1,0);
    this.stochasticAmplitude;
    this.sound = -1;
    
    this.updateOffsets();
  }

  setXY(nx, ny){
    this.x = nx;
    this.y = ny;
  }

  setSound(ns){
    this.sound = ns;
  }

  move() {
    // what is our chladni value i.e. how much are we vibrating? (between -1 and 1, zeroes are nodes)
    let eq = chladni(this.x, this.y, a, b, m, n);

    // set the amplitude of the move -> proportional to the vibration
    this.stochasticAmplitude = v * abs(eq);

    if (this.stochasticAmplitude <= minWalk && random() >= 0.6) this.stochasticAmplitude = minWalk;

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
    let c = SOUND_COLORS[this.sound] ?? "#FFFFFF";
    fill(c);
    stroke(c);
    circle(this.xOff, this.yOff, 3);
  }
}

const notesPlayed = [];

let cell = [];
const drawNotes = () => {
  ctxOverlay.clearRect(0,0,settings.canvasSize[0],settings.canvasSize[1]);

  if(settings.drawNotemap){
    const cell_width = settings.canvasSize[0]/line_suddivision;
    const line_height = settings.canvasSize[1]/height_suddivision;

    ctxOverlay.beginPath();
    ctxOverlay.strokeStyle = "orange";
    cell = cell_density;
    for(let i = 0; i < notesPlayed.length; i++){
      let maxDensityArea = cell.indexOf(Math.max(...cell));
      let area_x = (maxDensityArea % line_suddivision) * cell_width;
      let area_y = Math.floor(maxDensityArea / line_suddivision) * line_height;
      generativeArea[i] = generativeArea[i] ?? new GenerativeArea(area_x, area_y); //If it's already existing I don't create a new one
      if(autoOct) generativeArea[i].setCord(area_x,area_y) //Se to true if you want automatic changing octaves

      ctxOverlay.arc(generativeArea[i].x + cell_width/2, generativeArea[i].y + line_height/2, generativeArea[i].range, 0, 2 * pi);
      
      ctxOverlay.font = "20px arial"
      generativeArea[i].chroma = notesPlayed[i];
      ctxOverlay.strokeText(generativeArea[i].chroma, (generativeArea[i].x + cell_width/2) - 20, (generativeArea[i].y + line_height/2) - 20);

      cell.splice(maxDensityArea,1,0);
    }

    ctxOverlay.stroke();
  }
}

const getDensityFunction = async () => {
  cell_density = new Array(line_suddivision * height_suddivision).fill(0);
  let activeParticles = particles.slice(0,N);

  const cell_width = settings.canvasSize[0]/line_suddivision;
  const line_height = settings.canvasSize[1]/height_suddivision;

  for(let particle of activeParticles){
    if((particle.xOff >= 20 && particle.xOff <= settings.canvasSize[0]-20) && (particle.yOff >= 20 && particle.yOff <= settings.canvasSize[1]-20)){
      const cell_x = Math.floor(particle.xOff / cell_width);
      const cell_y = Math.floor(particle.yOff / line_height);

      const index = cell_y * line_suddivision + cell_x;
      if(index <= cell_density.length - 1) cell_density[index]++;
    }
  }

  //drawDensityFunction();
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

const checkGenerationCondition = (particle) => {
  for(let area of generativeArea){
    let timeRested = Date.now() - area.lastGenerationTime;
    if(area.contains(particle.xOff, particle.yOff) && timeRested >= s){
      area.play_grain(gs, semitonDistance(area.chroma), particle.sound);
      area.lastGenerationTime = Date.now();
    }
  }
}

let movingParticles = [];
const moveParticles = () => {
  movingParticles = particles.slice(0, N);

  let counter = 0;
  // particle movement
  for(let particle of movingParticles) {
    particle.move();
    if(counter % 2 == 0) 
      checkGenerationCondition(particle);
    particle.show();
    counter++;
  }
}

const updateParams = (key) => {
  m = sliders.m.value() !== n ? sliders.m.value() : m ;
  n = sliders.n.value() !== m ? sliders.n.value() : n ;
  lo = sliders.lo.value();
  ho = sliders.ho.value();
  v = sliders.v.value();
  s = sliders.s.value();
  gs = sliders.gs.value();
  N = sliders.num.value();
  autoOct = sliders.ao.checked();
  autoVelocity = autoOct ? sliders.av.value() : 4; //If autoOct is disabled, max reactivity
  settings.drawNotemap = true;
  
  if(key === "m" || key === "n" || key === "lo" || key === "ho") resetSimulation();
}

const initSliders = () => {
  updateParams();
  Object.entries(sliders).forEach(([key, slider]) => {
    slider.changed(() => updateParams(key));
  });

  //Questa cosa un po' ridondante!
  sliders.lo.input(() => {
    value_bottom.innerHTML = sliders.lo.value();
  }); 
  sliders.ho.input(() => {
    value_top.innerHTML = sliders.ho.value();
  }); 
}

const resetSimulation = () => {
  v = sliders.v.value();
  let movingParticles = particles.slice(0, N);

  for(let particle of movingParticles){
    particle.x += random(-0.1,0.1);
    particle.y += random(-0.1,0.1);
  }
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
  initSliders();
}

window.addEventListener("resize", resizeToContainer);

let frame_counter = 0;
let stabilized = false;
// run each frame
function draw() {
  wipeScreen();
  moveParticles();
  if(frame_counter % 10 == 0) getDensityFunction();
  if(frame_counter % (42 - (10 * autoVelocity)) == 0) drawNotes();

  //Decrease velocity
  if(v > 0.05){
    v -= 0.005;
    stabilized = false;
  }
  else if(v <= 0.05 && !stabilized){
    generativeArea = [];
    stabilized = true;
  }

  frame_counter++;
}


function deleteGenerativeArea(note){
  for(let area of generativeArea){
    if(area.chroma === note){
      let index = generativeArea.indexOf(area);
      generativeArea.splice(index,1);
    }
  }
}


let hideTimer;
loKnob.addEventListener("mousedown", () => {
  bracket.classList.add("visible");   // mostra

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    bracket.classList.remove("visible"); 
  }, 2000); 
});

hoKnob.addEventListener("mousedown", () => {
  bracket.classList.add("visible");   // mostra

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    bracket.classList.remove("visible"); 
  }, 2000); 
});