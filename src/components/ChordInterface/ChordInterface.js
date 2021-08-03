import React, {useContext} from 'react';
import './ChordInterface.css';
import { VoiceContext } from '../../App';
function ChordInterface () {
    const voiceContext = useContext(VoiceContext);
    // const [state, dispatch] = useVoiceContext();
    // console.log(state)
    return (
        <div className="chordInterface">
            {voiceContext.voiceState}
        </div>
    )
}
export default ChordInterface;