const NUMBER_OF_BUFFERS = 100;
const GRAIN_SIZE = 0.5;

const area_range = 20;
const c = new AudioContext();

// add a Bus node
const recordingBus = c.createGain(); 
// link Bus to the output
recordingBus.connect(c.destination);

let buf;

async function loadSample() {
    const file = input.files[0];
    if (!file) return;
             
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await c.decodeAudioData(arrayBuffer);
                                                
    return audioBuffer;                         
}

async function init_buffer() { 
    buf = await loadSample(); 
}

input.onchange = () => (init_buffer());

class GenerativeArea{
    constructor(cord_x, cord_y, chr){
        this.x = cord_x;
        this.y = cord_y;
        this.range = area_range;
        this.chroma = chr;
        this.notesPlayed = 0;
    }

    contains(ex, ey){
        const dx = ex - this.x;
        const dy = ey - this.y;
        return (dx * dx + dy * dy) <= this.range * this.range;
    }

    play_grain(duration, st){
        let s = c.createBufferSource();
        let g = c.createGain();

        s.buffer = buf;
        let oct = 2 - Math.floor((this.y * 6) / 1000);
        s.playbackRate.value = Math.pow(2, (st + (12 * oct))/12);

        //s.connect(g).connect(c.destination);

        // s.connect(c.destination);
        s.connect(recordingBus);
        let offset = Math.random() * (!buf ? 0 : buf.duration)
        let durationDelta = (this.x) / 1000;
        console.log(durationDelta);

        // g.gain.setValueAtTime(0)

        s.start(c.currentTime + this.notesPlayed * 0.01, offset, duration + (durationDelta));
        this.notesPlayed++;
    }
}