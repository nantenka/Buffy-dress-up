// ------------------ State ------------------
let outfitState = { head: 0, body: 0, legs: 0 };
let animating = { head: false, body: false, legs: false };
let images = {};
let nickname = "";

// ------------------ Clothes ------------------
const headList = ["g1","g2","g3","g4"];
const bodyList = ["t1","t2","t3","t4"];
const legsList = ["s1","s2","s3","s4"];
const baseGirl = "base";

// ------------------ Canvas ------------------
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const exportCanvas = document.getElementById("exportCanvas");
const exportCtx = exportCanvas.getContext("2d");

// ------------------ Screens ------------------
const mainScreen = document.getElementById("screen_menu");
const gameScreen = document.getElementById("screen_game");
const finalScreen = document.getElementById("screen_final");

function show(screen){
  mainScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  finalScreen.classList.remove("active");
  screen.classList.add("active");
}

// ------------------ Load images ------------------
function loadImages(list){
  const promises = list.map(src => new Promise(res=>{
    const img = new Image();
    img.onload = ()=>{ images[src]=img; res(); };
    img.onerror = ()=>{ console.warn("Missing:",src); images[src]=null; res(); };
    img.src = "images/"+src+".png";
  }));
  return Promise.all(promises);
}

// ------------------ Draw character ------------------
function drawCharacter(ctx, x, y, scale=1){
  ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);

  if(images[baseGirl])
    ctx.drawImage(images[baseGirl], x, y, 200*scale, 400*scale);

  drawItem(ctx, headList[outfitState.head], x, y, scale, animating.head);
  drawItem(ctx, bodyList[outfitState.body], x, y, scale, animating.body);
  drawItem(ctx, legsList[outfitState.legs], x, y, scale, animating.legs);
}

function drawItem(ctx, src, x, y, scale, animate){
  const img = images[src];
  if(!img) return;

  if(animate){
    let start = null;
    function animStep(ts){
      if(!start) start = ts;
      const p = Math.min((ts-start)/300,1);
      ctx.globalAlpha = p;
      ctx.drawImage(img, x, y - 20*(1-p), 200*scale, 400*scale);
      ctx.globalAlpha = 1;

      if(p < 1) requestAnimationFrame(animStep);
    }
    requestAnimationFrame(animStep);
  } else {
    ctx.drawImage(img, x, y, 200*scale, 400*scale);
  }
}

// ------------------ Switch clothes ------------------
function switchClothes(category, dir){
  if(category === "head"){
    animating.head = true;
    outfitState.head = (outfitState.head + dir + headList.length) % headList.length;
  }
  if(category === "body"){
    animating.body = true;
    outfitState.body = (outfitState.body + dir + bodyList.length) % bodyList.length;
  }
  if(category === "legs"){
    animating.legs = true;
    outfitState.legs = (outfitState.legs + dir + legsList.length) % legsList.length;
  }

  drawCharacter(ctx, 150, 50, 1.5);
}

// ------------------ Buttons ------------------
document.getElementById("headLeft").onclick = ()=>switchClothes("head",-1);
document.getElementById("headRight").onclick = ()=>switchClothes("head",1);

document.getElementById("bodyLeft").onclick = ()=>switchClothes("body",-1);
document.getElementById("bodyRight").onclick = ()=>switchClothes("body",1);

document.getElementById("legsLeft").onclick = ()=>switchClothes("legs",-1);
document.getElementById("legsRight").onclick = ()=>switchClothes("legs",1);

// Start button
document.getElementById("startBtn").onclick = ()=> show(gameScreen);

// Done → final screen
document.getElementById("doneBtn").onclick = ()=>{
  show(finalScreen);

  exportCanvas.classList.remove("active");
  setTimeout(()=>exportCanvas.classList.add("active"),50);

  drawFinal();
};

// Confirm nickname
document.getElementById("confirmBtn").onclick = ()=>{
  nickname = document.getElementById("nickname").value || "Player";
  drawFinal();
};

// Save PNG
document.getElementById("saveBtn").onclick = ()=> savePNG();

// ------------------ Final Screen Draw ------------------
function drawFinal(){
  exportCtx.clearRect(0,0,600,600);

  const grad = exportCtx.createLinearGradient(0,0,0,600);
  grad.addColorStop(0,"#0f0c29");
  grad.addColorStop(0.5,"#302b63");
  grad.addColorStop(1,"#24243e");
  exportCtx.fillStyle = grad;
  exportCtx.fillRect(0,0,600,600);

  exportCtx.fillStyle = "#00ff99";
  exportCtx.shadowColor = "#00ffe0";
  exportCtx.shadowBlur = 30;
  exportCtx.fillRect(100,500,400,40);
  exportCtx.shadowBlur = 0;

  drawCharacter(exportCtx, 150, 100, 1.5);

  exportCtx.font = "28px Arial";
  exportCtx.fillStyle = "#0ff";
  exportCtx.shadowColor = "#0ff";
  exportCtx.shadowBlur = 10;
  exportCtx.fillText(nickname, 220, 470);
  exportCtx.shadowBlur = 0;
}

// ------------------ Save PNG ------------------
function savePNG(){
  const link = document.createElement("a");
  link.download = "buffi.png";
  link.href = exportCanvas.toDataURL();
  link.click();
}

// ------------------ Preload ------------------
async function preload(){
  await loadImages([baseGirl, ...headList, ...bodyList, ...legsList]);
  drawCharacter(ctx, 150, 50, 1.5);
}

preload();
