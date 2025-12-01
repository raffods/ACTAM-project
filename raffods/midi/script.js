const c = new AudioContext();
let midi = null; // global MIDIAccess object
let midi_devices = [];
let oscillators = []; // store active OscillatorNodes by input index
// import ADSREnvelope from 'https://unpkg.com/adsr-envelope?module';
// import ADSREnvelope from "./node_modules/adsr-envelope/lib/ADSREnvelope.js";

document.addEventListener("DOMContentLoaded", () => {
  let selector = document.getElementById("midi-selector");
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
    const command = midiMessage.data[0];
    console.log(command);
    const note = midiMessage.data[1];
    const velocity = midiMessage.data[2];
    switch (command) {
      case 146: // note on
        if (velocity > 0) {
          return [note, velocity];
        } else {
          return [note, null];
        }
      case 130: // note off
        return [note, null];
    }
  }

  function updateDevices(event) {
    const port = event.port;
    if (!midi_devices.includes(port)){
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
