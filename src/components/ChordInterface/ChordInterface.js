import React, {useContext} from 'react';
import './ChordInterface.css';
import { VoiceContext } from '../../App';
import MidiNoteConverter from '../../utils/MidiNoteConverter';
function ChordInterface () {
    const voiceContext = useContext(VoiceContext);
    return (
        <div className="chordInterface">
            {MidiNoteConverter(voiceContext.voiceState)}
        </div>
    )
}
export default ChordInterface;