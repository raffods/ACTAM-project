const RADIUS = 100;
const R2 = RADIUS * RADIUS;

let isDragging = false;

const SOUND_COLORS = [
  "#8E44AD", // 0 viola
  "#E74C3C", // 1 rosso
  "#F39C12", // 2 arancio
  "#F1C40F", // 3 giallo
  "#2ECC71", // 4 verde
  "#5DADE2", // 5 azzurro
  "#2E86C1", // 6 blu
  "#48C9B0", // 7 turchese
  "#EC407A", // 8 rosa
  "#8E44AD", // 9 viola (esempio)
  "#95A5A6", // 10 grigio
  "#2C3E50"  // 11 nero/grigio scuro
];

function applySoundNearPointer() {
  if (tool == -1) return;

  const movingParticles = particles.slice(0, N);

  for (const p of movingParticles) {
    const dx = p.xOff - mouseX;
    const dy = p.yOff - mouseY;
 
    if (dx*dx + dy*dy <= (tool !== 2 ? R2 : canvasOverlay.width * canvasOverlay.width)) {
      p.sound = (tool == 0 || tool == 2 ? selectedSample : -1);
      console.log(p.sound);
    }
  }
}

canvasOverlay.addEventListener("pointerdown", (e) => {
  if (tool == -1) return;
  isDragging = true;
  canvasOverlay.setPointerCapture(e.pointerId);
  applySoundNearPointer();
});

canvasOverlay.addEventListener("pointermove", (e) => {
  if (!isDragging || tool == -1) return;

  applySoundNearPointer();
});

canvasOverlay.addEventListener("pointerup", () => { isDragging = false; });
canvasOverlay.addEventListener("pointercancel", () => { isDragging = false; });
