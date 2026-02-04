document.addEventListener('DOMContentLoaded', () => {
    // --- IP Toggle Logic ---
    const toggleIpBtn = document.getElementById('toggle-ip');
    const ipVal = document.getElementById('ip-val');

    if (toggleIpBtn) {
        toggleIpBtn.addEventListener('click', () => {
            const isHidden = ipVal.classList.contains('hidden');
            ipVal.classList.toggle('hidden');
            toggleIpBtn.textContent = isHidden ? 'Hide' : 'Show';
        });
    }

    // --- Fetch Basic Network Info (Client-side only) ---
    const fetchNetworkInfo = async () => {
        try {
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            if (document.getElementById('isp-val')) {
                document.getElementById('isp-val').textContent = data.org || 'Unknown';
                document.getElementById('loc-val').textContent = `${data.city}, ${data.country}`;
                document.getElementById('ip-val').textContent = data.ip;
            }
        } catch (e) {
            console.error("Network info fetch failed (likely adblock).");
        }
    };
    fetchNetworkInfo();

    // --- Data Persistence ---
    const saveBtn = document.getElementById('save-results');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const dl = document.getElementById('dl-input').value;
            const ul = document.getElementById('ul-input').value;

            if (dl && ul) {
                const session = {
                    download: parseFloat(dl),
                    upload: parseFloat(ul),
                    timestamp: new Date().toISOString()
                };
                localStorage.setItem('stream_speed_data', JSON.stringify(session));
                document.getElementById('status-msg').textContent = "Results synced to local session.";
                document.getElementById('status-msg').style.color = "#4BB543";
            }
        });
    }

    // --- Guide Logic ---
    const loadBtn = document.getElementById('load-last-test');
    if (loadBtn) {
        loadBtn.addEventListener('click', generateRecommendations);
    }

    function generateRecommendations() {
        const rawData = localStorage.getItem('stream_speed_data');
        const output = document.getElementById('recommendation-output');
        const statsDisplay = document.getElementById('latest-stats');
        const platform = document.getElementById('platform-select').value;

        if (!rawData) {
            output.innerHTML = `<p class="text-red">No test data found. Please run speed test first.</p>`;
            return;
        }

        const data = JSON.parse(rawData);
        const ul = data.upload;

        statsDisplay.innerHTML = `
            <div class="meta-row"><span>Upload:</span> <span class="text-red">${ul} Mbps</span></div>
            <div class="meta-row"><span>Last Tested:</span> <span>${new Date(data.timestamp).toLocaleTimeString()}</span></div>
        `;

        let config = calculateStreamSettings(ul, platform);
        
        output.innerHTML = `
            <div class="rec-grid">
                <div class="rec-item"><h4>Resolution</h4><p>${config.res}</p></div>
                <div class="rec-item"><h4>Frame Rate</h4><p>${config.fps} FPS</p></div>
                <div class="rec-item"><h4>Target Bitrate</h4><p>${config.bitrate} Kbps</p></div>
                <div class="rec-item"><h4>Encoder Preset</h4><p>${config.preset}</p></div>
            </div>
            <div class="pro-tip">
                <strong>Engineer Note:</strong> ${config.note}
            </div>
        `;
    }

    function calculateStreamSettings(upload, platform) {
        // Engineering Rule: Never use more than 75% of available upload for stream
        const usableUl = upload * 1000 * 0.75; 

        if (usableUl >= 8000) {
            return {
                res: "1080p (High Fidelity)",
                fps: "60",
                bitrate: platform === 'twitch' ? "6000" : "8000",
                preset: "P5 - P7 (Slow/Quality)",
                note: "You have significant overhead. Focus on CPU/GPU encoding quality."
            };
        } else if (usableUl >= 5000) {
            return {
                res: "1080p / 720p",
                fps: "60",
                bitrate: "4500 - 5500",
                preset: "P4 (Medium)",
                note: "Stable for 1080p30 or 720p60. Avoid higher bitrates to prevent dropped frames."
            };
        } else if (usableUl >= 2500) {
            return {
                res: "720p",
                fps: "30",
                bitrate: "2500 - 3500",
                preset: "P3 (Fast)",
                note: "Limited bandwidth. 720p30 is the professional ceiling for this connection."
            };
        } else {
            return {
                res: "480p / SD",
                fps: "30",
                bitrate: "1500",
                preset: "P1 - P2 (Very Fast)",
                note: "Sub-optimal upload speed. Consider hardware upgrades before high-motion streaming."
            };
        }
    }
});
