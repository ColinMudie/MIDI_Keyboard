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
    volumeNode.gain.value = 0.5;
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
      console.log(voices);
    }
  }

  function noteOff(note) {
    if (voices[note] != null) {
      console.log(voices);
      voices[note].noteOff();
      voices[note] = null;
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
    this.osc.type = "square";

    // Oscillator Gain 'VCA'
    this.oscGain = audioCtx.createGain();
    this.oscGain.gain.value = 0.05 + (0.33 * velocity);
    this.osc.connect(this.oscGain);

    //Filter
    this.filter = audioCtx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.Q.value = 0;
    this.filter.frequency.value = 400;
    this.oscGain.connect(this.filter);

    this.envelope = audioCtx.createGain();
    this.filter.connect(this.envelope);
    this.envelope.connect(volumeNode);

    var now = audioCtx.currentTime;
    this.envelope.gain.value = 0.0;
    this.envelope.gain.setValueAtTime(0.0, now);
    this.envelope.gain.linearRampToValueAtTime(1.0, (now + 0.5));
    this.envelope.gain.setTargetAtTime(10, (now + 0.5), (10 + 0.001));

    this.osc.start(0);
  }

  Voice.prototype.noteOff = function () {
    var now = audioCtx.currentTime;
    var release = now + 0.5;

    this.envelope.gain.cancelScheduledValues(now);
    this.envelope.gain.setValueAtTime(this.envelope.gain.value, now);
    this.envelope.gain.setTargetAtTime(0.0, now, release);

    this.osc.stop(release);
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
