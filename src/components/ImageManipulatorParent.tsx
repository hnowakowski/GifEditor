import { useState } from 'react';
import ImageLoadButton from './ImageLoadBtn';
import ScalableCanvas from './ScalableCanvas';

function ImageManipulatorParent(){
    const [img, setImg] = useState("");
    
    return (
        <>
        <ImageLoadButton imgCallback={setImg}/>
        <img id="imgPreview"></img>
        <ScalableCanvas/>
        </>
    )
}

export default ImageManipulatorParent;