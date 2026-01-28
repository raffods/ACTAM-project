var notyf = new Notyf();

const input = document.getElementById('audio_sample');
const samplelib = document.getElementById('sample-lib');
let samples = [];
let selectedSample = -1;

let audioCtx = new AudioContext();
let arrayBuffer = [];
let audioBuffer = [];

input.addEventListener('change', async () => {
  let i = 0;
  audioBuffer = [];
  arrayBuffer = [];

  if(input.files.length > 12) {
    notyf.error('Maximun numer of file exceeded [' + input.files.length + '/12]');
    return;
  }

  samplelib.innerHTML = "";
  samples = [];
  for (const file of input.files) {
    const buffer = await file.arrayBuffer();
    arrayBuffer[i] = buffer;
    audioBuffer[i] = await audioCtx.decodeAudioData(buffer);

    const audioItem = document.createElement("div");
    audioItem.className = "sample-file";

    const img = document.createElement("img");
    img.className = "sample-image";
    img.setAttribute("src","images/sample/" + i + ".png");

    const audioLabel = document.createElement("span");
    audioLabel.innerHTML = file.name;
    audioLabel.className = "file-label";

    audioItem.appendChild(img);
    audioItem.appendChild(audioLabel);
    samplelib.appendChild(audioItem);
    samples[i] = audioItem;

    i++;
  }

  samples.forEach(item => {
    item.addEventListener('click', () => {
      selectedSample = samples.indexOf(item);
      selectSample(selectedSample);
      console.log(selectedSample);
    });
  });
});

function selectSample(index){
  for(let i = 0; i < samples.length; i++){
    if(i == index) 
      samples[i].classList.add("selected");
    else 
      samples[i].classList.remove("selected");  
  }
}

function drawVerticalWaveform(buffer) {
  const data = buffer.getChannelData(0);
  const { width, height } = canvas;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = "white";
  ctx.lineWidth = 1;

  const samplesPerPixel = Math.floor(data.length / width);

  for (let x = 0; x < width; x++) {
    let min = 1.0;
    let max = -1.0;
    const start = x * samplesPerPixel;

    for (let i = 0; i < samplesPerPixel; i++) {
      const sample = data[start + i];
      if (sample < min) min = sample;
      if (sample > max) max = sample;
    }

    const y1 = (1 - max) * 0.5 * height;
    const y2 = (1 - min) * 0.5 * height;

    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();
  }
}
