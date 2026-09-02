import { useState } from 'react';
import FileLoadArea from './FileLoadArea';
import ScalableCanvas from './ScalableCanvas';

export default function ImageManipulatorParent(){
    const [img, setImg] = useState("");
    // TODO: make the temp canvas hidden later
    return (
        <>
        <FileLoadArea imgCallback={setImg}/>
        <div id="imgPreview"></div>
        <ScalableCanvas/>
        <canvas id="tempCanvas"></canvas> 
        </>
    )
}