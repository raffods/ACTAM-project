const NUMBER_OF_BUFFERS = 100;
const GRAIN_SIZE = 0.5;
const MAX_VOICES = 128;

const area_range = 20;
const c = new AudioContext();
let buf;

//Pool of usefull nodes to avoid run-time
const POOL_SIZE = 200
let poolIndex = 0;
const pool = [];
for (let i = 0; i < POOL_SIZE; i++) {
  const g = c.createGain();
  const gHann = c.createGain();
  const pan = c.createStereoPanner();

  gHann.connect(g);
  g.connect(pan);
  pan.connect(c.destination);

  pool.push({ g, gHann, pan });
}

// Recording
const recordingBus = c.createGain();
recordingBus.connect(c.destination);

// Reverb
wetSlider = document.getElementById("wetSlider");
wetSlider.dispatchEvent(new Event("setValue")); // trigger any input listeners
wetSlider.dispatchEvent(new Event("change")); // trigger any input listeners
let wet = wetSlider.value;

let reverbNode = c.createConvolver();
let reverbGain = c.createGain();
let dryLevel = c.createGain();
reverbGain.gain.value = 0; // Wet level
dryLevel.gain.value = 1; // Dry level
reverbNode.connect(reverbGain);
reverbGain.connect(recordingBus);

const SAFE_GAIN = 0.8;
wetSlider.addEventListener("input", () => {
  wet = wetSlider.value;
  reverbGain.gain.value = Math.pow(wet * (1 - SAFE_GAIN), 2);
  dryLevel.gain.value = Math.pow((1 -  wet) * (1 - SAFE_GAIN), 2);
});

function generateImpulseResponse(duration, decay) {
  const sampleRate = c.sampleRate;
  const length = sampleRate * duration;
  const impulse = c.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const n = i / length;
    const vol = Math.pow(1 - n, decay);
    left[i] = (Math.random() * 2 - 1) * vol;
    right[i] = (Math.random() * 2 - 1) * vol;
  }

  return impulse;
}
reverbNode.buffer = generateImpulseResponse(2, 2);

class GenerativeArea{
    constructor(cord_x, cord_y, chr){
        this.x = cord_x;
        this.y = cord_y;
        this.range = area_range;
        this.chroma = chr;
        this.notesPlayed = 0;
        this.lastGenerationTime = Date.now();
    }

    setCord(cord_x, cord_y){
        this.x = cord_x;
        this.y = cord_y;
    }

    contains(ex, ey){
        const dx = ex - this.x;
        const dy = ey - this.y;
        return (dx * dx + dy * dy) <= this.range * this.range;
    }

    play_grain(duration, st, ps){
        if(ps == -1 || this.notesPlayed >= MAX_VOICES) return;

        let s = c.createBufferSource();
        let serviceNode = pool[poolIndex];

        serviceNode.gHann.gain.cancelScheduledValues(c.currentTime);
        serviceNode.pan.pan.cancelScheduledValues(c.currentTime);
        serviceNode.gHann.gain.setValueAtTime(1, c.currentTime);
        serviceNode.pan.pan.setValueAtTime(0, c.currentTime);

        poolIndex = (poolIndex + 1) % POOL_SIZE;

        s.buffer = audioBuffer[ps];

        let octave_range = ho - lo;
        let oct = ho - Math.round((this.y * octave_range) / settings.canvasSize[1]); 
        // let oct1 = ho - Math.round((this.y * octave_range) / 696);//696 = canvas size
        // console.log(oct,'oct');
        // console.log(oct1,'--------');

        s.playbackRate.value = Math.pow(2, (st + (12 * oct))/12);

        s.connect(serviceNode.g).connect(serviceNode.gHann).connect(serviceNode.pan).connect(dryLevel).connect(recordingBus);
        serviceNode.pan.connect(reverbNode); //Collegamento in parallello fino a recording bus

        let delay = Math.random() * 0.08;
        const now = c.currentTime + (delay > 0.03 ? delay : 0); //Piccolo delay casuale
        let durationDelta = (this.x) / 1000;
        const grainDuration = duration + durationDelta;
        const peakGain = 0.4 * Math.random();

        let panValue = (Math.random() * (audioWidth*2)) - audioWidth;
        serviceNode.pan.pan.setValueAtTime(panValue, now);

        applyAREnvelope(serviceNode.g.gain, now, grainDuration, peakGain);
        applyHannUnit(serviceNode.gHann.gain, now, grainDuration); //Hann window

        let offset = Math.random() * (!audioBuffer[ps] ? 0 : audioBuffer[ps].duration);
        offset = s.playbackRate.value <= 0.5 ? offset * 0.5 : offset;

        s.start(now, offset, grainDuration);
        this.notesPlayed++;

        s.onended = () => {this.notesPlayed--};
    }
}

function applyHannUnit(gainParam, t0, dur) {
  const mid = t0 + dur * 0.5;
  const tE  = t0 + dur;

  gainParam.cancelScheduledValues(t0);
  gainParam.setValueAtTime(0, t0);
  gainParam.linearRampToValueAtTime(1, mid);
  gainParam.linearRampToValueAtTime(0, tE);
}