let midi = null; // global MIDIAccess object
let midi_devices = [];
const selector = document.getElementById("midi-selector");

document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", () => {
    c.resume();
  });

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
  }

  function onMIDISuccess(access) {
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
    if (!selector.value || midiMessage.currentTarget.id !== selector.value)
      return null;

    let chroma = null;
    const command = midiMessage.data[0];
    const note = midiMessage.data[1];
    const velocity = midiMessage.data[2];
    console.log(command, note, velocity);
    switch (command) {
      case 144: // note on
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
    }
  }

  function updateDevices(event) {
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

let notyfUsed = false;
addEventListener("keydown", (event) => {
  if(event.code.includes("Key") && !event.repeat && selector.value === "ck"){
    if(samples.length <= 0) {
      if(!notyfUsed){
        notyfUsed = true;
        notyf.error({
            message: 'No sample uploaded.<br>(Go to page B of settings)',
            duration: 2000
        });
        
        setTimeout(() => {notyfUsed = false}, 2500);
      }
      
      return;
    }

    let key = event.code.replace("Key","");
    if(keyToNoteMap[key]) notesPlayed.push(keyToNoteMap[key]);
  }

  firstTime = false;
});

addEventListener("keyup", (event) => { 
  if(event.code.includes("Key") && selector.value === "ck"){
    let key = event.code.replace("Key","");
    if(keyToNoteMap[key]){
      let index = notesPlayed.indexOf(keyToNoteMap[key]??0);
      notesPlayed.splice(index,1);
      deleteGenerativeArea(keyToNoteMap[key]);
    }
  }
});

const keyToNoteMap = {
  // Tasti bianchi
  'A': "C",
  'S': "D",
  'D': "E",
  'F': "F",
  'G': "G",
  'H': "A",
  'J': "B",
  'K': "C",

  // Tasti neri
  'W': "C#",
  'E': "D#",
  'T': "F#",
  'Y': "G#",
  'U': "A#"
};

const chromatic_scale = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];

function semitonDistance(note){
  let semitones = 0;
  for(let n of chromatic_scale){
    if(n === note) return semitones;
    semitones++;
  }
}