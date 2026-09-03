import { useState } from 'react';
import FileLoadArea from './FileLoadArea';
import ScalableCanvas from './ScalableCanvas';

export default function ImageManipulatorParent(){
    const [img, setImg] = useState("");
    return (
        <>
        <FileLoadArea imgCallback={setImg}/>
        <div id="imgPreview"></div>
        <ScalableCanvas/>
        <canvas id="currentStateCanvas" hidden></canvas> 
        <canvas id="deltaCanvas" hidden></canvas>
        </>
    )
}