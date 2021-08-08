import React, {useContext} from 'react';
import './ChordInterface.css';
import { VoiceContext } from '../../App';
import MidiNoteConverter from '../../utils/MidiNoteConverter';
function ChordInterface () {
    const voiceContext = useContext(VoiceContext);
    // console.log(voiceContext.voiceState.voice)
    const voiceCopy = JSON.parse(JSON.stringify(voiceContext.voiceState.voice))
    const midiNotes = MidiNoteConverter(voiceCopy)
    return (
        <div className="chordInterface">
            <h1>Current Chord: {voiceContext.voiceState.chord}</h1>
            {midiNotes}
        </div>
    )
}
export default ChordInterface;