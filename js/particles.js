const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let enabled = true;

function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
window.addEventListener("resize", resize);

const particles = Array.from({ length: 60 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 2 + 1,
  dx: Math.random() * 0.3,
  dy: Math.random() * 0.3
}));

function draw() {
  if (!enabled) return;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.fillStyle = "rgba(225,6,0,0.15)";
  particles.forEach(p => {
    p.x += p.dx;
    p.y += p.dy;
    if (p.x > canvas.width) p.x = 0;
    if (p.y > canvas.height) p.y = 0;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();

document.getElementById("toggleBg").onclick = () => {
  enabled = !enabled;
  document.getElementById("toggleBg").innerText =
    `Background: ${enabled ? "ON" : "OFF"}`;
  if (!enabled) ctx.clearRect(0,0,canvas.width,canvas.height);
  else draw();
};
