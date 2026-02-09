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
  defaultOption.text = " Select a preset ";
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
      if (!notyfUsed) {
        notyfUsed = true;
        notyf.error({
          message: `The preset requires folder "${data.folderName}" but you have selected "${directoryHandle.name}"<br>Please select the correct folder.`,
          duration: 2000,
        });

        setTimeout(() => {
          notyfUsed = false;
        }, 2500);
      }
      return;
    }

    document.getElementById("mSlider").value = data.m;
    document.getElementById("mSlider").dispatchEvent(new Event("setValue")); // trigger any input listeners
    document.getElementById("mSlider").dispatchEvent(new Event("change")); // trigger any input listeners
    document.getElementById("nSlider").value = data.n;
    document.getElementById("nSlider").dispatchEvent(new Event("setValue")); // trigger any input listeners
    document.getElementById("nSlider").dispatchEvent(new Event("change")); // trigger any input listeners
    document.getElementById("loSlider").value = data.lo;
    document.getElementById("loSlider").dispatchEvent(new Event("setValue")); // trigger any input listeners
    document.getElementById("loSlider").dispatchEvent(new Event("change")); // trigger any input listeners
    document.getElementById("hoSlider").value = data.ho;
    document.getElementById("hoSlider").dispatchEvent(new Event("setValue")); // trigger any input listeners
    document.getElementById("hoSlider").dispatchEvent(new Event("change")); // trigger any input listeners
    document.getElementById("numSlider").value = data.num;
    document.getElementById("numSlider").dispatchEvent(new Event("setValue")); // trigger any input listeners
    document.getElementById("numSlider").dispatchEvent(new Event("change")); // trigger any input listeners

    // Load extra parameters if available (Scan freq, Grain size, Vibration)
    if (data.s !== undefined) {
      document.getElementById("sSlider").value = data.s;
      document.getElementById("sSlider").dispatchEvent(new Event("setValue"));
      document.getElementById("sSlider").dispatchEvent(new Event("change"));
    }
    if (data.gs !== undefined) {
      document.getElementById("gsSlider").value = data.gs;
      document.getElementById("gsSlider").dispatchEvent(new Event("setValue"));
      document.getElementById("gsSlider").dispatchEvent(new Event("change"));
    }
    if (data.v !== undefined) {
      document.getElementById("vSlider").value = data.v;
      document.getElementById("vSlider").dispatchEvent(new Event("setValue"));
      document.getElementById("vSlider").dispatchEvent(new Event("change"));
    }

    if (data.autoGen !== undefined) {
      document.getElementById("autoOctave").checked = data.autoGen;
      document.getElementById("autoOctave").dispatchEvent(new Event("change"));
    }
    if (data.autoVel !== undefined) {
      document.getElementById("autoVelocity").value = data.autoVel;
      document.getElementById("autoVelocity").dispatchEvent(new Event("change"));
      document.getElementById("autoVelocity").dispatchEvent(new Event("input"));
    }

    // Load Panning and Reverb
    if (data.pan !== undefined) {
      document.getElementById("audioWidth").value = data.pan;
      document.getElementById("audioWidth").dispatchEvent(new Event("input"));
    }
    if (data.reverb !== undefined) {
      document.getElementById("wetSlider").value = data.reverb;
      document.getElementById("wetSlider").dispatchEvent(new Event("input"));
    }

    // Load Envelope (Attack/Release)
    if (data.attack !== undefined && window.ar) window.ar.xA = data.attack;
    if (data.release !== undefined && window.ar) window.ar.xR = data.release;

    // Redraw envelope if valid
    if (typeof drawEnv === "function") drawEnv();

    savedParticles = data.p;
    updateParticles();

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
          loaded_files[loadedCount] = file;
          const objectURL = URL.createObjectURL(file);
          console.log(`Loaded from preset - File: ${file.name}, URL: ${objectURL}`);
          loadedCount++;
        } catch (err) {
          console.error(`Could not load file ${name} from current directory handle:`, err);
        }
      }
      if (loadedCount > 0) {
        if (!notyfUsed) {
          notyfUsed = true;
          notyf.success({
            message: `Automatically loaded ${loadedCount} files<br>for preset "${data.name}"`,
            duration: 2000,
          });

          setTimeout(() => {
            notyfUsed = false;
          }, 2500);
        }
      }
    } else if (data.fileNames && !directoryHandle) {
      if (!notyfUsed) {
        notyfUsed = true;
        notyf.error({
          message: `Please select the folder<br>"${data.folderName || "unknown"}" first`,
          duration: 2000,
        });

        setTimeout(() => {
          notyfUsed = false;
        }, 2500);
      }
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
  samples.forEach((item) => {
    item.addEventListener("click", () => {
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
  if (!notyfUsed) {
    notyfUsed = true;
    notyf.success({
      message: `Preset succesfully saved!`,
      duration: 2000,
    });

    setTimeout(() => {
      notyfUsed = false;
    }, 2500);
  }
  await refresh();
  //reset nameInput field
  document.getElementById("nameInput").value = "";

  refreshPresets();

  // Select the new preset
  presetSelect.value = docRef.id;
}

function saveVariablesToFirestore() {
  console.log("Salvataggio variabili su Firestore...");
  const mSlider = document.getElementById("mSlider").value;
  const nSlider = document.getElementById("nSlider").value;
  const loSlider = document.getElementById("loSlider").value;
  const hoSlider = document.getElementById("hoSlider").value;
  const num = document.getElementById("numSlider").value;
  // Get other parameters
  const sSlider = document.getElementById("sSlider").value;
  const gsSlider = document.getElementById("gsSlider").value;
  const vSlider = document.getElementById("vSlider").value;
  const autoGen = document.getElementById("autoOctave").checked;
  const autoVel = document.getElementById("autoVelocity").value;

  // New params
  const pan = document.getElementById("audioWidth").value;
  const reverb = document.getElementById("wetSlider").value;
  const attack = window.ar ? window.ar.xA : 0.08;
  const release = window.ar ? window.ar.xR : 0.85;

  const name = document.getElementById("nameInput").value;
  saveParticleState();

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

  console.log("Valori da salvare:", { a, b, m, n, num, name, folderName, fileNames });
  //   controlla che nel database non ci siano file con campo name uguale a quello attuale
  if (checkDuplicateName(name)) {
    // chiedi se vuoi aggiornare il preset
    if (!notyfUsed) {
      notyfUsed = true;
      notyf.error({
        message: `Preset "${name}" already exists.<br>
          <button id="notifyUpdateBtn" style="
            margin-top: 8px;
            padding: 4px 12px;
            border-radius: 4px;
            background: rgba(255,255,255,0.9);
            color: #d00000;
            border: none;
            cursor: pointer;
            font-weight: 700;">
            UPDATE
          </button>`,
        duration: 4000,
        dismissible: true,
      });

      // Handle button click for update
      setTimeout(() => {
        const btn = document.getElementById("notifyUpdateBtn");
        if (btn) {
          btn.addEventListener("click", () => {
            // Force reset flag to allow success/error message
            notyfUsed = false;

            // trova il documento con questo nome
            const docToUpdate = elements.docs.find((doc) => doc.data().name === name);
            if (docToUpdate) {
              // aggiorna il documento
              const docRef = docToUpdate.ref;
              updateDoc(docRef, {
                m: parseInt(mSlider),
                n: parseInt(nSlider),
                lo: parseInt(loSlider),
                ho: parseInt(hoSlider),
                num: parseInt(num),
                s: parseFloat(sSlider),
                gs: parseFloat(gsSlider),
                v: parseFloat(vSlider),
                autoGen: autoGen,
                autoVel: parseInt(autoVel),
                pan: parseFloat(pan),
                reverb: parseFloat(reverb),
                attack: parseFloat(attack),
                release: parseFloat(release),
                p: savedParticles,
                folderName: folderName,
                fileNames: fileNames,
              })
                .then(() => {
                  if (!notyfUsed) {
                    notyfUsed = true;
                    notyf.success({
                      message: `Preset "${name}" succesfully updated!`,
                      duration: 2000,
                    });

                    setTimeout(() => {
                      notyfUsed = false;
                    }, 2500);
                  }
                  refresh();
                  document.getElementById("nameInput").value = "";
                })
                .catch((error) => {
                  if (!notyfUsed) {
                    notyfUsed = true;
                    notyf.error({
                      message: `Error updating preset "${name}": ` + error.message,
                      duration: 2000,
                    });

                    setTimeout(() => {
                      notyfUsed = false;
                    }, 2500);
                  }
                });
            }
          });
        }
      }, 50);

      // Reset flag after toast duration + buffer
      setTimeout(() => {
        notyfUsed = false;
      }, 4500);
    }
    return;
  } else if (name.trim() === "") {
    if (!notyfUsed) {
      notyfUsed = true;
      notyf.error({
        message: `Please provide a valid name for the preset`,
        duration: 2000,
      });

      setTimeout(() => {
        notyfUsed = false;
      }, 2500);
    }
    return;
  }

  // Aggiungi i dati al database
  addDoc(collection(db, "presets"), {
    m: parseInt(mSlider),
    n: parseInt(nSlider),
    lo: parseInt(loSlider),
    ho: parseInt(hoSlider),
    num: parseInt(num),
    s: parseFloat(sSlider),
    gs: parseFloat(gsSlider),
    v: parseFloat(vSlider),
    autoGen: autoGen,
    autoVel: parseInt(autoVel),
    pan: parseFloat(pan),
    reverb: parseFloat(reverb),
    attack: parseFloat(attack),
    release: parseFloat(release),
    p: savedParticles,
    name: name,
    folderName: folderName,
    fileNames: fileNames,
  })
    .then((docRef) => addToFirestore(docRef))
    .catch((error) => {
      if (!notyfUsed) {
        notyfUsed = true;
        notyf.error({
          message: `Error saving preset: ` + error.message,
          duration: 2000,
        });

        setTimeout(() => {
          notyfUsed = false;
        }, 2500);
      }
    });
}
