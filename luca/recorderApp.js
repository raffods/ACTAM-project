// recorderApp.js

let recorder;
let recordingCount = 0;
let recording = false;

// button - function
const recordBtn = document.getElementById('recordButton');
const stopBtn = document.getElementById('stopButton');
const audioContainer = document.getElementById('audioContainer');

// toggle dropdown
audioContainerLabel.addEventListener("click", () => {
  audioContainer.classList.toggle("open");
});

recordBtn.addEventListener('click', () => {
    // init, link to recordingBus
    if (!recorder) {
        // c and recordingBus [same] as ones in audiogenerator.js
        recorder = new Recorder(recordingBus, { numChannels: 2 });
    }

    if (c.state === 'suspended') {
        c.resume();
    }

    if (!recording){
        recorder.clear();
        recorder.record();
        recording = true;
    }
    else 
    {
        recording = false;
        recorder.stop();

        // Num adding auto
        recordingCount++;

        recorder.exportWAV((blob) => {
        const url = URL.createObjectURL(blob);
        const fileName = `recording_${recordingCount}.wav`;

        // <li> al posto di <option>
        const item = document.createElement("li");

        const label = document.createElement("strong");
        label.textContent = `No.${recordingCount}`;

        const audio = document.createElement("audio");
        audio.className = "RecordPlayer";
        audio.controls = true;
        audio.src = url;
        audio.title = fileName;

        item.appendChild(label);
        item.appendChild(audio);
        audioContainer.appendChild(item);

        // aggiorna label del bottone (effetto select)
        audioContainerLabel.firstChild.textContent = `No.${recordingCount} `;

        console.log(`Added Record No.${recordingCount}`);
        });
    }

    if(recording)
    {
        recordBtn.classList.remove("offFilter");
        recordBtn.classList.add("onFilter");
    }
    else
    {
        recordBtn.classList.remove("onFilter");
        recordBtn.classList.add("offFilter");
    }

});