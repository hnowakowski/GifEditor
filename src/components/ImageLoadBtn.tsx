export default ImageLoadButton;

const fr = new FileReader();

function readFile(imgCallback: Function){
    const imgPreview = document.getElementById("imgPreview") as HTMLImageElement;
    const fileUpload = document.getElementById("fileUpload") as HTMLInputElement;
    if (imgPreview && fileUpload && fileUpload.files){
        fr.readAsDataURL(fileUpload.files[0]);
        fr.addEventListener("load", () => {
            const url = fr.result as string;
            if (url){
                imgPreview.src = url;
                imgCallback(url);
                console.log("updated image!");
                console.log(url);
            }
        })
    }
    else{
        alert("no file!");
    }


}

interface ImageLoadButtonProps{
    imgCallback: React.Dispatch<React.SetStateAction<string>>
}

function ImageLoadButton({imgCallback}: ImageLoadButtonProps){
    return (
        <input type="file" accept=".png,.jpg,.jpeg,.gif" id="fileUpload"
         onChange={() => {readFile(imgCallback)}} />
    )
}