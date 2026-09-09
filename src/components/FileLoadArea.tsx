import { parseGIF, decompressFrames } from "gifuct-js";
//import { GIFEncoder, quantize, applyPalette } from "gifenc";
//import {GIFEncoder } from "gif.js"; 

const fr = new FileReader();

function readFile(imgCallback: Function){
    const imgPreview = document.getElementById("imgPreview") as HTMLImageElement;
    const fileUpload = document.getElementById("fileUpload") as HTMLInputElement;

    // hidden "master" canvas that is updated on each frame
    // its current state is later copied onto every canvas representing their respective frame
    const currentStateCanvas = document.getElementById("currentStateCanvas") as HTMLCanvasElement;
    const currentStateCtx = currentStateCanvas.getContext("2d")!;

    // each frame records data for the delta after the previous frame
    // represents an updated patch of the image to be later overlaid over the current state
    const deltaCanvas = document.getElementById("deltaCanvas") as HTMLCanvasElement;
    const deltaCtx = deltaCanvas.getContext("2d")!;

    if (imgPreview && fileUpload && fileUpload.files && currentStateCanvas){
        fr.readAsArrayBuffer(fileUpload.files[0]);
        fr.addEventListener("load", () => {
            const buffer = fr.result as ArrayBuffer;
            if (buffer){
                // decode into pngs
                const gif = parseGIF(buffer);
                currentStateCanvas.height = gif.lsd.height;
                currentStateCanvas.width = gif.lsd.width;
                const frames = decompressFrames(gif, true);
                // frame.patch is essentially the raw uint8array with difference color info
                
                let imageData;
                for (let i = 0; i < frames.length; i++){
                    const dims = frames[i].dims;
                    
                    if (!imageData || deltaCanvas.width != dims.width || deltaCanvas.height != dims.height){
                        deltaCanvas.width = dims.width;
                        deltaCanvas.height = dims.height;
                        imageData = deltaCtx.createImageData(dims.width, dims.height);
                    }
                    imageData.data.set(frames[i].patch);
                    deltaCtx.putImageData(imageData, 0, 0);

                    // disposal type 1 (most common) means delta, type 2 means full wipe
                    if (i > 0){
                        if (frames[i-1].disposalType ===  2) {
                            const { width, height, left, top } = frames[i-1].dims;
                            currentStateCtx.clearRect(left, top, width, height);
                            console.log("Canvas wiped at " + i);
                        }
                    }
                    
                    currentStateCtx.drawImage(deltaCanvas, dims.left, dims.top);
                    
                    // create new canvas and copy frame image from current state
                    const canvas = document.createElement("canvas");
                    canvas.setAttribute("id", "c"+i);
                    canvas.width = gif.lsd.width;
                    canvas.height = gif.lsd.height;
                    const ctx = canvas.getContext("2d")!;
                    ctx.drawImage(currentStateCanvas, 0, 0);
                    imgPreview.appendChild(canvas);
                }
                // TODO: try jsgif???
                var gifOut = new (window as any).GIFEncoder();
                gifOut.setRepeat(0);
                gifOut.setDelay(frames[0].delay);
                gifOut.start();
                for (var i = 0; i < frames.length; i++){
                        const c = document.getElementById("c"+i)! as HTMLCanvasElement;
                        const ctx = c.getContext("2d")!;
                        gifOut.addFrame(ctx);
                        console.log("frame "+ i);
                }
                gifOut.finish();
                gifOut.download("download.gif");

                // gifjs
                // var gifOut = new GIFEncoder();
                // gifOut.writeHeader();
                // gifOut.setRepeat(0); //infinite loop
                // gifOut.setDelay(frames[0].delay);

                // for (var i = 0; i < frames.length; i++){
                //     const c = document.getElementById("c"+i)! as HTMLCanvasElement;
                //     const ctx = c.getContext("2d")!;
                //     gifOut.addFrame(ctx.getImageData(0, 0, gif.lsd.width, gif.lsd.height).data);
                //     console.log("frame "+ i);
                // }
                // gifOut.finish();
                // const outBuffer = Uint8Array.from(gifOut.stream().getData());
                // console.log(outBuffer);
                // // outImg.src = thing;


                // gifenc !!!!
                // // encode back into a gif
                // const gifOut = GIFEncoder();
                // for (var i = 0; i < frames.length; i++){
                //     const c = document.getElementById("c"+i)! as HTMLCanvasElement;
                //     const ctx = c.getContext("2d")!;
                //     const frameData = new Uint8Array(ctx.getImageData(0, 0, gif.lsd.width, gif.lsd.height).data.buffer);

                //     const format = "rgb444";
                //     const palette = quantize(frameData, 256, {format});
                //     const index = applyPalette(frameData, palette, format);
                //     const delay = frames[i].delay;

                //     gifOut.writeFrame(index, gif.lsd.width, gif.lsd.height, {palette, delay});
                //     console.log("frame "+ i);
                // }
                // gifOut.finish();

                // // Get the Uint8Array output of your binary GIF file
                // const output = gifOut.bytes();
                // console.log(output);
                // // TODO: fix the output format because it's not being displayed properly
                // const outImg = document.getElementById("output") as HTMLImageElement;
                // const blobObj = new Blob(output, {type: 'image/gif'});
                // console.log(blobObj);
                // const thing = URL.createObjectURL(blobObj);
                // outImg.src = thing;
                // const anchor = document.createElement("a");
                // anchor.href = thing;
                // anchor.download = 'poop.gif';
                // anchor.click();
            }
            


        })
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