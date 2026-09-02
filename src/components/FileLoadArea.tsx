import { parseGIF, decompressFrames } from "gifuct-js";

const fr = new FileReader();

function readFile(imgCallback: Function){
    const imgPreview = document.getElementById("imgPreview") as HTMLImageElement;
    const fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
    const tempCanvas = document.getElementById("tempCanvas") as HTMLCanvasElement;
    const tempCtx = tempCanvas.getContext("2d");
    if (imgPreview && fileUpload && fileUpload.files && tempCanvas && tempCtx){
        fr.readAsArrayBuffer(fileUpload.files[0]);
        fr.addEventListener("load", ()=>{
            const buffer = fr.result as ArrayBuffer;
            if (buffer){
                const gif = parseGIF(buffer);
                const frames = decompressFrames(gif, true);
                // frame.patch is essentially the raw uint8array with difference color info
                console.log(frames.length);
                let imageData;
                for (let i = 0; i < frames.length; i++){
                    const dims = frames[i].dims; //very rarely the library misreads dimension data
                    if (dims.width === 1 && dims.height === 1 && dims.top !== 0 && dims.left !== 0){
                        dims.width += dims.left;
                        dims.height += dims.top;
                        dims.top = 0;
                        dims.left = 0;
                    }

                    const canvas = document.createElement("canvas");
                    canvas.setAttribute("id", "c"+i);
                    const ctx = canvas.getContext("2d");
                    
                    // preparing image entity(?) with a temp canvas
                    canvas.width = dims.width;
                    canvas.height = dims.height;
                    
                    if (!imageData || tempCanvas.width != dims.width || tempCanvas.height != dims.height){
                        // if (!imageData)
                        //     console.log("poop img data" + i);
                        // if (tempCanvas.width != dims.width)
                        //     console.log("poop width" + i);
                        // if (tempCanvas.height != dims.height)
                        //     console.log("poop height" + i);
                        tempCanvas.width = dims.width;
                        tempCanvas.height = dims.height;
                        imageData = tempCtx.createImageData(dims.width, dims.height);
                    }
                    // if(frames[i].disposalType !== 1){
                    //     console.log("Disposal type " + frames[i].disposalType + " at " + i);
                    // }
                    console.log(frames[i].transparentIndex + " " + i);
                    console.log(frames[i].patch);

                    imageData.data.set(frames[i].patch);
                    tempCtx.putImageData(imageData, 0, 0);

                    ctx?.drawImage(tempCanvas, dims.left, dims.top);
                    imgPreview.appendChild(canvas);
                }
                //
            }
        })


        // SINGLE IMAGE TEST
        // fr.readAsDataURL(fileUpload.files[0]);
        // fr.addEventListener("load", () => {
        //     const url = fr.result as string;
        //     if (url){
        //         imgPreview.src = url;
        //         imgCallback(url);
        //         console.log("updated image!");
        //         //console.log(url);
        //     }
        // })
    }
    else{
        alert("no file!");
    }
}

interface FileLoadAreaProps{
    imgCallback: React.Dispatch<React.SetStateAction<string>>
}

export default function FileLoadArea({imgCallback}: FileLoadAreaProps){
    return (
        <input type="file" accept=".gif" id="fileUpload"
         onChange={() => {readFile(imgCallback)}} />
    )
}