import * as params from '@params';

let imgs = params.Album
function scrollImages(event) {
    let targetImage = imgs[Math.floor(Math.random() * imgs.length)];
    event.target.style.backgroundImage = "url(/image/"+targetImage.name+")";
    if (targetImage.position) {
        event.target.style.backgroundPosition = targetImage.position;
    } else {
        event.target.style.backgroundPosition = "center";
    }
}

const imageDiv = document.getElementsByClassName('split-image')[0];
imageDiv.onclick = scrollImages;

// Cache all the images on the page in the background
imgs.forEach((element) => {
    var images = new Array();
    var i = new Image();
    i.src = element;
    images.push(i);
});