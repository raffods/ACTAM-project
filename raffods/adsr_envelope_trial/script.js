import ADSREnvelope from "https://esm.sh/adsr-envelope";
// const utils = require ("adsr-envelope");
// const ADSREnvelope = utils.ADSREnvelope;

const ctx = new (window.AudioContext || window.webkitAudioContext)();

document.getElementById("playButton").addEventListener("click", () => {
  if (ctx.state === "suspended") {
    ctx.resume();
  }

  const attack = parseFloat(document.getElementById("attack").value);
  const decay = parseFloat(document.getElementById("decay").value);
  const sustain = parseFloat(document.getElementById("sustain").value);
  const release = parseFloat(document.getElementById("release").value);

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
    peakLevel: 0.5, // Max volume
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

// Visualization
const canvas = document.getElementById("envelopeCanvas");
const ctxCanvas = canvas.getContext("2d");
const inputs = ["attack", "decay", "sustain", "release"].map((id) =>
  document.getElementById(id)
);

function drawEnvelope() {
  const width = canvas.width;
  const height = canvas.height;
  const padding = 20;
  const drawWidth = width - padding * 2;
  const drawHeight = height - padding * 2;

  // Clear canvas
  ctxCanvas.clearRect(0, 0, width, height);

  // Get values
  const attack = parseFloat(document.getElementById("attack").value);
  const decay = parseFloat(document.getElementById("decay").value);
  const sustain = parseFloat(document.getElementById("sustain").value);
  const release = parseFloat(document.getElementById("release").value);

  const gate = 0.5; // Hardcoded in audio logic
  const peak = 0.5; // Hardcoded in audio logic

  const totalTime = attack + decay + gate + release;
  // Add some margin to the total time for better visualization
  const maxTime = Math.max(totalTime * 1.1, 1.0);

  // Helper to map time to X
  const mapX = (t) => padding + (t / maxTime) * drawWidth;
  // Helper to map level to Y (inverted because canvas Y starts at top)
  // Assuming max level possible is 1.0 for visualization scale
  const mapY = (l) => height - padding - (l / 1.0) * drawHeight;

  ctxCanvas.beginPath();
  ctxCanvas.lineWidth = 2;
  ctxCanvas.strokeStyle = "#00ff00";

  // Start (0, 0)
  ctxCanvas.moveTo(mapX(0), mapY(0));

  // Attack (AttackTime, Peak)
  ctxCanvas.lineTo(mapX(attack), mapY(peak));

  // Decay (Attack + Decay, Sustain * Peak)
  // Note: Sustain is usually a ratio of the peak level in ADSR
  // In the library options: "sustainLevel"
  // If peak is 0.5 and sustain is 0.7, the level is 0.35?
  // Let's check standard ADSR behavior. Usually Sustain is the level itself or ratio of peak.
  // The library doc says "sustainLevel". Let's assume it's absolute level if peak is not involved,
  // but here we have a peakLevel.
  // If I look at standard ADSR, Sustain is the level held.
  // If peakLevel is 0.5, and sustain is 0.7, does it go to 0.7? Or 0.7 * 0.5?
  // Usually sustain is a level (0-1). If peak is defined, sustain might be relative or absolute.
  // Let's assume for visualization that Sustain is a factor of Peak if Peak is defined, OR Sustain is the level.
  // Given the input says "Sustain Level (0 to 1)", and Peak is 0.5.
  // If I put sustain 1.0, it should stay at peak. So Sustain * Peak seems correct for the Y value.
  const sustainY = mapY(sustain * peak);

  ctxCanvas.lineTo(mapX(attack + decay), sustainY);

  // Sustain/Gate (Attack + Decay + Gate, Sustain * Peak)
  ctxCanvas.lineTo(mapX(attack + decay + gate), sustainY);

  // Release (Total, 0)
  ctxCanvas.lineTo(mapX(totalTime), mapY(0));

  ctxCanvas.stroke();

  // Draw points
  ctxCanvas.fillStyle = "white";
  const points = [
    [0, 0],
    [attack, peak],
    [attack + decay, sustain * peak],
    [attack + decay + gate, sustain * peak],
    [totalTime, 0],
  ];

  points.forEach(([t, l]) => {
    ctxCanvas.beginPath();
    ctxCanvas.arc(mapX(t), mapY(l), 4, 0, Math.PI * 2);
    ctxCanvas.fill();
  });
}

// Add listeners
inputs.forEach((input) => input.addEventListener("input", drawEnvelope));

// Initial draw
drawEnvelope();
