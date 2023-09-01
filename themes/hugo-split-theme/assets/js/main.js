import * as params from '@params';

let imgs = params.Album
function scrollImages(event) {
    event.target.style.backgroundImage = "url(/image/"+imgs[Math.floor(Math.random() * imgs.length)]+")";
}

const imageDiv = document.getElementsByClassName('split-image')[0];
imageDiv.onclick = scrollImages;
