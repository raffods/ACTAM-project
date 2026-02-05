var notyf = new Notyf();

const input = document.getElementById('audio_sample');
const samplelib = document.getElementById('sample-lib');
let samples = [];
let selectedSample = -1;

let audioCtx = new AudioContext();
let arrayBuffer = [];
let audioBuffer = [];

const selectFolderBtn = document.getElementById("selectFolderBtn");

if (input) input.disabled = true;
let directoryHandle = null;

if (selectFolderBtn) {
  selectFolderBtn.addEventListener("click", async () => {
    try {
      // Richiede all'utente di selezionare una cartella
      directoryHandle = await window.showDirectoryPicker();
      console.log("Directory handle acquisito:", directoryHandle);

      // Enable file selection
      if (input) input.disabled = false;

      // Nota: Non popoliamo più la lista file dalla cartella,
      // usiamo l'input file standard come richiesto.
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Errore durante la selezione della cartella:", error);
      }
    }
  });
}

if (input) {
  input.addEventListener("click", async (e) => {
    if (directoryHandle) {
      e.preventDefault();
      try {
        const handles = await window.showOpenFilePicker({
          multiple: true,
          startIn: directoryHandle,
        });
        const dt = new DataTransfer();
        for (const handle of handles) {
          const file = await handle.getFile();
          dt.items.add(file);
        }
        input.files = dt.files;
        input.dispatchEvent(new Event("change"));
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error picking files:", error);
        }
      }
    }
  });
}

input.addEventListener('change', async () => {
  if (directoryHandle){
    const invalidFiles = [];
      for (const file of input.files) {
        try {
          await directoryHandle.getFileHandle(file.name, { create: false });
        } catch (error) {
          invalidFiles.push(file.name);
        }
      }

    let i = 0;
    audioBuffer = [];
    arrayBuffer = [];
  
    if(input.files.length > 12) {
      notyf.error('Maximun numer of file exceeded [' + input.files.length + '/12]');
      return;
    }
  
    samplelib.innerHTML = "";
    samples = [];
    for (const file of input.files) {
      console.log(file);
      const buffer = await file.arrayBuffer();
      arrayBuffer[i] = buffer;
      audioBuffer[i] = await audioCtx.decodeAudioData(buffer);
  
      const audioItem = document.createElement("div");
      audioItem.className = "sample-file";
  
      const img = document.createElement("img");
      img.className = "sample-image";
      img.setAttribute("src","images/sample/" + i + ".png");
  
      const audioLabel = document.createElement("span");
      audioLabel.innerHTML = file.name;
      audioLabel.className = "file-label";
  
      audioItem.appendChild(img);
      audioItem.appendChild(audioLabel);
      samplelib.appendChild(audioItem);
      samples[i] = audioItem;
  
      i++;
    }
  }

  samples.forEach(item => {
    item.addEventListener('click', () => {
      selectedSample = samples.indexOf(item);
      selectSample(selectedSample);
      console.log(selectedSample);
    });
  });
});

function selectSample(index){
  for(let i = 0; i < samples.length; i++){
    if(i == index) 
      samples[i].classList.add("selected");
    else 
      samples[i].classList.remove("selected");  
  }
}
