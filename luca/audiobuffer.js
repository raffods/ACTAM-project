const input = document.getElementById('audio_sample');
const canvas = document.getElementById('waveform');
const ctx = canvas.getContext('2d');

// explicit pixel size for precise rendering
canvas.width = 200;
canvas.height = 50;

input.addEventListener('change', async () => {
  const file = input.files[0];
  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  drawVerticalWaveform(audioBuffer);
});

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