var notyf = new Notyf();

const input = document.getElementById('audio_sample');
const samplelib = document.getElementById('sample-lib');
let samples = [];
let selectedSample = -1;

let audioCtx = new AudioContext();
let arrayBuffer = [];
let audioBuffer = [];

async function loadSampleFromUrl(audioCtx, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch failed: ${res.status} ${url}`);
  const ab = await res.arrayBuffer();
  return await audioCtx.decodeAudioData(ab);
}

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
