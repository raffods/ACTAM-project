let midi = null; // global MIDIAccess object
let midi_devices = [];
const selector = document.getElementById("midi-selector");

let isMidiLearning = false;
let learningTarget = null;
let midiMappings = {
  1: "mSlider",
  2: "nSlider",
  5: "loSlider",
  6: "hoSlider",
  3: "sSlider",
  4: "gsSlider",
  7: "vSlider",
  8: "numSlider"
};

document.addEventListener("DOMContentLoaded", () => {
  // MIDI Link Button Logic
  const midiLinkBtn = document.getElementById("midiLinkBtn");
  if (midiLinkBtn) {
    midiLinkBtn.addEventListener("click", () => {
      isMidiLearning = !isMidiLearning;
      if (isMidiLearning) {
        midiLinkBtn.classList.add("midiRedPressed");
        midiLinkBtn.textContent = "Click a UI knob...";
        learningTarget = null;
      } else {
        midiLinkBtn.classList.remove("midiRedPressed"); 
        midiLinkBtn.textContent = "MIDI Link";
        learningTarget = null;
      }
    });
  }

  // Knock click listeners for learning
  const knobWrappers = document.querySelectorAll('.knob-wrapper');
  knobWrappers.forEach(knob => {
    knob.addEventListener('click', () => {
      if (isMidiLearning) {
        const input = knob.querySelector('input');
        if (input) {
          learningTarget = input.id;
          if (midiLinkBtn) midiLinkBtn.textContent = "Move MIDI control...";
          notyf.success(`Selected ${input.id}. Now move a knob on your MIDI controller.`);
        }
      }
    });
  });

  document.body.addEventListener("click", () => {
    c.resume();
  });

  if (!("requestMIDIAccess" in navigator)) {
    notyf.error("WebMIDI non supportata in questo browser. Prova con un'altro browser.");
  } else {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  }

  function onMIDISuccess(access) {
    console.log("MIDI access obtained.");
    console.log(access);
    midi = access;
    access.addEventListener("statechange", updateDevices);
    const inputs = access.inputs;
    console.log(inputs);

    inputs.forEach((input) => {
      console.log(input);
      input.onmidimessage = handleInput;
    });
  }

  function onMIDIFailure() {
    console.log("Could not access your MIDI devices.");
  }

  function handleInput(midiMessage) {
    if (!selector.value || midiMessage.currentTarget.id !== selector.value) return null;

    let chroma = null;
    const command = midiMessage.data[0];
    const note = midiMessage.data[1];
    const velocity = midiMessage.data[2];

    const type = command & 0xF0;     // bin mask (logic and with 1111.0000)
    const channel = command & 0x0F; // ... (logic and with 0000.1111)

    console.log({type, channel, note, velocity});

    switch (type) {
      case 0x90: // note on
        if (samples.length <= 0) {
          if (!notyfUsed) {
            notyfUsed = true;
            notyf.error({
              message: "No sample uploaded.<br>(Go to page B of settings)",
              duration: 2000,
            });

            setTimeout(() => {
              notyfUsed = false;
            }, 2500);
          }

          return;
        }

        if (velocity > 0) {
          chroma = chromatic_scale[note % 12];
          console.log("note on", chroma);
          notesPlayed.push(chroma);
          break;
        } else {
          chroma = chromatic_scale[note % 12];
          let index = notesPlayed.indexOf(chroma ?? 0);
          console.log("note off", chroma, index);
          notesPlayed.splice(index, 1);
          break;
        }
      case 0x80: // note off
        chroma = chromatic_scale[note % 12];
        let index = notesPlayed.indexOf(chroma ?? 0);
        console.log("note off", chroma, index);
        notesPlayed.splice(index, 1);
        deleteGenerativeArea(chroma);
        break;
      case 0xB0: //Knob
        if (isMidiLearning && learningTarget) {
          midiMappings[note] = learningTarget;
          notyf.success(`Linked CC ${note} to ${learningTarget}`);
          
          // Reset learning state
          isMidiLearning = false;
          learningTarget = null;
          const midiLinkBtn = document.getElementById("midiLinkBtn");
          if (midiLinkBtn) {
            midiLinkBtn.textContent = "MIDI Link";
            midiLinkBtn.classList.remove("midiRedPressed");
          }
        }
        updateKnobValue(note, velocity);
        break;
    }
  }

  function updateDevices(event) {
    console.log("MIDI device state changed:", event);
    const port = event.port;
    if (!midi_devices.includes(port)) {
      port.onmidimessage = handleInput;
    }
    if (port.type === "input") {
      if (port.state === "connected" && !midi_devices.includes(port)) {
        midi_devices.push(port);
        selector.innerHTML += `<option value="${port.id}">${port.name}</option>`;
      } else if (port.state === "disconnected" && midi_devices.includes(port)) {
        const index = midi_devices.indexOf(port);
        midi_devices.splice(index, 1);
        selector.querySelector(`option[value="${port.id}"]`).remove();
      }
    }
  }
});

let slid = undefined;
let newVal;
function updateKnobValue(knob_number, value) {
  const targetId = midiMappings[knob_number];
  if (!targetId) return;

  const slid = document.getElementById(targetId);
  if (!slid) return;

  const min = parseFloat(slid.min);
  const max = parseFloat(slid.max);
  
  // Generic mapping logic
  const newVal = min + (value / 127) * (max - min);

  setKnobValue(slid, newVal);
}

function setKnobValue(obj, newVal) {
  obj.value = newVal;
  obj.dispatchEvent(new Event("setValue"));
  obj.dispatchEvent(new Event("change"));
}
let notyfUsed = false;
addEventListener("keydown", (event) => {
  if (event.code.includes("Key") && !event.repeat && selector.value === "ck") {
    if (samples.length <= 0) {
      if (!notyfUsed) {
        notyfUsed = true;
        notyf.error({
          message: "No sample uploaded.<br>(Go to page B of settings)",
          duration: 2000,
        });

        setTimeout(() => {
          notyfUsed = false;
        }, 2500);
      }

      return;
    }

    let key = event.code.replace("Key", "");
    if (keyToNoteMap[key]) notesPlayed.push(keyToNoteMap[key]);
  }

  firstTime = false;
});

addEventListener("keyup", (event) => {
  if (event.code.includes("Key") && selector.value === "ck") {
    let key = event.code.replace("Key", "");
    if (keyToNoteMap[key]) {
      let index = notesPlayed.indexOf(keyToNoteMap[key] ?? 0);
      notesPlayed.splice(index, 1);
      deleteGenerativeArea(keyToNoteMap[key]);
    }
  }
});

const keyToNoteMap = {
  // Tasti bianchi
  A: "C",
  S: "D",
  D: "E",
  F: "F",
  G: "G",
  H: "A",
  J: "B",
  K: "C",

  // Tasti neri
  W: "C#",
  E: "D#",
  T: "F#",
  Y: "G#",
  U: "A#",
};

const chromatic_scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function semitonDistance(note) {
  let semitones = 0;
  for (let n of chromatic_scale) {
    if (n === note) return semitones;
    semitones++;
  }
}
