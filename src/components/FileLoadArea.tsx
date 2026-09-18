import { parseGIF, decompressFrames, type ParsedGif, type ParsedFrame } from "gifuct-js";

const fr = new FileReader();

function readFile(gifCallback: Function, framesCallback: Function){
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
                gifCallback(gif); // update global gif
                currentStateCanvas.height = gif.lsd.height;
                currentStateCanvas.width = gif.lsd.width;
                const frames = decompressFrames(gif, true);
                // frame.patch is essentially the raw uint8array with difference color info
                framesCallback(frames); // update global frames array
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
            }
        })
    }
    else{
        alert("no file!");
    }
}

function serializeGif(globalFrames?: ParsedFrame[]){
        if(!globalFrames){
            alert("Frames not parsed yet!");
            return;
        }

        // jsgif
        var gifOut = new (window as any).GIFEncoder(); //hacky way of including jsgif
        // it's recommended to be included in the index html file so i'm grabbing it from there
        gifOut.setRepeat(0);
        gifOut.setDelay(globalFrames[0].delay);
        gifOut.start();
        for (var i = 0; i < globalFrames.length; i++){
                const c = document.getElementById("c"+i)! as HTMLCanvasElement;
                const ctx = c.getContext("2d")!;
                gifOut.addFrame(ctx);
                console.log("frame "+ i);
        }
        gifOut.finish();
        gifOut.download("download.gif");
}

interface FileLoadAreaProps{
    gifCallback: React.Dispatch<React.SetStateAction<ParsedGif | undefined>>;
    framesCallback: React.Dispatch<React.SetStateAction<ParsedFrame[] | undefined>>;
    globalGif?: ParsedGif;
    globalFrames?: ParsedFrame[];
}

export default function FileLoadArea(props: FileLoadAreaProps){
    return (
        <>
            <input type="file" accept=".gif" id="fileUpload"
            onChange={() => {readFile(props.gifCallback, props.framesCallback)}} />
            <button onClick={() => {serializeGif(props.globalFrames)}}>DOWNLOAD</button>
        </>
    )
}