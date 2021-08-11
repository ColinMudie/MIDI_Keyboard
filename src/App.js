import React, { useReducer, useEffect, useContext } from 'react';
import './App.css';
import WhiteKeys from './components/WhiteKeys/WhiteKeys';
import BlackKeys from './components/BlackKeys/BlackKeys';
import ChordInterface from './components/ChordInterface/ChordInterface';
import ChordButton from './components/ChordButton/ChordButton';

import MidiNoteConverter from './utils/MidiNoteConverter';
import minor9 from './utils/Minor9';

export const VoiceContext = React.createContext()
const initialState = {
  voice: [],
  chord: [],
  chordNotes: []
};
const reducer = (state, action) => {
  switch (action.type) {
    case 'VOICE':
      return {
        ...state,
        voice: action.voice
      }
    case 'CHORD':
      return {
        ...state,
        chord: action.chord
      };
    case 'CHORD_NOTES':
      return {
        ...state,
        chordNotes: action.chordNotes
      };
    case 'reset':
      return initialState;
    default:
      return initialState;
  }
}

function App() {
  const voiceContext = useContext(VoiceContext);
  const [state, dispatch] = useReducer(reducer, initialState);

  let voices = [];
  let currentVoices =[];
  let audioCtx;
  let volumeNode;
  let note;
  let goalChord;

  function initAudio() {
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext({
      latencyHint: "interactive",
      sampleRate: 48100,
    });
    volumeNode = audioCtx.createGain();
    volumeNode.gain.value = 0.1;
    volumeNode.connect(audioCtx.destination);
    console.log(`initialize audio`);
  }

  useEffect(() => {
    //checks to see if WebMIDI is supported by the current browser
    if (navigator.requestMIDIAccess) {
      console.log('This browser supports WebMIDI!');
    } else {
      console.log('WebMIDI is not supported in this browser');
    }
  }, []);
  

  navigator.requestMIDIAccess()
    .then(onMIDISuccees, onMIDIFailure);

  function onMIDISuccees(midiAccess) {
    for (var input of midiAccess.inputs.values())
      input.onmidimessage = getMIDIMessage;
    
  }
  function onMIDIFailure() {
    console.log('Could not access your MIDI devices');
  }

  function getMIDIMessage(midiMessage) {
    var command = midiMessage.data[0];
    note = midiMessage.data[1];
    var velocity = (midiMessage.data.length > 2) ? midiMessage.data[2] : 0;
    if (audioCtx !== undefined) {
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
  }

  function noteOn(note, velocity) {
    if (voices[note] == null) {
      voices[note] = new Voice(note, velocity);
      currentVoices.push(note);
      currentVoices.sort(function(a, b) { return a-b})
    
      var currentNote = document.getElementById(`k${note}`);
      //minor9.C needs to be a variable that will change based on the current chord asked to be played.

      if (currentNote && minor9.C.notes.includes(MidiNoteConverter(note))){
        currentNote.classList.add("correct")
      } else if (currentNote) {
        currentNote.classList.add("pressed")
      }
      console.log(currentVoices)
      dispatch({ type: 'VOICE', voice: currentVoices})
    }
  }

  function noteOff(note) {
    if (voices[note] !== null) {
      voices[note].noteOff();
      voices[note] = null;
      let noteIndex = currentVoices.findIndex(element => element === note);
      currentVoices.splice(noteIndex, 1);
      var currentNote = document.getElementById(`k${note}`);
      if (currentNote) {
        currentNote.classList.remove("pressed")
        currentNote.classList.remove("correct")
      }
      dispatch({type: 'VOICE', voice: currentVoices})
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
    this.filter.Q.value = 10;
    this.filter.frequency.value = 400;
    this.oscGain.connect(this.filter);

    this.env = {
      attack: 0.01,
      decay: 0.1,
      velocity: velocity,
      sustain: 0.1,
      release: 0.01,
    };
    this.envelope = audioCtx.createGain();
    this.filter.connect(this.envelope);
    
    let now = audioCtx.currentTime;
    this.compressor = audioCtx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-50, audioCtx.currentTime);
    this.compressor.knee.setValueAtTime(30, audioCtx.currentTime);
    this.compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
    this.compressor.attack.setValueAtTime(0, audioCtx.currentTime);
    this.compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

    this.envelope.connect(this.compressor);
    this.compressor.connect(volumeNode)
    this.osc.start(now);
    this.noteOn();
  }
  Voice.prototype.noteOn = function () {
    let now = audioCtx.currentTime;
    this.easing = 0.005;
    this.envelope.gain.cancelScheduledValues(now)
    this.envelope.gain.setValueAtTime(0, now + this.easing);
    this.envelope.gain.linearRampToValueAtTime(
      this.env.velocity,
      now + this.env.attack + this.easing
    );
    this.envelope.gain.linearRampToValueAtTime(
      this.env.velocity - this.env.sustain,
      now + this.env.attack + this.env.decay + this.easing
    );
  }

  Voice.prototype.noteOff = function () {
    let now = audioCtx.currentTime;
    this.envelope.gain.cancelScheduledValues(now);
    this.envelope.gain.setTargetAtTime(0, now, this.easing + this.env.release);
    setTimeout(()=> {
      this.osc.disconnect();
    }, 10000);
  }

  return (
    <VoiceContext.Provider value={{voiceState: state, voiceDispatch: dispatch}}>
    <div className="App">
      <h1>MIDI Keyboard</h1>
      <button className="startBtn" onClick={initAudio}>Begin</button>
        <ChordButton name={'C min9'} />
        <ChordButton name={'Db min9'} />
        <ChordButton name={'D min9'} />
        <ChordButton name={'Eb min9'} />
        <ChordButton name={'E min9'} />
        <ChordButton name={'F min9'} />
        <ChordButton name={'Gb min9'} />
        <ChordButton name={'G min9'} />
        <ChordButton name={'Ab min9'} />
        <ChordButton name={'A min9'} />
        <ChordButton name={'Bb min9'} />
        <ChordButton name={'B min9'} />
      <ChordInterface/>
      <BlackKeys/>
      <WhiteKeys/>
    </div>
    </VoiceContext.Provider>
  );
}

export default App;