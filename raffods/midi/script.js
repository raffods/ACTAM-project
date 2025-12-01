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

  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);

  function onMIDISuccess(access) {
    console.log("MIDI ready!");
    midi = access; // store in the global (in real usage, would probably keep in an object instance)
    const inputs = Array.from(access.inputs.values());
    midi_devices = inputs;
    const outputs = Array.from(access.outputs.values());

    access.onstatechange = (event) => {
      // Print information about the (dis)connected MIDI controller
      if (event.port.type === "input" && event.port.state === "connected") {
        console.log(
          event.port.name,
          event.port.manufacturer,
          event.port.state,
          event.port.id,
          event.port.type
        );
        selector.innerHTML += `<option value="${event.port.id}">${event.port.name} - ${event.port.manufacturer}</option>`;
      } else if (
        event.port.type === "input" &&
        event.port.state === "disconnected"
      ) {
        console.log(
          event.port.name,
          event.port.manufacturer,
          event.port.state,
          event.port.id,
          event.port.type
        );
        // remove from select
        for (let i = 1; i < selector.options.length; i++) {
          if (selector.options[i].value === event.port.id) {
            selector.remove(i);
            break;
          }
        }
      }
    };
    print_note();
  }

  const selectedInput = midi_devices.find(
    (input) => input.name === "SAMSUNG_Android"
  );
  function listInputsAndOutputs(midiAccess) {
    for (const entry of midiAccess.inputs) {
      const input = entry[1];
      console.log(
        `Input port [type:'${input.type}'] id:'${input.id}' manufacturer: '${input.manufacturer}' name: '${input.name}' version: '${input.version}'`
      );
    }

    for (const entry of midiAccess.outputs) {
      const output = entry[1];
      console.log(
        `Output port [type:'${output.type}'] id: '${output.id}' manufacturer: '${output.manufacturer}' name: '${output.name}' version: '${output.version}'`
      );
    }
  }
  function onMIDIFailure(msg) {
    console.error(`Failed to get MIDI access - ${msg}`);
  }

  function print_note() {
    // Get lists of available MIDI controllers
    midi_devices.forEach((input, index) => {
      console.log(index);
      console.log(input.name); /* inherited property from MIDIPort */
      input.onmidimessage = (message) => {
        if (input.id !== selector.value) return;
        const [command, note, velocity] = message.data;
        console.log(command, note, velocity);
        // command: 144 = noteOn, 128 = noteOff
        if (command === 144 && velocity > 0) {
          console.log("note on");
          return [note, true];
        } else if (command === 128 || (command === 144 && velocity === 0)) {
          console.log("note off");
          return [note, false];
          // 176 e 224 sono invece lo slider con valori da 0 a 127
        }
      };
    });
  }
});
