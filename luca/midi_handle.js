let midi = null; // global MIDIAccess object
let midi_devices = [];
let oscillators = []; // store active OscillatorNodes by input index
const selector = document.getElementById("midi-selector");
// import ADSREnvelope from 'https://unpkg.com/adsr-envelope?module';
// import ADSREnvelope from "./node_modules/adsr-envelope/lib/ADSREnvelope.js";

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
    switch (command) {
      case 146: // note on
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
      case 130: // note off
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
