// Uses a public LibreSpeed instance
// You can swap for a different server if needed

const server = "https://pc.speedtest.plos.org/speedtest";

// download & upload variables
let dlResult = 0, ulResult = 0;

function runLibreSpeed() {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `${server}/speedtest-config.php`;
    script.onload = () => {
      const settings = speedtestConfig;
      const client = speedtestClient(settings, {
        onupdate: (data) => {
          document.getElementById("phase").innerText = data.progressText;
          document.getElementById("liveSpeed").innerText = data.currentSpeed.toFixed(1);
          drawNeedle(Math.min(data.currentSpeed, 100));
        },
        onend: (data) => {
          dlResult = data.download;
          ulResult = data.upload;
          resolve({ download: dlResult, upload: ulResult });
        }
      });
      client.start();
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}
