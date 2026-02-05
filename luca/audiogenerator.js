const NUMBER_OF_BUFFERS = 100;
const GRAIN_SIZE = 0.5;
const MAX_VOICES = 128;

const area_range = 20;
const c = new AudioContext();
let buf;

const attack = 0.003; // 3 ms
const release = 0.005; // 5 ms

// Recording
const recordingBus = c.createGain();
recordingBus.connect(c.destination);

// Reverb
const reverbNode = c.createConvolver();
const reverbGain = c.createGain();
reverbGain.value = 0.3; // Reverb level
reverbNode.connect(reverbGain);
reverbGain.connect(recordingBus);

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

class GenerativeArea {
  constructor(cord_x, cord_y, chr) {
    this.x = cord_x;
    this.y = cord_y;
    this.range = area_range;
    this.chroma = chr;
    this.notesPlayed = 0;
    this.lastGenerationTime = Date.now();
  }

  setCord(cord_x, cord_y) {
    this.x = cord_x;
    this.y = cord_y;
  }

  contains(ex, ey) {
    const dx = ex - this.x;
    const dy = ey - this.y;
    return dx * dx + dy * dy <= this.range * this.range;
  }

  play_grain(duration, st, ps) {
    let s = c.createBufferSource();
    let g = c.createGain();
    let gHann = c.createGain();
    let panning = c.createStereoPanner();
    let panningAmp = 1;
    panning.pan.value = (Math.random() * 2 - 1) * panningAmp; // Full range -1 to 1

    if (ps == -1 || this.notesPlayed >= MAX_VOICES) return;
    s.buffer = audioBuffer[ps];

    let octave_range = ho - lo;
    let oct = ho - Math.round((this.y * octave_range) / 696); //696 = canvas size
    let a = Math.round((this.y * octave_range) / 696);
    let y = this.y;
    console.log({ y, a, oct, octave_range });

    s.playbackRate.value = Math.pow(2, (st + 12 * oct) / 12);

    s.connect(g).connect(gHann).connect(panning).connect(recordingBus);
    panning.connect(reverbNode); // Send to reverb POST-pan so the reverb matches position

    let delay = Math.random() * 0.08;
    const now = c.currentTime + (delay > 0.03 ? delay : 0); //Piccolo delay casuale
    let durationDelta = this.x / 1000;
    const grainDuration = duration + durationDelta;
    const peakGain = 0.1 + 0.4 * Math.random();

    applyAREnvelope(g.gain, now, grainDuration, peakGain);
    applyHannUnit(gHann.gain, now, grainDuration); //Hann window
    console.log(grainDuration);

    let offset = Math.random() * (!audioBuffer[ps] ? 0 : audioBuffer[ps].duration);
    offset = s.playbackRate.value <= 0.5 ? offset * 0.5 : offset;

    s.start(now, offset, grainDuration);
    //s.stop(now + grainDuration + 0.003);
    //console.log({ps,now,offset,grainDuration});
    this.notesPlayed++;

    s.onended = () => {
      this.notesPlayed--;
    };
  }
}

function applyHannUnit(gainParam, t0, dur) {
  const mid = t0 + dur * 0.5;
  const tE = t0 + dur;

  gainParam.cancelScheduledValues(t0);
  gainParam.setValueAtTime(0, t0);
  gainParam.linearRampToValueAtTime(1, mid);
  gainParam.linearRampToValueAtTime(0, tE);
}
