/* IP INFO */
let fullIP="", hidden=true;
const ipEl=document.getElementById("ip");

fetch("https://ipapi.co/json/")
.then(r=>r.json())
.then(d=>{
  fullIP=d.ip;
  document.getElementById("isp").textContent=d.org;
  document.getElementById("loc").textContent=d.city+", "+d.country;
});

document.getElementById("ipBtn").onclick=()=>{
  hidden=!hidden;
  ipEl.textContent=hidden?"Hidden":fullIP;
};

/* SPEEDOMETER */
const canvas=document.getElementById("meter");
const ctx=canvas.getContext("2d");

function drawNeedle(val) {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  const cx = canvas.width/2, cy = canvas.height-10, r=140;

  ctx.lineWidth=10;
  ctx.strokeStyle="#222";
  ctx.beginPath();
  ctx.arc(cx,cy,r,Math.PI,0);
  ctx.stroke();

  const angle=Math.PI+(val/100)*Math.PI;
  ctx.strokeStyle="#e10600";
  ctx.beginPath();
  ctx.arc(cx,cy,r,Math.PI,angle);
  ctx.stroke();
}

document.getElementById("start").onclick=async () => {
  document.getElementById("final").classList.add("hidden");

  const { download, upload } = await runLibreSpeed();

  document.getElementById("finalDown").textContent=download.toFixed(1);
  document.getElementById("finalUp").textContent=upload.toFixed(1);

  localStorage.setItem("down", download.toFixed(1));
  localStorage.setItem("up", upload.toFixed(1));

  document.getElementById("final").classList.remove("hidden");
};
