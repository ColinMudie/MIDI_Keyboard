import './App.css';
import WhiteKeys from './components/WhiteKeys/WhiteKeys';
import BlackKeys from './components/BlackKeys/BlackKeys';

function App() {
  var voices = [];
  var AudioContext;
  var audioCtx;
  var compressor;
  var volumeNode;

  function initAudio() {
    AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext({
      latencyHint: "interactive",
      sampleRate: 44100,
    });
    volumeNode = audioCtx.createGain();
    volumeNode.gain.value = 0.1;
    compressor = audioCtx.createDynamicsCompressor();
    volumeNode.connect(compressor);
    compressor.connect(audioCtx.destination);
    console.log(`initialize audio`);
  }

    initAudio();

  //checks to see if WebMIDI is supported by the current browser
  if (navigator.requestMIDIAccess) {
    console.log('This browser supports WebMIDI!');
  } else {
    console.log('WebMIDI is not supported in this browser');
  }

  navigator.requestMIDIAccess()
    .then(onMIDISuccees, onMIDIFailure);

  function onMIDISuccees(midiAccess) {
    console.log(audioCtx);
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    for (var input of midiAccess.inputs.values())
      input.onmidimessage = getMIDIMessage;
  }
  function onMIDIFailure() {
    console.log('Could not access your MIDI devices');
  }

  function getMIDIMessage(midiMessage) {
    console.log(midiMessage);
    var command = midiMessage.data[0];
    var note = midiMessage.data[1];
    var velocity = (midiMessage.data.length > 2) ? midiMessage.data[2] : 0;
    switch (command) {
      case 151: // noteOn
        if (velocity > 0) {
          noteOn(note, velocity);
        } else {
          noteOff(note);
        }
        break;
      case 135: // noteOff
        noteOff(note);
        break;
      default:
        break;
    }
  }

  function noteOn(note, velocity) {
    console.log(`note on: ${note}`);
    if (voices[note] == null) {
      voices[note] = new Voice(note, velocity);
      var currentNote = document.getElementById(`k${note}`);
      if (currentNote) {
        currentNote.classList.add("pressed")
      }
    }
  }

  function noteOff(note) {
    if (voices[note] != null) {
      voices[note].noteOff();
      voices[note] = null;
      var currentNote = document.getElementById(`k${note}`);
      if (currentNote) {
        currentNote.classList.remove("pressed")
      }
    }
  }

  function frequencyFromNoteNumber(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
  }

  function Voice(note, velocity) {
    this.originalFrequency = frequencyFromNoteNumber(note);
    
    //Oscillator
    this.osc = audioCtx.createOscillator();
    this.osc.frequency.value = this.originalFrequency;
    this.osc.type = "sine";

    //Modulator
    // this.modulator = audioCtx.createOscillator();
    // this.modulator.frequency.value = this.originalFrequency;
    // this.modulator.detune.value= 200;
    // this.modulatorGain = audioCtx.createGain();
    // this.modulatorGain.value = 3000;
    // this.modulator.connect(this.modulatorGain);
    // this.modulatorGain.connect(this.osc.detune);

    // Oscillator Gain 'VCA'
    this.oscGain = audioCtx.createGain();
    this.oscGain.gain.value = 0.05 + (0.33 * velocity);
    this.osc.connect(this.oscGain);

    //Filter
    this.filter = audioCtx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.Q.value = 10;
    this.filter.frequency.value = 300;
    this.oscGain.connect(this.filter);

    this.env = {
      attack: 0.05,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1,
    };
    this.envelope = audioCtx.createGain();
    this.filter.connect(this.envelope);
    

    let now = audioCtx.currentTime;
    this.envelope.connect(volumeNode);
    this.osc.start(now);
    // this.modulator.start(now);
    this.noteOn();
  }
  Voice.prototype.noteOn = function () {
    let now = audioCtx.currentTime;
    this.easing = 0.005;
    this.envelope.gain.cancelScheduledValues(now)
    this.envelope.gain.setValueAtTime(0, now + this.easing);
    this.envelope.gain.linearRampToValueAtTime(
      1,
      now + this.env.attack + this.easing
    );
    this.envelope.gain.linearRampToValueAtTime(
      this.env.sustain,
      now + this.env.attack + this.env.decay + this.easing
    );
  }


  Voice.prototype.noteOff = function () {
    let now = audioCtx.currentTime;
    let release = 0.005 + 0.1;

    this.envelope.gain.cancelScheduledValues(now);
    // this.envelope.gain.setValueAtTime(this.envelope.gain.value, now);
    this.envelope.gain.setTargetAtTime(0, now, release);

    // this.osc.stop(now + release);
    // this.modulator.stop(now + release);
    setTimeout(()=> {
      this.osc.disconnect();
      console.log('osc killed');
    }, 10000);
  }

  return (
    <div className="App">
      <h1>MIDI Keyboard</h1>
      <button onClick={initAudio}>Begin</button>
      <BlackKeys/>
      <WhiteKeys/>
    </div>
    
  );
}

export default App;
