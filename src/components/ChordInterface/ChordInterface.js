import React, { useContext } from 'react';
import './ChordInterface.css';
import { VoiceContext } from '../../App';
import MidiNoteConverter from '../../utils/MidiNoteConverter';
function ChordInterface () {
    const voiceContext = useContext(VoiceContext);
    const voiceCopy = JSON.parse(JSON.stringify(voiceContext.voiceState.voice))
    const midiNotes = MidiNoteConverter(voiceCopy)
    return (
        <div className="chordInterface">
            <h1>Play me this: {voiceContext.voiceState.chord}</h1>
            <p> the notes in this chord are: {voiceContext.voiceState.chordNotes}</p>
            {midiNotes}
        </div>
    )
}
export default ChordInterface;