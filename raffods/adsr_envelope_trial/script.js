import ADSREnvelope from 'https://esm.sh/adsr-envelope';
// const utils = require ("adsr-envelope");
// const ADSREnvelope = utils.ADSREnvelope;

const ctx = new (window.AudioContext || window.webkitAudioContext)();

document.getElementById('playButton').addEventListener('click', () => {
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const attack = parseFloat(document.getElementById('attack').value);
    const decay = parseFloat(document.getElementById('decay').value);
    const sustain = parseFloat(document.getElementById('sustain').value);
    const release = parseFloat(document.getElementById('release').value);

    // Create audio nodes
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Configure envelope
    // Note: The library uses specific property names
    const envelope = new ADSREnvelope({
        attackTime: attack,
        decayTime: decay,
        sustainLevel: sustain,
        releaseTime: release,
        gateTime: 0.5, // Duration to hold the note before releasing
        peakLevel: 0.5 // Max volume
    });

    const t0 = ctx.currentTime;

    // Apply envelope to gain.gain
    envelope.applyTo(gain.gain, t0);

    // Start and stop oscillator
    osc.start(t0);
    // Stop after the entire envelope is done
    osc.stop(t0 + envelope.duration + 1.0); 
    
    // Cleanup
    osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
    };
});