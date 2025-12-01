// ====================== Screens ======================
const menuScreen = document.getElementById("screen_menu");
const gameScreen = document.getElementById("screen_game");
const finalScreen = document.getElementById("screen_final");

function show(screen) {
  menuScreen.classList.remove("active");
  gameScreen.classList.remove("active");
  finalScreen.classList.remove("active");

  screen.classList.add("active");
}

// ====================== Assets ======================
const character = new Image();
character.src = "images/base.png";

let headIndex = 0;
let bodyIndex = 0;
let legsIndex = 0;

const headList = ["g1.png","g2.png","g3.png","g4.png"];
const bodyList = ["t1.png","t2.png","t3.png","t4.png"];
const legsList = ["s1.png","s2.png","s3.png","s4.png"];

const loaded = {};

function loadAll() {
  const all = [];

  loaded.base = character;
  all.push(wait(character));

  headList.forEach(n => {
    const img = new Image();
    img.src = "images/" + n;
    loaded[n] = img;
    all.push(wait(img));
  });

  bodyList.forEach(n => {
    const img = new Image();
    img.src = "images/" + n;
    loaded[n] = img;
    all.push(wait(img));
  });

  legsList.forEach(n => {
    const img = new Image();
    img.src = "images/" + n;
    loaded[n] = img;
    all.push(wait(img));
  });

  return Promise.all(all);
}

function wait(img) {
  return new Promise(res => {
    img.onload = () => res();
  });
}

// ====================== Game Canvas ======================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

function drawCharacter(ctx, x=0, y=0, scale=1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.drawImage(loaded.base, 0, 0);

  ctx.drawImage(loaded[headList[headIndex]], 0, 0);
  ctx.drawImage(loaded[bodyList[bodyIndex]], 0, 0);
  ctx.drawImage(loaded[legsList[legsIndex]], 0, 0);

  ctx.restore();
}

function renderGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCharacter(ctx, 120, 40, 1.3);
}

// ====================== Final Canvas ======================
const exportCanvas = document.getElementById("exportCanvas");
const exportCtx = exportCanvas.getContext("2d");

// ====================== Controls ======================
document.getElementById("headLeft").onclick = () => { headIndex = (headIndex - 1 + headList.length) % headList.length; renderGame(); };
document.getElementById("headRight").onclick = () => { headIndex = (headIndex + 1) % headList.length; renderGame(); };

document.getElementById("bodyLeft").onclick = () => { bodyIndex = (bodyIndex - 1 + bodyList.length) % bodyList.length; renderGame(); };
document.getElementById("bodyRight").onclick = () => { bodyIndex = (bodyIndex + 1) % bodyList.length; renderGame(); };

document.getElementById("legsLeft").onclick = () => { legsIndex = (legsIndex - 1 + legsList.length) % legsList.length; renderGame(); };
document.getElementById("legsRight").onclick = () => { legsIndex = (legsIndex + 1) % legsList.length; renderGame(); };

// ====================== Main Flow ======================
document.getElementById("startBtn").onclick = () => {
  show(gameScreen);
  renderGame();
};

document.getElementById("doneBtn").onclick = () => {
  show(finalScreen);

  // Trigger appearance animation
  exportCanvas.classList.remove("active");
  setTimeout(() => exportCanvas.classList.add("active"), 50);

  // Draw final PNG
  exportCtx.clearRect(0, 0, exportCanvas.width, exportCanvas.height);

  // Background
  exportCtx.fillStyle = "#1a1d2e";
  exportCtx.fillRect(0, 0, 600, 600);

  // Pedestal
  exportCtx.fillStyle = "#ffffff22";
  exportCtx.fillRect(100, 500, 400, 40);

  // Character
  drawCharacter(exportCtx, 150, 100, 1.5);
};

// ====================== SAVE PNG ======================
document.getElementById("saveBtn").onclick = () => {
  const link = document.createElement("a");
  link.download = "buffy.png";
  link.href = exportCanvas.toDataURL();
  link.click();
};

// ====================== Confirm name ======================
document.getElementById("confirmBtn").onclick = () => {
  const name = document.getElementById("nickname").value.trim();
  if (!name) return;

  exportCtx.fillStyle = "white";
  exportCtx.font = "28px Arial";
  exportCtx.fillText(name, 20, 40);
};

// ====================== INIT ======================
loadAll().then(() => {
  console.log("All assets loaded!");
});
