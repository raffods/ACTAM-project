const NUMBER_OF_BUFFERS = 100;
const GRAIN_SIZE = 0.5;

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

        s.buffer = audioBuffer[ps];
        let oct = 0 - Math.floor((this.y * 6) / 1000);
        s.playbackRate.value = Math.pow(2, (st + (12 * oct))/12);

        s.connect(g).connect(recordingBus);

        const now = c.currentTime + this.notesPlayed * 0.001;
        let durationDelta = (this.x) / 1000;
        const grainDuration = duration + durationDelta;
        const peakGain = 0.5 * Math.random();

        applyAREnvelope(g.gain, now, grainDuration, peakGain);

        let offset = Math.random() * (!audioBuffer[this.bufferNumber] ? 0 : audioBuffer[this.bufferNumber].duration)

        s.start(now, offset, grainDuration);
        this.notesPlayed++;
    }
}