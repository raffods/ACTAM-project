let midi = null; // global MIDIAccess object
let midi_devices = [];
const selector = document.getElementById("midi-selector");

document.addEventListener("DOMContentLoaded", () => {
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
    console.log(command, note, velocity);
    switch (command) {
      case 144: // note on
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
      case 128: // note off
        chroma = chromatic_scale[note % 12];
        let index = notesPlayed.indexOf(chroma ?? 0);
        console.log("note off", chroma, index);
        notesPlayed.splice(index, 1);
        deleteGenerativeArea(chroma);
        break;
      case 176: //Knob
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
  switch (knob_number) {
    case 1:
      slid = document.getElementById("mSlider");
      newVal = 1 + (value / 127) * 15;
      break;
    case 2:
      slid = document.getElementById("nSlider");
      newVal = 1 + (value / 127) * 15;
      break;
    case 5:
      slid = document.getElementById("loSlider");
      newVal = (value / 127) * 4 - 2;
      break;
    case 6:
      slid = document.getElementById("hoSlider");
      newVal = (value / 127) * 4 - 2;
      break;
    case 3:
      slid = document.getElementById("sSlider");
      newVal = 0.5 + (value / 127) * 249.5;
      break;
    case 4:
      slid = document.getElementById("gsSlider");
      newVal = 0.01 + (value / 127) * 0.99;
      break;
    case 7:
      slid = document.getElementById("vSlider");
      newVal = 0.003 + (value / 127) * 0.196;
      break;
    case 8:
      slid = document.getElementById("numSlider");
      newVal = 1000 + (value / 127) * 4000;
      break;
  }

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
