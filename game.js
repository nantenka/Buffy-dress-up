// ------------------ State ------------------
let outfitState = { head: 0, body: 0, legs: 0 }; // index current
let animProgress = { head: 1, body: 1, legs: 1 }; // 0..1 animation progress (1 = finished)
const animDuration = 300; // ms
let lastTimestamp = 0;

let images = {}; // loaded images
let nickname = "";

// ------------------ Clothes (filenames without .png) ------------------
const headList = ["g1","g2","g3","g4"];
const bodyList = ["t1","t2","t3","t4"];
const legsList = ["s1","s2","s3","s4"];
const baseName = "base"; // images/base.png expected

// ------------------ DOM ------------------
const startBtn = document.getElementById("startBtn");
const doneBtn = document.getElementById("doneBtn");
const confirmBtn = document.getElementById("confirmBtn");
const saveBtn = document.getElementById("saveBtn");

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const exportCanvas = document.getElementById("exportCanvas");
const exportCtx = exportCanvas.getContext("2d");

const screenMenu = document.getElementById("screen_menu");
const screenGame = document.getElementById("screen_game");
const screenFinal = document.getElementById("screen_final");

// ------------------ Utility: show screen ------------------
function showScreen(screenEl){
  [screenMenu, screenGame, screenFinal].forEach(s => s.classList.remove("active"));
  screenEl.classList.add("active");
}

// ------------------ Preload images ------------------
function loadImage(name){
  return new Promise(res => {
    const img = new Image();
    img.onload = () => { images[name] = img; res(); };
    img.onerror = () => { console.warn("Failed to load:", name); images[name] = null; res(); };
    img.src = `images/${name}.png`;
  });
}

async function preloadAll(){
  const list = [baseName, ...headList, ...bodyList, ...legsList];
  await Promise.all(list.map(n => loadImage(n)));
}

// ------------------ Drawing helpers ------------------
function drawStaticCharacter(ctx, x=150, y=50, scale=1.5){
  // Draw base
  if(images[baseName]) ctx.drawImage(images[baseName], x, y, 200*scale, 400*scale);

  // Draw items without animation (used for export / final)
  const headImg = images[ headList[outfitState.head] ];
  const bodyImg = images[ bodyList[outfitState.body] ];
  const legsImg = images[ legsList[outfitState.legs] ];

  if(headImg) ctx.drawImage(headImg, x, y, 200*scale, 400*scale);
  if(bodyImg) ctx.drawImage(bodyImg, x, y, 200*scale, 400*scale);
  if(legsImg) ctx.drawImage(legsImg, x, y, 200*scale, 400*scale);
}

function drawAnimatedCharacter(ctx, x=150, y=50, scale=1.5){
  ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);

  // draw base first
  if(images[baseName]) ctx.drawImage(images[baseName], x, y, 200*scale, 400*scale);

  // helper to draw one layer with progress
  function drawLayer(list, idx, progress){
    const img = images[list[idx]];
    if(!img) return;
    if(progress >= 1){
      ctx.globalAlpha = 1;
      ctx.drawImage(img, x, y, 200*scale, 400*scale);
      ctx.globalAlpha = 1;
    } else {
      // easing (smooth)
      const p = easeOutCubic(progress);
      ctx.globalAlpha = p;
      const offsetY = -20 * (1 - p); // appear from above
      ctx.drawImage(img, x, y + offsetY, 200*scale, 400*scale);
      ctx.globalAlpha = 1;
    }
  }

  drawLayer(headList, outfitState.head, animProgress.head);
  drawLayer(bodyList, outfitState.body, animProgress.body);
  drawLayer(legsList, outfitState.legs, animProgress.legs);
}

// simple ease
function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

