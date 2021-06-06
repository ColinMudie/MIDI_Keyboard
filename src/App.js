import './App.css';

function App() {
  //checks to see if WebMIDI is supported by the current browser
  if (navigator.requestMIDIAccess) {
    console.log('This browser supports WebMIDI!');
  } else {
    console.log('WebMIDI is not supported in this browser');
  }

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
    console.log(midiMessage);
    var command = midiMessage.data[0];
    var note = midiMessage.data[1];
    var velocity = (midiMessage.data.length > 2) ? midiMessage.data[2] : 0;
    switch (command) {
      case 151: // noteOn
        if (velocity > 0){
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
    
  }

  function noteOff(note) {

  }

  return (
    <div className="App">
      <h1>MIDI Keyboard</h1>
    </div>
  );
}

export default App;
