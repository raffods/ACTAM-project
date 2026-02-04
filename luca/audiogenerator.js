const NUMBER_OF_BUFFERS = 100;
const GRAIN_SIZE = 0.5;
const MAX_VOICES = 128;

const area_range = 20;
const c = new AudioContext();
let buf;

const attack = 0.003;   // 3 ms
const release = 0.005;  // 5 ms

// Recording
const recordingBus = c.createGain(); 
recordingBus.connect(c.destination);

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
        let s = c.createBufferSource();
        let g = c.createGain();
        let gHann = c.createGain();

        if(ps == -1 || this.notesPlayed >= MAX_VOICES) return;
        s.buffer = audioBuffer[ps];
        
        let octave_range = ho - lo;
        let oct = ho - Math.round((this.y * octave_range) / 696); //696 = canvas size
        let a = Math.round((this.y * octave_range) / 696);
        let y = this.y;
        console.log({y, a, oct, octave_range});

        s.playbackRate.value = Math.pow(2, (st + (12 * oct))/12);

        s.connect(g).connect(gHann).connect(recordingBus);

        let delay = Math.random() * 0.08;
        const now = c.currentTime + (delay > 0.03 ? delay : 0); //Piccolo delay casuale
        let durationDelta = (this.x) / 1000;
        const grainDuration = duration + durationDelta;
        const peakGain = 0.1 + (0.4 * Math.random());

        applyAREnvelope(g.gain, now, grainDuration, peakGain);
        applyHannUnit(gHann.gain, now, grainDuration); //Hann window
        console.log(grainDuration);

        let offset = Math.random() * (!audioBuffer[ps] ? 0 : audioBuffer[ps].duration);
        offset = s.playbackRate.value <= 0.5 ? offset * 0.5 : offset;

        s.start(now, offset, grainDuration);
        //s.stop(now + grainDuration + 0.003);
        //console.log({ps,now,offset,grainDuration});
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