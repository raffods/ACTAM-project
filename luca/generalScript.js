const plate = document.getElementById("plate");

const btnA = document.getElementById("btnA");
const btnB = document.getElementById("btnB");

const pageA = document.getElementById("settingsA");
const pageB = document.getElementById("settingsB");

const brush = document.getElementById("brush-tool");
const eraser = document.getElementById("erase-tool");
const bucket = document.getElementById("bucket-tool");
let tool = -1;


btnA.onclick = () => {
    pageA.removeAttribute("hidden");
    pageB.setAttribute("hidden","");
}

btnB.onclick = () => {
    pageB.removeAttribute("hidden");
    pageA.setAttribute("hidden","");
}


brush.onclick = () => {
    if(tool == 0) //If already selected, deselect
    {
        brush.classList.remove("selected");
        plate.classList.remove("brush-pointer");
        tool = -1;
    }
    else
    {
        bucket.classList.remove("selected");
        eraser.classList.remove("selected");
        brush.classList.add("selected");

        plate.classList.add("brush-pointer");

        tool = 0;
    }
}

eraser.onclick = () => {
    if(tool == 1) 
    {
        eraser.classList.remove("selected");
        tool = -1;
    }
    else
    {
        bucket.classList.remove("selected");
        brush.classList.remove("selected");
        eraser.classList.add("selected");

        plate.classList.remove("brush-pointer");

        tool = 1;
    }
}

bucket.onclick = () => {
    if(tool == 2) 
    {
        bucket.classList.remove("selected");
        tool = -1;
    }
    else
    {
        eraser.classList.remove("selected");
        brush.classList.remove("selected");
        bucket.classList.add("selected");

        plate.classList.remove("brush-pointer");

        tool = 2;
    }
}
