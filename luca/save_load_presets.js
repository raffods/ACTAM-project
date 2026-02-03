import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { app } from "./firebase.js";

// Inizializza Firestore
const db = getFirestore(app);

// Gestione Accesso Folder (File System Access API)

// Load button logic removed

// Gestione Salvataggio Variabili su Firestore
let elements = await getDocs(collection(db, "presets"));
const presetSelect = document.getElementById("presetSelect");

function refreshPresets() {
  // Pulisci le opzioni esistenti
  const value = presetSelect.value; // salva il valore selezionato
  presetSelect.innerHTML = ""; // Pulisce la select

  // Aggiungi l'opzione di default
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.text = "-- Select Preset --";
  presetSelect.appendChild(defaultOption);

  // Aggiungi le opzioni dal database
  elements.docs.forEach((doc) => {
    const option = document.createElement("option");
    option.value = doc.id;
    option.text = doc.data().name;
    presetSelect.appendChild(option);
  });

  // Ripristina il valore selezionato se esiste
  if (value) {
    presetSelect.value = value;
  }
}

refreshPresets();

presetSelect.addEventListener("change", async function () {
  const selectedDocId = this.value;
  const selectedDoc = elements.docs.find((doc) => doc.id === selectedDocId);
  if (selectedDoc) {
    const data = selectedDoc.data();

    if (directoryHandle && data.folderName && directoryHandle.name !== data.folderName) {
      alert(
        `The preset requires folder "${data.folderName}" but you have selected "${directoryHandle.name}". Please select the correct folder.`,
      );
      this.value = "";
      return;
    }

    document.getElementById("mSlider").value = data.m;
    document.getElementById("nSlider").value = data.n;
    document.getElementById("loSlider").value = data.loSlider;
    document.getElementById("hoSlider").value = data.hoSlider;

    // Load files if directoryHandle is available and fileNames are present
    let loaded_files = [];
    if (directoryHandle && data.fileNames) {
      const names = data.fileNames.split(",").map((n) => n.trim());
      console.log("Attempting to load files from preset:", names);

      let loadedCount = 0;
      for (const name of names) {
        if (!name) continue;


        try {
          const fileHandle = await directoryHandle.getFileHandle(name);
          const file = await fileHandle.getFile();
          // add to loaded_files array
          loaded_files[loadedCount]= file;
          const objectURL = URL.createObjectURL(file);
          console.log(`Loaded from preset - File: ${file.name}, URL: ${objectURL}`);
          loadedCount++;
        } catch (err) {
          console.error(`Could not load file ${name} from current directory handle:`, err);
        }
      }
      if (loadedCount > 0) {
        alert(`Automatically loaded ${loadedCount} files for preset "${data.name}"`);
      }
    } else if (data.fileNames && !directoryHandle) {
      console.warn("Folder access not granted. Cannot load files from preset.");
      alert(
        `Preset "${data.name}" has associated files. Please select the folder "${data.folderName || "unknown"}" first.`,
      );
    }
    let i = 0;
    audioBuffer = [];
    arrayBuffer = [];

    samplelib.innerHTML = "";
    samples = [];
    for (const file of loaded_files) {
      console.log(file);
      const buffer = await file.arrayBuffer();
      arrayBuffer[i] = buffer;
      audioBuffer[i] = await audioCtx.decodeAudioData(buffer);

      const audioItem = document.createElement("div");
      audioItem.className = "sample-file";

      const img = document.createElement("img");
      img.className = "sample-image";
      img.setAttribute("src", "images/sample/" + i + ".png");

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

const saveButton = document.getElementById("saveButton");
if (saveButton) {
  saveButton.addEventListener("click", saveVariablesToFirestore);
} else {
  console.error("Bottone 'saveButton' non trovato!");
}

function checkDuplicateName(name) {
  for (let doc of elements.docs) {
    if (doc.data().name === name) {
      return true; // Nome duplicato trovato
    }
  }
  return false; // Nessun duplicato
}

async function refresh() {
  elements = await getDocs(collection(db, "presets"));
}

async function addToFirestore(docRef) {
  console.log("Documento scritto con ID: ", docRef.id);
  alert("Dati salvati con successo!");
  await refresh();
  //reset nameInput field
  document.getElementById("nameInput").value = "";

  refreshPresets();

  // Select the new preset
  presetSelect.value = docRef.id;
}

function saveVariablesToFirestore() {
  console.log("Salvataggio variabili su Firestore...");
  const m = document.getElementById("mSlider").value;
  const n = document.getElementById("nSlider").value;
  const loSlider = document.getElementById("loSlider").value;
  const hoSlider = document.getElementById("hoSlider").value;
  const name = document.getElementById("nameInput").value;

  let folderName = null;
  if (directoryHandle) {
    folderName = directoryHandle.name;
  }

  let fileNames = "";
  if (input && input.files) {
    const names = [];
    for (const file of input.files) {
      names.push(file.name);
    }
    fileNames = names.join(", ");
  }

  console.log("Valori da salvare:", { a, b, m, n, name, folderName, fileNames });
  //   controlla che nel database non ci siano file con campo name uguale a quello attuale
  if (checkDuplicateName(name)) {
    // chiedi se vuoi aggiornare il preset
    const update = confirm("Esiste già un preset con questo nome. Vuoi aggiornarlo?");
    if (update) {
      // trova il documento con questo nome
      const docToUpdate = elements.docs.find((doc) => doc.data().name === name);
      if (docToUpdate) {
        // aggiorna il documento
        const docRef = docToUpdate.ref;
        updateDoc(docRef, {
          m: parseInt(m),
          n: parseInt(n),
          lo: parseInt(loSlider),
          ho: parseInt(hoSlider),
          folderName: folderName,
          fileNames: fileNames,
        })
          .then(() => {
            alert("Preset aggiornato con successo!");
            refresh();
          })
          .catch((error) => {
            console.error("Errore nell'aggiornamento del documento: ", error);
            alert("Errore durante l'aggiornamento: " + error.message);
          });
      }
    }
    return;
  } else if (name.trim() === "") {
    alert("Errore: Il campo nome non può essere vuoto.");
    return;
  }

  // Aggiungi i dati al database
  addDoc(collection(db, "presets"), {
    m: parseInt(mSlider),
    n: parseInt(nSlider),
    lo: parseInt(loSlider),
    ho: parseInt(hoSlider),
    name: name,
    folderName: folderName,
    fileNames: fileNames,
  })
    .then((docRef) => addToFirestore(docRef))
    .catch((error) => {
      console.error("Errore nell'aggiunta del documento: ", error);
      alert("Errore durante il salvataggio: " + error.message);
    });
}
