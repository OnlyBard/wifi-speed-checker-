const ipEl = document.getElementById("ip");
const ispEl = document.getElementById("isp");
const locEl = document.getElementById("loc");
let fullIP = "";
let masked = true;

fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(d => {
    fullIP = d.ip;
    ipEl.textContent = maskIP(fullIP);
    ispEl.textContent = d.org || "—";
    locEl.textContent = `${d.city}, ${d.country}`;
  });

function maskIP(ip) {
  return ip.replace(/\d+$/, "***");
}

document.getElementById("ipToggle").onclick = () => {
  masked = !masked;
  ipEl.textContent = masked ? maskIP(fullIP) : fullIP;
};

document.getElementById("startTest").onclick = async () => {
  runSpeedTest();
};

async function runSpeedTest() {
  measureDownload();
  measureUpload();
  measurePing();
}

async function measureDownload() {
  const start = performance.now();
  await fetch("https://speed.cloudflare.com/__down?bytes=5000000", { cache: "no-store" });
  const time = (performance.now() - start) / 1000;
  document.getElementById("download").textContent =
    (40 / time).toFixed(2);
}

async function measureUpload() {
  const data = new Uint8Array(3 * 1024 * 1024);
  const start = performance.now();
  await fetch("https://speed.cloudflare.com/__up", {
    method: "POST",
    body: data
  });
  const time = (performance.now() - start) / 1000;
  document.getElementById("upload").textContent =
    (24 / time).toFixed(2);
}

async function measurePing() {
  const pings = [];
  for (let i = 0; i < 5; i++) {
    const s = performance.now();
    await fetch("https://www.cloudflare.com/cdn-cgi/trace", { cache: "no-store" });
    pings.push(performance.now() - s);
  }
  const avg = pings.reduce((a,b)=>a+b)/pings.length;
  const jitter = Math.max(...pings) - Math.min(...pings);
  document.getElementById("ping").textContent = avg.toFixed(0);
  document.getElementById("jitter").textContent = jitter.toFixed(0);
}
