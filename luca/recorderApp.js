// recorderApp.js

let recorder;
let recordingCount = 0;

// button - function
const recordBtn = document.getElementById('recordButton');
const stopBtn = document.getElementById('stopButton');
const audioContainer = document.getElementById('audioContainer');

recordBtn.addEventListener('click', () => {
    // init, link to recordingBus
    if (!recorder) {
        // c and recordingBus [same] as ones in audiogenerator.js
        recorder = new Recorder(recordingBus, { numChannels: 2 });
    }

    if (c.state === 'suspended') {
        c.resume();
    }

    recorder.clear();
    recorder.record();
    
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    console.log("Recording live...");
});

stopBtn.addEventListener('click', () => {
    recorder.stop();
    recordBtn.disabled = false;
    stopBtn.disabled = true;

    // Num adding auto
    recordingCount++;

    recorder.exportWAV((blob) => {
        const url = URL.createObjectURL(blob);
        const fileName = `recording_${recordingCount}.wav`;
        
        // a countainer of records
        const itemWrapper = document.createElement('div');
        itemWrapper.className = 'audio-item';
        itemWrapper.style.marginBottom = "10px";

        // create recorder
        const audio = document.createElement('audio');
        audio.controls = true;
        audio.src = url;
        audio.title = fileName;

        audio.className = 'RecordPlayer';
        
        // add labels(Nums)
        const label = document.createElement('span');
        label.innerText = ` No.${recordingCount} `;
        label.style.fontWeight = "bold";

        itemWrapper.appendChild(label);
        itemWrapper.appendChild(audio);

        audioContainer.appendChild(itemWrapper);
        
        console.log(`Added Record No.${recordingCount}`);
    });
});