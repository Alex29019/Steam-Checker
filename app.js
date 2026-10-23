const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const activeSessions = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [id, lastSeen] of activeSessions.entries()) {
        if (now - lastSeen > 30000) activeSessions.delete(id);
    }
}, 10000);

const sharedAccounts = [
    { game: "BeamNG.drive", login: "beamngdrive123steam1", password: "Kte!22ijaAII12" },
    { game: "Kingdom Come Deliverance 2", login: "mosgq70379", password: "oeldf55726" },
    { game: "UNCHARTED: Legacy of Thieves", login: "uncharted_st", password: "UNCHARTED@8804" },
    { game: "Forza Horizon 4", login: "nmsukt191", password: "batzaza191" },
    { game: "Black Myth Wukong", login: "gfk66337", password: "Acp234213" },
    { game: "Grand Theft Auto 5", login: "0855j9", password: "zZ10301030" },
    { game: "Marvel's Spider Man 2", login: "groggymovement4", password: "DCN_LliOQhv" },
    { game: "Red Dead Redemption 2", login: "ynysa422", password: "@Gamerspace123" },
    { game: "NBA 2K20", login: "rnmiike", password: "THEGODMIKE1" },
    { game: "Marvel's Spider Man Remastered", login: "mklvn2y9", password: "zhizhure1221" },
    { game: "Hogwarts Legacy", login: "nicasacracacenri", password: "EBA9Y59KGCTB" },
    { game: "Resident Evil 7 Biohazard", login: "jocuriargenrinia", password: "70Games.net92" },
    { game: "Grand Theft Auto 4", login: "wqm322495", password: "ac7QPfa3" },
    { game: "Horizon Forbidden West", login: "vonterr", password: "889162" },
    { game: "Cyberpunk 2077", login: "orderlyinoculat", password: "axQUk8etMajK" },
    { game: "Dying Light 2 Stay Human", login: "earthlnwza5566", password: "2G6TEM5ZAZC6" },
    { game: "Euro Truck Simulator 2", login: "nfpprsq3h", password: "f1qslg5kp" },
    { game: "Atomic Heart", login: "wf6ju3bf5wc3", password: "qKnh6N9SLiMxyvXVX36d" },
    { game: "Forza Horizon 5", login: "bej01201", password: "Bejdw11201" },
    { game: "Call Of Duty Modern Warfare 2", login: "dimkoxd", password: "2G6TEM5ZAZC6" },
    { game: "Mortal Kombat 11", login: "steam123z17", password: "ZXCVBNMQQ" },
    { game: "Mortal Kombat 1", login: "Mortalk1pehkflt01", password: "TGVBFRETt01" },
    { game: "Farming Simulator 25", login: "neylavewe1985", password: "wFbmEcKQ" },
    { game: "FIFA 22", login: "xxyenlover", password: "34cv56BN" },
    { game: "Terraria", login: "quincypugy", password: "0Heh%v4SSG" },
    { game: "Hearts Of Iron 4", login: "meteprotr", password: "3D88ASX2AMCG" },
    { game: "Ведьмак 3: Дикая Охота", login: "thnavud1", password: "0641769856Za" },
    { game: "Call Of Duty Modern Warfare 2019", login: "soham123419", password: "Funpay-0nibist" },
    { game: "The Forest", login: "hhied98481", password: "Deaiwoq217" },
    { game: "Detroit: Become Human", login: "Detroit_st", password: "DETROIT@7401" }
];

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steam Tools</title>
    <style>
        :root {
            --bg: #0a0b10; --card: rgba(27, 30, 38, 0.7); --text: #e0e0e0;
            --text-muted: #8b92a1; --accent: #66c0f4; --accent-glow: rgba(102, 192, 244, 0.3);
            --ok: #00ff88; --err: #ff3355; --warn: #ffaa00; --tg: #2AABEE;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            background-image: radial-gradient(circle at 10% 20%, rgba(102, 192, 244, 0.08) 0%, transparent 40%),
                              radial-gradient(circle at 90% 80%, rgba(255, 51, 85, 0.05) 0%, transparent 40%);
            color: var(--text); display: flex; justify-content: center; align-items: center;
            min-height: 100vh; padding: 20px;
        }
        .container {
            background: var(--card); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
            padding: 2.5rem; border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
            width: 100%; max-width: 420px; text-align: center; position: relative;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-tabs { display: flex; gap: 8px; margin-bottom: 1.5rem; background: rgba(15, 16, 20, 0.6); padding: 4px; border-radius: 12px; }
        .nav-tab { flex: 1; padding: 10px; text-align: center; border-radius: 8px; cursor: pointer; font-weight: 600; color: var(--text-muted); transition: 0.2s; font-size: 0.9rem; }
        .nav-tab.active { background: var(--accent); color: #0a0b10; }
        
        .view-section { display: none; }
        .view-section.active { display: block; animation: fadeIn 0.3s ease; }

        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        h2 { margin: 0; color: var(--accent); text-transform: uppercase; font-size: 1.1rem; letter-spacing: 2px; font-weight: 700; }
        .online-badge { display: flex; align-items: center; gap: 6px; background: rgba(0, 255, 136, 0.1); color: var(--ok); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; border: 1px solid rgba(0, 255, 136, 0.2); }
        .online-dot { width: 8px; height: 8px; background: var(--ok); border-radius: 50%; animation: pulse 2s infinite; }
        
        .input-group { position: relative; margin-bottom: 1.2rem; }
        input { width: 100%; padding: 14px 16px; background: rgba(15, 16, 20, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; color: white; font-size: 1rem; outline: none; transition: all 0.3s ease; }
        input::placeholder { color: var(--text-muted); }
        input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); background: rgba(15, 16, 20, 0.9); }
        
        button.action-btn { width: 100%; padding: 14px; margin-top: 0.5rem; background: linear-gradient(135deg, var(--accent) 0%, #4a9fd4 100%); color: #0a0b10; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(102, 192, 244, 0.2); }
        button.action-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 192, 244, 0.4); }
        button.action-btn:active:not(:disabled) { transform: translateY(0); }
        button.action-btn:disabled { background: #2a2e38; color: #666; cursor: not-allowed; box-shadow: none; }
        
        #result { margin-top: 1.5rem; padding: 14px; border-radius: 10px; font-weight: 700; font-size: 1rem; display: none; animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); text-transform: uppercase; letter-spacing: 1px; }
        .success { background: rgba(0, 255, 136, 0.1); color: var(--ok); border: 1px solid rgba(0, 255, 136, 0.3); }
        .error { background: rgba(255, 51, 85, 0.1); color: var(--err); border: 1px solid rgba(255, 51, 85, 0.3); }
        .captcha { background: rgba(255, 170, 0, 0.1); color: var(--warn); border: 1px solid rgba(255, 170, 0, 0.3); text-transform: none; letter-spacing: 0; font-weight: 600; font-size: 0.95rem; }
        
        #captchaSection { display: none; margin-top: 1.5rem; padding: 1.2rem; background: rgba(15, 16, 20, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); animation: slideDown 0.4s ease; }
        #captchaSection p { margin: 0 0 10px 0; color: var(--warn); font-size: 0.9rem; font-weight: 600; }
        #captchaImage { max-width: 100%; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1); background: #fff; }
        
        .accounts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-top: 1rem; max-height: 400px; overflow-y: auto; padding-right: 4px; }
        .accounts-grid::-webkit-scrollbar { width: 6px; }
        .accounts-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .account-card { background: rgba(15, 16, 20, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 16px 12px; text-align: center; cursor: pointer; transition: all 0.2s; }
        .account-card:hover { border-color: var(--accent); transform: translateY(-2px); background: rgba(102, 192, 244, 0.05); }
        .account-card h3 { font-size: 0.9rem; margin: 0; color: var(--text); font-weight: 600; line-height: 1.3; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(6px); display: none; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
        .modal-overlay.active { display: flex; }
        .modal-content { background: var(--card); padding: 2rem; border-radius: 16px; width: 100%; max-width: 380px; border: 1px solid rgba(255,255,255,0.1); animation: popIn 0.3s ease; text-align: left; }
        .modal-title { text-align: center; color: var(--accent); font-size: 1.2rem; font-weight: 700; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 1px; }
        .copy-row { display: flex; gap: 8px; margin-bottom: 12px; align-items: center; }
        .copy-row label { width: 70px; font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
        .copy-row input { flex: 1; margin: 0; font-family: monospace; font-size: 0.9rem; padding: 10px 12px; }
        .copy-btn { width: auto; padding: 10px 16px; margin: 0; background: rgba(255,255,255,0.1); color: var(--text); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; font-size: 0.85rem; }
        .copy-btn:hover { background: var(--accent); color: #0a0b10; border-color: var(--accent); }
        .close-modal { width: 100%; padding: 12px; margin-top: 1rem; background: rgba(255, 51, 85, 0.1); color: var(--err); border: 1px solid rgba(255, 51, 85, 0.3); border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .close-modal:hover { background: rgba(255, 51, 85, 0.2); }

        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); margin: 2rem 0 1.5rem 0; }
        .tg-button { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px; background: linear-gradient(135deg, var(--tg) 0%, #229ED9 100%); color: white; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 1rem; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(42, 171, 238, 0.2); }
        .tg-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(42, 171, 238, 0.4); }
        .tg-button svg { width: 20px; height: 20px; fill: currentColor; }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(0, 255, 136, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="nav-tabs">
            <div class="nav-tab active" id="checkerTab" onclick="switchTab('checker')">Проверка</div>
            <div class="nav-tab" id="accountsTab" onclick="switchTab('accounts')">Общие аккаунты</div>
        </div>

        <div id="checkerView" class="view-section active">
            <div class="header">
                <h2>Проверка аккаунта</h2>
                <div class="online-badge"><div class="online-dot"></div><span id="onlineCount">0</span></div>
            </div>
            <div class="input-group"><input type="text" id="username" placeholder="Логин Steam" autocomplete="off"></div>
            <div class="input-group"><input type="password" id="password" placeholder="Пароль"></div>
            <button id="checkBtn" class="action-btn" onclick="checkAccount()">Проверить</button>
            
            <div id="captchaSection">
                <p>Введите код с картинки:</p>
                <img id="captchaImage" src="" alt="CAPTCHA">
                <input type="text" id="captchaText" placeholder="Введите код" style="margin-top: 0;">
                <button class="action-btn" onclick="submitWithCaptcha()" style="margin-top: 10px; background: linear-gradient(135deg, var(--warn) 0%, #e69500 100%);">Отправить с капчей</button>
            </div>
            <div id="result"></div>
        </div>

        <div id="accountsView" class="view-section">
            <div class="header">
                <h2>Общие аккаунты</h2>
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">Нажми на игру, чтобы получить данные для входа</p>
            <div class="accounts-grid" id="accountsGrid"></div>
        </div>

        <div class="divider"></div>
        <a href="https://t.me/MirArenDaff" target="_blank" class="tg-button">
            <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.319.016.101.017.204.011.285z"/></svg>
            Подпишись (:
        </a>
    </div>

    <div class="modal-overlay" id="accountModal" onclick="if(event.target === this) closeModal()">
        <div class="modal-content">
            <div class="modal-title" id="modalGameTitle">Game Name</div>
            
            <div class="copy-row">
                <label>Логин:</label>
                <input type="text" id="modalLogin" readonly>
                <button class="copy-btn" id="copyLoginBtn" onclick="copyToClipboard('modalLogin', 'copyLoginBtn')">Копировать</button>
            </div>
            
            <div class="copy-row">
                <label>Пароль:</label>
                <input type="text" id="modalPassword" readonly>
                <button class="copy-btn" id="copyPasswordBtn" onclick="copyToClipboard('modalPassword', 'copyPasswordBtn')">Копировать</button>
            </div>

            <button class="close-modal" onclick="closeModal()">Закрыть</button>
        </div>
    </div>

    <script>
        function switchTab(tab) {
            document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.nav-tab').forEach(el => el.classList.remove('active'));
            document.getElementById(tab + 'View').classList.add('active');
            document.getElementById(tab + 'Tab').classList.add('active');
            if (tab === 'accounts') renderAccounts();
        }

        function renderAccounts() {
            const grid = document.getElementById('accountsGrid');
            grid.innerHTML = sharedAccounts.map((acc, index) => \`
                <div class="account-card" onclick="openAccountModal(\${index})">
                    <h3>\${acc.game}</h3>
                </div>
            \`).join('');
        }

        function openAccountModal(index) {
            const acc = sharedAccounts[index];
            document.getElementById('modalGameTitle').textContent = acc.game;
            document.getElementById('modalLogin').value = acc.login;
            document.getElementById('modalPassword').value = acc.password;
            document.getElementById('copyLoginBtn').textContent = 'Копировать';
            document.getElementById('copyPasswordBtn').textContent = 'Копировать';
            document.getElementById('accountModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('accountModal').classList.remove('active');
        }

        function copyToClipboard(elementId, btnId) {
            const el = document.getElementById(elementId);
            el.select();
            el.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(el.value).then(() => {
                const btn = document.getElementById(btnId);
                const originalText = btn.textContent;
                btn.textContent = '✓ Скопировано';
                btn.style.background = 'var(--ok)';
                btn.style.color = '#0a0b10';
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                }, 1500);
            });
        }

        let currentCaptchaGid = '-1';
        let cooldownTimer = null;
        const COOLDOWN_SECONDS = 15;
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) { sessionId = Math.random().toString(36).substring(2, 15); sessionStorage.setItem('sessionId', sessionId); }

        function pingServer() {
            fetch('/ping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId }) }).catch(() => {});
        }
        setInterval(pingServer, 10000); pingServer();

        function updateOnlineCount() {
            fetch('/stats').then(r => r.json()).then(data => { document.getElementById('onlineCount').textContent = data.online; }).catch(() => {});
        }
        setInterval(updateOnlineCount, 5000); updateOnlineCount();

        function startCooldown() {
            const btn = document.getElementById('checkBtn');
            let remaining = COOLDOWN_SECONDS;
            btn.disabled = true; btn.textContent = 'Подождите ' + remaining + 'с...';
            if (cooldownTimer) clearInterval(cooldownTimer);
            cooldownTimer = setInterval(() => {
                remaining--;
                if (remaining <= 0) { clearInterval(cooldownTimer); cooldownTimer = null; btn.disabled = false; btn.textContent = 'Проверить'; }
                else { btn.textContent = 'Подождите ' + remaining + 'с...'; }
            }, 1000);
        }

        async function checkAccount() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');
            
            if (!u || !p) { res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block'; return; }
            
            btn.disabled = true; btn.textContent = 'Проверка...'; res.style.display = 'none';
            document.getElementById('captchaSection').style.display = 'none';
            
            try {
                const response = await fetch('/check', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p, captcha_gid: '-1', captcha_text: '' })
                });
                const data = await response.json();
                if (data.status === 'captcha') {
                    currentCaptchaGid = data.captcha_gid;
                    document.getElementById('captchaImage').src = '/api/captcha/' + currentCaptchaGid;
                    document.getElementById('captchaSection').style.display = 'block';
                    res.className = 'captcha'; res.textContent = 'Требуется капча'; res.style.display = 'block';
                } else if (data.status === 'success') {
                    res.className = 'success'; res.textContent = 'Аккаунт работает'; res.style.display = 'block';
                } else {
                    res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block';
                }
            } catch (error) {
                res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block';
            } finally { startCooldown(); }
        }

        async function submitWithCaptcha() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const captchaText = document.getElementById('captchaText').value;
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');
            
            if (!captchaText) { res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block'; return; }
            
            btn.disabled = true; btn.textContent = 'Проверка...'; res.style.display = 'none';
            
            try {
                const response = await fetch('/check', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p, captcha_gid: currentCaptchaGid, captcha_text: captchaText })
                });
                const data = await response.json();
                if (data.status === 'captcha') {
                    document.getElementById('captchaImage').src = '/api/captcha/' + data.captcha_gid + '?t=' + Date.now();
                    document.getElementById('captchaText').value = '';
                    res.className = 'captcha'; res.textContent = 'Неверная капча, попробуйте снова'; res.style.display = 'block';
                } else if (data.status === 'success') {
                    document.getElementById('captchaSection').style.display = 'none';
                    res.className = 'success'; res.textContent = 'Аккаунт работает'; res.style.display = 'block';
                } else {
                    document.getElementById('captchaSection').style.display = 'none';
                    res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block';
                }
            } catch (error) {
                res.className = 'error'; res.textContent = 'Аккаунт не работает'; res.style.display = 'block';
            } finally { startCooldown(); }
        }
    </script>
</body>
</html>
`;

function buildRSAPublicKeyPEM(modHex, expHex) {
    const modBuf = Buffer.from(modHex, 'hex');
    const expBuf = Buffer.from(expHex, 'hex');
    function derLength(len) {
        if (len < 128) return Buffer.from([len]);
        const bytes = []; let l = len;
        while (l > 0) { bytes.unshift(l & 0xff); l >>= 8; }
        return Buffer.from([0x80 | bytes.length, ...bytes]);
    }
    function derTag(tag, content) { return Buffer.concat([Buffer.from([tag]), derLength(content.length), content]); }
    function derInteger(buf) {
        if (buf.length > 0 && (buf[0] & 0x80)) buf = Buffer.concat([Buffer.from([0x00]), buf]);
        return derTag(0x02, buf);
    }
    function derSequence(items) { return derTag(0x30, Buffer.concat(items)); }
    function derBitString(content) { return derTag(0x03, Buffer.concat([Buffer.from([0x00]), content])); }
    function derOid(oidBytes) { return derTag(0x06, oidBytes); }
    function derNull() { return Buffer.from([0x05, 0x00]); }

    const rsaPublicKey = derSequence([derInteger(modBuf), derInteger(expBuf)]);
    const algorithmIdentifier = derSequence([derOid(Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01])), derNull()]);
    const subjectPublicKeyInfo = derSequence([algorithmIdentifier, derBitString(rsaPublicKey)]);
    const b64 = subjectPublicKeyInfo.toString('base64');
    return `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
}

async function checkSteamCredentials(username, password, captchaGid = '-1', captchaText = '') {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://steamcommunity.com/login/home/?goto=',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://steamcommunity.com', 'X-Requested-With': 'XMLHttpRequest'
    };

    let rsaData, sessionCookies = '';
    try {
        const rsaResponse = await axios.get('https://steamcommunity.com/login/getrsakey', { params: { username }, headers, timeout: 10000 });
        rsaData = rsaResponse.data;
        if (rsaResponse.headers['set-cookie']) {
            sessionCookies = rsaResponse.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }
    } catch (error) { return { status: 'error', message: 'Аккаунт не работает' }; }

    if (!rsaData.success) return { status: 'error', message: 'Аккаунт не работает' };

    let encryptedPasswordB64;
    try {
        const publicKeyPem = buildRSAPublicKeyPEM(rsaData.publickey_mod, rsaData.publickey_exp);
        const encrypted = crypto.publicEncrypt({ key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(password, 'utf-8'));
        encryptedPasswordB64 = encrypted.toString('base64');
    } catch (error) { return { status: 'error', message: 'Аккаунт не работает' }; }

    const payload = new URLSearchParams({
        username, password: encryptedPasswordB64, twofactorcode: '', emailauth: '', loginfriendlyname: '',
        captchagid: captchaGid, captcha_text: captchaText, emailsteamid: '', rsatimestamp: rsaData.timestamp,
        remember_login: 'false', donotcache: Date.now().toString()
    });

    const loginHeaders = { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' };
    if (sessionCookies) loginHeaders['Cookie'] = sessionCookies;

    let loginData;
    try {
        const loginResponse = await axios.post('https://steamcommunity.com/login/dologin/', payload.toString(), { headers: loginHeaders, timeout: 10000 });
        loginData = loginResponse.data;
    } catch (error) { return { status: 'error', message: 'Аккаунт не работает' }; }

    if (loginData.success) return { status: 'success', message: 'Аккаунт работает' };
    if (loginData.captcha_needed) {
        return { status: 'captcha', message: 'Требуется капча', captcha_gid: loginData.captcha_gid || '-1' };
    }
    return { status: 'error', message: 'Аккаунт не работает' };
}

app.get('/', (req, res) => res.send(HTML_TEMPLATE));

app.get('/api/captcha/:gid', async (req, res) => {
    try {
        const response = await axios.get(`https://steamcommunity.com/login/rendercaptcha/?gid=${req.params.gid}`, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            timeout: 10000
        });
        res.set('Content-Type', 'image/jpeg');
        res.send(response.data);
    } catch (e) {
        res.status(500).send('Ошибка загрузки капчи');
    }
});

app.post('/ping', (req, res) => {
    if (req.body.sessionId) activeSessions.set(req.body.sessionId, Date.now());
    res.json({ ok: true });
});

app.get('/stats', (req, res) => res.json({ online: activeSessions.size }));

app.post('/check', async (req, res) => {
    const { username, password, captcha_gid, captcha_text } = req.body;
    if (!username || !password) return res.json({ status: 'error', message: 'Аккаунт не работает' });
    const result = await checkSteamCredentials(username.trim(), password.trim(), captcha_gid || '-1', captcha_text || '');
    res.json(result);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Сервер запущен на порту ${PORT}`));
