const NUMBER_OF_BUFFERS = 100;
const GRAIN_SIZE = 0.5;

const area_range = 20;
const c = new AudioContext();
let buf;

const attack = 0.003;   // 3 ms
const release = 0.005;  // 5 ms

// async function loadSample() {
//     const file = input.files[0];
//     if (!file) return;
             
//     const arrayBuffer = await file.arrayBuffer();
//     const audioBuffer = await c.decodeAudioData(arrayBuffer);
                                                
//     return audioBuffer;                         
// }

// async function init_buffer() { 
//     buf = await loadSample(); 
// }

// input.onchange = () => (init_buffer());

class GenerativeArea{
    constructor(cord_x, cord_y, chr){
        this.x = cord_x;
        this.y = cord_y;
        this.range = area_range;
        this.chroma = chr;
        this.notesPlayed = 0;
        this.lastGenerationTime = Date.now();
        this.bufferNumber = (int)(Math.random() * (audioBuffer.length ?? 0));
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

    play_grain(duration, st, atk = attack, rel = release){
        let s = c.createBufferSource();
        let g = c.createGain();

        let bufferIndex = Math.floor(((this.x + this.y) / 1900) * audioBuffer.length); 
        console.log(bufferIndex);

        s.buffer = audioBuffer[this.bufferNumber];
        let oct = 0 - Math.floor((this.y * 6) / 1000);
        s.playbackRate.value = Math.pow(2, (st + (12 * oct))/12);

        s.connect(g).connect(c.destination);

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