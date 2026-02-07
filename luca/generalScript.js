let slideIndex = 1;

const plate = document.getElementById("plate");

const btnA = document.getElementById("btnA");
const btnB = document.getElementById("btnB");
const btnC = document.getElementById("btnC");

const pageA = document.getElementById("settingsA");
const pageB = document.getElementById("settingsB");
const pageC = document.getElementById("settingsC");

const brush = document.getElementById("brush-tool");
const eraser = document.getElementById("erase-tool");
const bucket = document.getElementById("bucket-tool");
let tool = -1;

const svg    = document.getElementById("dial");
const sector = document.getElementById("sector");
const audioWidthSlider  = document.getElementById("audioWidth");
let audioWidth = 0.25;

btnA.onclick = () => {
    pageA.removeAttribute("hidden");
    pageB.setAttribute("hidden","");
    pageC.setAttribute("hidden","");
}

btnB.onclick = () => {
    pageB.removeAttribute("hidden");
    pageA.setAttribute("hidden","");
    pageC.setAttribute("hidden","");
}

btnC.onclick = () => {
    pageC.removeAttribute("hidden");
    pageB.setAttribute("hidden","");
    pageA.setAttribute("hidden","");
}


brush.onclick = () => {
    if(tool == 0) //If already selected, deselect
    {
        brush.classList.remove("selected");
        plate.classList.remove("brush-pointer");
        tool = -1;
        //console.log('brush no');
    }
    else
    {
        bucket.classList.remove("selected");
        eraser.classList.remove("selected");
        brush.classList.add("selected");

        plate.classList.remove("paint-bucket");
        plate.classList.remove("eraser-pointer");
        plate.classList.add("brush-pointer");
        //console.log('brush yes');
        tool = 0;
    }
}

eraser.onclick = () => {
    if(tool == 1) 
    {
        eraser.classList.remove("selected");
        plate.classList.remove("eraser-pointer");
        tool = -1;
        //console.log('eraser no');
    }
    else
    {
        bucket.classList.remove("selected");
        brush.classList.remove("selected");
        eraser.classList.add("selected");

        plate.classList.remove("brush-pointer");
        plate.classList.remove("paint-bucket");
        plate.classList.add("eraser-pointer");
        //console.log('eraser yes');
        tool = 1;
    }
}

bucket.onclick = () => {
    if(tool == 2) 
    {
        bucket.classList.remove("selected");
        plate.classList.remove("paint-bucket");
        tool = -1;
        //console.log('bucket no');
    }
    else
    {
        eraser.classList.remove("selected");
        brush.classList.remove("selected");
        bucket.classList.add("selected");

        plate.classList.remove("brush-pointer");
        plate.classList.remove("eraser-pointer");
        plate.classList.add("paint-bucket");
        //console.log('bucket yes');
        tool = 2;
    }
}

showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
}

audioWidthSlider.oninput = () => {
    audioWidth = audioWidthSlider.value;
    updateSector(audioWidth);
}

const cx = 100, cy = 100, r = 90;

function updateSector(v) {
  if (v === 0) {
    sector.setAttribute("d", "");
    return;
  }

  const theta = Math.PI * v;
  const x = cx - r * Math.cos(-theta/2);
  const y = cy - r * Math.sin(-theta/2);
  const x1 = cx - r * Math.cos(theta/2);
  const y1 = cy - r * Math.sin(theta/2);
  const largeArc = 0;

  const d = `
    M ${cx} ${cy}
    L ${y1} ${x1}
    A ${r} ${r} 0 ${largeArc} 1 ${y} ${x}
    L ${cx} ${cy}
    Z
  `;
  sector.setAttribute("d", d);
}

updateSector(audioWidth);