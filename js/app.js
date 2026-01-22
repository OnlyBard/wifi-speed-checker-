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
const c=document.getElementById("meter");
const ctx=c.getContext("2d");

function drawNeedle(val){
  ctx.clearRect(0,0,c.width,c.height);
  const cx=c.width/2, cy=c.height-10, r=140;

  ctx.strokeStyle="#222";
  ctx.lineWidth=10;
  ctx.beginPath();
  ctx.arc(cx,cy,r,Math.PI,0);
  ctx.stroke();

  const a=Math.PI+(val/100)*Math.PI;
  ctx.strokeStyle="#e10600";
  ctx.beginPath();
  ctx.arc(cx,cy,r,Math.PI,a);
  ctx.stroke();
}

const live=document.getElementById("liveSpeed");
const phase=document.getElementById("phase");

async function test(type){
  let speeds=[];
  for(let i=0;i<5;i++){
    const size = type==="down"?20:10;
    const start=performance.now();
    await fetch(`https://speed.cloudflare.com/__${type}?bytes=${size*1024*1024}`,{
      method:type==="up"?"POST":"GET",
      body:type==="up"?new Uint8Array(size*1024*1024):null,
      cache:"no-store"
    });
    const t=(performance.now()-start)/1000;
    speeds.push((size*8)/t);
  }
  return speeds.reduce((a,b)=>a+b)/speeds.length;
}

function animate(target){
  let v=0;
  const i=setInterval(()=>{
    v+=target/40;
    live.textContent=v.toFixed(1);
    drawNeedle(Math.min(v,100));
    if(v>=target) clearInterval(i);
  },25);
}

document.getElementById("start").onclick=async()=>{
  document.getElementById("final").classList.add("hidden");

  phase.textContent="Download";
  const d=await test("down");
  animate(d);

  phase.textContent="Upload";
  const u=await test("up");
  animate(u);

  localStorage.setItem("down",d.toFixed(1));
  localStorage.setItem("up",u.toFixed(1));

  document.getElementById("finalDown").textContent=d.toFixed(1);
  document.getElementById("finalUp").textContent=u.toFixed(1);
  document.getElementById("final").classList.remove("hidden");

  phase.textContent="Complete";
};
