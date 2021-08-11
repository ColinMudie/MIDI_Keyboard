import React, { useContext } from 'react';
import './ChordButton.css';
import { VoiceContext } from '../../App';
import Minor9 from '../../utils/Minor9';

function ChordButton (props) {
    const voiceContext = useContext(VoiceContext);
    let chordUpdate = () => {};
    switch (props.name) {
        case 'C min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({type: 'CHORD', chord: Minor9.C.name});
                voiceContext.voiceDispatch({type: 'CHORD_NOTES', chordNotes: Minor9.C.notes });
            }
            break;
        case 'Db min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.Db.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.Db.notes });
            }
            break;
        case 'D min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.D.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.D.notes });
            }
            break;
        case 'Eb min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.Eb.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.Eb.notes });
            }
            break;
        case 'E min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.E.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.E.notes });
            }
            break;
        case 'F min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.F.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.F.notes });
            }
            break;
        case 'Gb min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.Gb.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.Gb.notes });
            }
            break;
        case 'G min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.G.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.G.notes });
            }
            break;
        case 'Ab min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.Ab.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.Ab.notes });
            }
            break;
        case 'A min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.A.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.A.notes });
            }
            break;
        case 'Bb min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.Bb.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.Bb.notes });
            }
            break;
        case 'B min9':
            chordUpdate = () => {
                voiceContext.voiceDispatch({ type: 'CHORD', chord: Minor9.B.name });
                voiceContext.voiceDispatch({ type: 'CHORD_NOTES', chordNotes: Minor9.B.notes });
            }
            break;
        default:
            break;
    }

    return (
        <button onClick={chordUpdate}>{props.name}</button>
    )
}
export default ChordButton;