/* ======================
   IP INFO (SAFE)
====================== */

const ipEl = document.getElementById("ip");
const ispEl = document.getElementById("isp");
const locEl = document.getElementById("loc");
let fullIP = "";
let ipHidden = true;

fetch("https://ipapi.co/json/")
  .then(r => r.json())
  .then(d => {
    fullIP = d.ip || "";
    ispEl.textContent = d.org || "—";
    locEl.textContent = `${d.city || ""}, ${d.country || ""}`;
  });

document.getElementById("ipToggle").onclick = () => {
  ipHidden = !ipHidden;
  ipEl.textContent = ipHidden ? "Hidden" : fullIP;
  document.getElementById("ipToggle").innerText =
    ipHidden ? "Show" : "Hide";
};

/* ======================
   SPEEDOMETER
====================== */

const canvas = document.getElementById("speedometer");
const ctx = canvas.getContext("2d");

function drawGauge(value, max = 100) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const centerX = canvas.width / 2;
  const centerY = canvas.height;
  const radius = 110;

  ctx.lineWidth = 10;
  ctx.strokeStyle = "#222";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, 0);
  ctx.stroke();

  const angle = Math.PI + (value / max) * Math.PI;
  ctx.strokeStyle = "#e10600";
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, Math.PI, angle);
  ctx.stroke();
}

/* ======================
   SPEED TEST LOGIC
====================== */

const speedText = document.getElementById("speedValue");
const modeText = document.getElementById("mode");

async function testDownload() {
  modeText.textContent = "DOWNLOAD";
  let samples = [];

  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    await fetch("https://speed.cloudflare.com/__down?bytes=15000000", {
      cache: "no-store"
    });
    const time = (performance.now() - start) / 1000;
    const speed = (120 / time); // Mbps approx
    samples.push(speed);
  }

  return average(samples);
}

async function testUpload() {
  modeText.textContent = "UPLOAD";
  let samples = [];
  const data = new Uint8Array(10 * 1024 * 1024);

  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    await fetch("https://speed.cloudflare.com/__up", {
      method: "POST",
      body: data
    });
    const time = (performance.now() - start) / 1000;
    const speed = (80 / time);
    samples.push(speed);
  }

  return average(samples);
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

async function measurePing() {
  let times = [];
  for (let i = 0; i < 5; i++) {
    const s = performance.now();
    await fetch("https://www.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
    times.push(performance.now() - s);
  }
  document.getElementById("ping").textContent =
    Math.round(average(times));
  document.getElementById("jitter").textContent =
    Math.round(Math.max(...times) - Math.min(...times));
}

document.getElementById("startTest").onclick = async () => {
  speedText.textContent = "0.0";
  drawGauge(0);

  const down = await testDownload();
  animateSpeed(down);

  const up = await testUpload();
  animateSpeed(up);

  measurePing();
};

function animateSpeed(target) {
  let current = 0;
  const interval = setInterval(() => {
    current += target / 40;
    speedText.textContent = current.toFixed(1);
    drawGauge(Math.min(current, 100));
    if (current >= target) clearInterval(interval);
  }, 25);
}
