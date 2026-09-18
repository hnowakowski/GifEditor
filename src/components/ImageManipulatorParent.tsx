import { useState } from 'react';
import type { ParsedGif, ParsedFrame } from 'gifuct-js';
import FileLoadArea from './FileLoadArea';
import ScalableCanvas from './ScalableCanvas';

export default function ImageManipulatorParent(){
    const [gif, setGif] = useState<ParsedGif>();
    const [frames, setFrames] = useState<ParsedFrame[]>()
    return (
        <>
        <FileLoadArea gifCallback={setGif} framesCallback={setFrames} globalGif={gif} globalFrames={frames}/>
        <div id="imgPreview"></div>
        <ScalableCanvas/>
        <canvas id="currentStateCanvas" hidden></canvas> 
        <canvas id="deltaCanvas" hidden></canvas>
        <img id="output"></img>
        </>
    )
}