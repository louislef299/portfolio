(()=>{var g=[{name:"IMG_0417.jpeg",position:"right center"},{name:"IMG_1594.jpeg"},{name:"4J8A0080.jpeg"},{name:"IMG_2579.jpeg",position:"right center"},{name:"IMG_5260.jpeg"},{name:"IMG_0057.jpeg"},{name:"IMG_4597.jpeg"},{name:"background.jpeg",position:"left center"},{name:"IMG_0628.jpeg"},{name:"IMG_0654.jpeg"},{name:"IMG_7826.jpeg"},{name:"IMG_9335.jpeg"}];var n=g;function i(e){let a=n[Math.floor(Math.random()*n.length)];e.target.style.backgroundImage="url(/image/"+a.name+")",a.position?e.target.style.backgroundPosition=a.position:e.target.style.backgroundPosition="center"}var r=document.getElementsByClassName("split-image")[0];r.onclick=i;n.forEach(e=>{var a=new Array,t=new Image;t.src=e,a.push(t)});})();