
const ar = {
  xA: 0.08,  // end of attack
  xR: 0.85,  // start of release
};

const envCanvas = document.getElementById('env');
const envCtx = envCanvas.getContext('2d');
const readout = document.getElementById('readout');


function drawEnv(){
  const w = envCanvas.width, h = envCanvas.height;
  envCtx.clearRect(0,0,w,h);
  
  // grid
  envCtx.strokeStyle = '#eee'; envCtx.lineWidth = 1;
  for (let i=1;i<10;i++){ const x=w*i/10; envCtx.beginPath(); envCtx.moveTo(x,0); envCtx.lineTo(x,h); envCtx.stroke(); }
  for (let i=1;i<5;i++){ const y=h*i/5; envCtx.beginPath(); envCtx.moveTo(0,y); envCtx.lineTo(w,y); envCtx.stroke(); }

  // points in px
  const P0 = {x: 0,        y: h};
  const P1 = {x: ar.xA*w,  y: 0};
  const P2 = {x: ar.xR*w,  y: 0};
  const P3 = {x: w,        y: h};

  // envelope polyline
  envCtx.strokeStyle = '#f0f0f0ff'; envCtx.lineWidth = 3;
  envCtx.beginPath();
  envCtx.moveTo(P0.x,P0.y);
  envCtx.lineTo(P1.x,P1.y);
  envCtx.lineTo(P2.x,P2.y);
  envCtx.lineTo(P3.x,P3.y);
  envCtx.stroke();

  // handles
  drawHandle('A', P1.x, P1.y);
  drawHandle('R', P2.x, P2.y);

  readout.textContent = `xA=${ar.xA.toFixed(3) ?? 0}  xR=${ar.xR.toFixed(3) ?? 0}`;
}

function drawHandle(label,x,y){
  envCtx.fillStyle='#fff'; envCtx.strokeStyle='#111111ff'; envCtx.lineWidth=2;
  envCtx.beginPath(); envCtx.arc(x,y,7,0,Math.PI*2); envCtx.fill(); envCtx.stroke();
  envCtx.fillStyle='#efbc05ff'; envCtx.font='20px ui-monospace, monospace';
  envCtx.fillText(label, x+10, y+14);
}

function pick(mx,my){
  const w = envCanvas.width;
  const A = {x: ar.xA*w, y: 20};
  const R = {x: ar.xR*w, y: 20};
  const dA = (mx-A.x)**2+(my-A.y)**2;
  const dR = (mx-R.x)**2+(my-R.y)**2;
  const r2 = 20*20;
  if (dA<r2 && dA<=dR) return 'A';
  if (dR<r2) return 'R';
  return null;
}

let dragging=null;

function toNormX(mx,who){
  switch(who){
    case "A":
      return Math.min(ar.xR,Math.max(0.05,mx/envCanvas.width)); 
    case "R":
      return Math.min(0.98,Math.max(ar.xA,mx/envCanvas.width)); 
    default:
      console.log("Errore");
      return ;
  }
}

envCanvas.addEventListener('pointerdown', (e)=>{
  const r = envCanvas.getBoundingClientRect();
  const mx = (e.clientX - r.left) * (envCanvas.width  / r.width);
  const my = (e.clientY - r.top)  * (envCanvas.height / r.height);
  const h=pick(mx,my);

  console.log({ mx, my, h });  
  if(!h) return;
  dragging=h;
  envCanvas.setPointerCapture(e.pointerId);
});

envCanvas.addEventListener('pointermove', (e)=>{
      
  if(!dragging) return;
  const r=envCanvas.getBoundingClientRect();
  const mx=e.clientX-r.left;
  const x=toNormX(mx,dragging);
  if(dragging==='A') ar.xA=x;
  if(dragging==='R') ar.xR=x;

  drawEnv();
});

envCanvas.addEventListener('pointerup', ()=> dragging=null);
envCanvas.addEventListener('pointercancel', ()=> dragging=null);

drawEnv();

function applyAREnvelope(gainParam, t0, dur, peak){
  const tA = t0 + ar.xA * dur;
  const tR = t0 + ar.xR * dur;
  const tE = t0 + dur;

  // Exponential ramp cannot start/end at 0
  const eps = 1e-4;

  gainParam.cancelScheduledValues(t0);
  gainParam.setValueAtTime(eps, t0);

  // attack: eps -> peak
  gainParam.exponentialRampToValueAtTime(Math.max(eps, peak), Math.max(tA, t0 + 1e-5));

  // hold peak until release
  gainParam.setValueAtTime(Math.max(eps, peak), Math.max(tR, tA + 1e-5));

  // release: peak -> eps
  gainParam.exponentialRampToValueAtTime(eps, Math.max(tE, tR + 1e-5));
}

window.applyAREnvelope = applyAREnvelope;