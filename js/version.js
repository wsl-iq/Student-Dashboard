const CURRENT_VERSION = '1.0.0';
const VERSION_URL = 'https://raw.githubusercontent.com/wsl-iq/Student-Dashboard/refs/heads/main/version.txt';
const CHECK_INTERVAL = 5000;

function isNewerVersion(server, current) {
    const s = server.split('.').map(Number);
    const c = current.split('.').map(Number);
    for (let i = 0; i < Math.max(s.length, c.length); i++) {
        const sv = s[i] || 0;
        const cv = c[i] || 0;
        if (sv > cv) return true;
        if (sv < cv) return false;
    }
    return false;
}

function showUpdateMessage(serverVersion) {
    const btn = document.getElementById('update-btn');
    const currentSpan = document.getElementById('current-version');
    const serverSpan = document.getElementById('server-version');

    if (currentSpan) currentSpan.textContent = CURRENT_VERSION;
    if (serverSpan) serverSpan.textContent = serverVersion;

    if (btn) {
        btn.style.display = 'inline-block';
        btn.addEventListener('click', () => location.reload(true));
    }
}

function checkForUpdate() {
    fetch(VERSION_URL + '?t=' + Date.now())
        .then(res => res.text())
        .then(serverVersion => {
            const cleanVersion = serverVersion.trim();
            if (isNewerVersion(cleanVersion, CURRENT_VERSION)) {
                showUpdateMessage(cleanVersion);
            }
        })
        .catch(err => console.error('Version check error:', err));
}

checkForUpdate();
setInterval(checkForUpdate, CHECK_INTERVAL);