// ------------------ Animation loop ------------------
function tick(ts){
  if(!lastTimestamp) lastTimestamp = ts;
  const dt = ts - lastTimestamp;
  lastTimestamp = ts;

  // progress animations
  ["head","body","legs"].forEach(k=>{
    if(animProgress[k] < 1){
      animProgress[k] += dt / animDuration;
      if(animProgress[k] > 1) animProgress[k] = 1;
    }
  });

  // render interactive canvas (with animation)
  drawAnimatedCharacter(ctx, 150, 50, 1.5);

  requestAnimationFrame(tick);
}

// ------------------ Switch clothes (trigger animation) ------------------
function switchClothes(category, dir){
  if(category === "head"){
    outfitState.head = (outfitState.head + dir + headList.length) % headList.length;
    animProgress.head = 0;
  } else if(category === "body"){
    outfitState.body = (outfitState.body + dir + bodyList.length) % bodyList.length;
    animProgress.body = 0;
  } else if(category === "legs"){
    outfitState.legs = (outfitState.legs + dir + legsList.length) % legsList.length;
    animProgress.legs = 0;
  }
}

// ------------------ Event listeners ------------------
// arrows
document.getElementById("headLeft").onclick = ()=> switchClothes("head",-1);
document.getElementById("headRight").onclick = ()=> switchClothes("head",1);
document.getElementById("bodyLeft").onclick = ()=> switchClothes("body",-1);
document.getElementById("bodyRight").onclick = ()=> switchClothes("body",1);
document.getElementById("legsLeft").onclick = ()=> switchClothes("legs",-1);
document.getElementById("legsRight").onclick = ()=> switchClothes("legs",1);

// start
startBtn.onclick = () => {
  showScreen(screenGame);
  // ensure canvas renders immediately
  drawAnimatedCharacter(ctx, 150, 50, 1.5);
};

// done -> final
doneBtn.onclick = () => {
  showScreen(screenFinal);

  // trigger pedestal fade/scale animation class
  exportCanvas.classList.remove("active");
  setTimeout(()=> exportCanvas.classList.add("active"), 60);

  // draw final static composition
  drawFinal();
};

// confirm / add nickname (do not auto-save)
confirmBtn.onclick = () => {
  nickname = document.getElementById("nickname").value.trim() || "Player";
  drawFinal();
};

// save png
saveBtn.onclick = () => {
  // ensure final is drawn
  drawFinal();
  const link = document.createElement("a");
  link.download = "buffy.png";
  link.href = exportCanvas.toDataURL("image/png");
  link.click();
};

// ------------------ Draw final (export) ------------------
function drawFinal(){
  exportCtx.clearRect(0,0, exportCanvas.width, exportCanvas.height);

  // background gradient
  const grad = exportCtx.createLinearGradient(0,0,0,600);
  grad.addColorStop(0,"#0f0c29");
  grad.addColorStop(0.5,"#302b63");
  grad.addColorStop(1,"#24243e");
  exportCtx.fillStyle = grad;
  exportCtx.fillRect(0,0,600,600);

  // neon pedestal (glow)
  exportCtx.save();
  exportCtx.fillStyle = "#00ff99";
  exportCtx.shadowColor = "#00ffe0";
  exportCtx.shadowBlur = 30;
  exportCtx.fillRect(100,500,400,40);
  exportCtx.restore();

  // draw character statically (no animation)
  drawStaticCharacter(exportCtx, 150, 100, 1.5);

  // nickname text
  exportCtx.save();
  exportCtx.font = "28px Arial";
  exportCtx.fillStyle = "#0ff";
  exportCtx.textAlign = "center";
  exportCtx.shadowColor = "#0ff";
  exportCtx.shadowBlur = 12;
  exportCtx.fillText(nickname || "Player", exportCanvas.width/2, 470);
  exportCtx.restore();
}

// ------------------ Init ------------------
(async function init(){
  await preloadAll();
  // start render loop
  requestAnimationFrame(tick);
  // initial static draw in case user doesn't animate
  drawAnimatedCharacter(ctx, 150, 50, 1.5);
})();
