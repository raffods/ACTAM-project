import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { app } from "./firebase.js";

// Inizializza Firestore
const db = getFirestore(app);

// Gestione Salvataggio Variabili su Firestore
let elements = await getDocs(collection(db, "presets"));

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

function saveVariablesToFirestore() {
  console.log("Salvataggio variabili su Firestore...");
  const a = document.getElementById("aSlider").value;
  const b = document.getElementById("bSlider").value;
  const m = document.getElementById("mSlider").value;
  const n = document.getElementById("nSlider").value;
  const name = document.getElementById("nameInput").value;
  console.log("Valori da salvare:", { a, b, m, n, name });
  //   controlla che nel database non ci siano file con campo name uguale a quello attuale
  if (checkDuplicateName(name)) {
    alert("Errore: Nome duplicato trovato nel database. Scegli un nome diverso.");
    return;
  }

  // Aggiungi i dati al database
  addDoc(collection(db, "presets"), {
    a: parseInt(a),
    b: parseInt(b),
    m: parseInt(m),
    n: parseInt(n),
    name: name,
  })
    .then((docRef) => {
      console.log("Documento scritto con ID: ", docRef.id);
      alert("Dati salvati con successo!");
      refresh();
      //reset nameInput field
      document.getElementById("nameInput").value = "";
    })
    .catch((error) => {
      console.error("Errore nell'aggiunta del documento: ", error);
      alert("Errore durante il salvataggio: " + error.message);
    });
}
