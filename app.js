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

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steam Checker</title>
    <style>
        :root {
            --bg: #050508;
            --surface: rgba(12, 12, 18, 0.6);
            --surface-2: rgba(18, 18, 26, 0.8);
            --border: rgba(255, 255, 255, 0.06);
            --text: #e8e8f0;
            --text-muted: #6b6b7d;
            --accent: #00d4ff;
            --accent-glow: rgba(0, 212, 255, 0.4);
            --ok: #00ff9d;
            --err: #ff3366;
            --warn: #ffb800;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            background-image: 
                radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 255, 0.08), transparent),
                radial-gradient(ellipse 60% 50% at 50% 120%, rgba(0, 255, 157, 0.04), transparent),
                var(--bg);
            color: var(--text);
            display: flex;
            justify-content: center;
            align-items: flex-start;
            min-height: 100vh;
            padding: 40px 20px;
        }
        .container {
            background: var(--surface);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            padding: 2.5rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
            width: 100%;
            max-width: 440px;
            position: relative;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .container::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.3), transparent);
        }
        .head {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-bottom: 2rem;
        }
        .logo {
            font-size: 1.2rem;
            font-weight: 700;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: var(--text);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .logo::before {
            content: '';
            width: 8px; height: 8px;
            border-radius: 50%;
            background: var(--accent);
            box-shadow: 0 0 12px var(--accent), 0 0 24px var(--accent-glow);
            animation: pulse 2.5s infinite;
        }
        .nav-tabs {
            display: flex;
            gap: 4px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 4px;
            margin-bottom: 2rem;
        }
        .nav-tab {
            flex: 1;
            padding: 12px;
            text-align: center;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-muted);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            letter-spacing: 0.5px;
        }
        .nav-tab.active {
            background: rgba(0, 212, 255, 0.08);
            color: var(--accent);
            box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.2), 0 0 20px rgba(0, 212, 255, 0.08);
        }
        .nav-tab:hover:not(.active) { color: var(--text); }
        
        .view-section { display: none; }
        .view-section.active { display: block; animation: fadeIn 0.4s ease; }

        .section-header {
            text-align: center;
            margin-bottom: 1.5rem;
        }
        .section-header h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--text);
        }
        .section-header p {
            margin: 0;
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .field { margin-bottom: 1rem; position: relative; }
        .field label {
            display: block;
            font-size: 0.75rem;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: 6px;
            font-weight: 600;
        }
        .field input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border);
            border-radius: 10px;
            color: var(--text);
            font-size: 0.95rem;
            font-family: inherit;
            outline: none;
            transition: all 0.3s ease;
        }
        .field input::placeholder { color: var(--text-muted); font-size: 0.9rem; }
        .field input:focus {
            border-color: rgba(0, 212, 255, 0.4);
            box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.08), 0 0 20px rgba(0, 212, 255, 0.1);
            background: rgba(0, 0, 0, 0.5);
        }

        .btn {
            width: 100%;
            padding: 14px;
            margin-top: 0.5rem;
            background: transparent;
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 10px;
            color: var(--accent);
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 2px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
            font-family: inherit;
        }
        .btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(0, 212, 255, 0.02));
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .btn:hover::before { opacity: 1; }
        .btn:hover {
            border-color: rgba(0, 212, 255, 0.6);
            box-shadow: 0 0 24px rgba(0, 212, 255, 0.15), inset 0 0 20px rgba(0, 212, 255, 0.05);
        }
        .btn:active { transform: scale(0.98); }
        .btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            border-color: var(--border);
            color: var(--text-muted);
        }
        .btn:disabled::before { display: none; }

        .result {
            margin-top: 1.5rem;
            padding: 14px;
            border-radius: 10px;
            font-size: 0.85rem;
            font-weight: 700;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            text-align: center;
            display: none;
            animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .result.show { display: block; }
        .result.ok {
            background: rgba(0, 255, 157, 0.05);
            border: 1px solid rgba(0, 255, 157, 0.2);
            color: var(--ok);
            box-shadow: 0 0 24px rgba(0, 255, 157, 0.08);
        }
        .result.err {
            background: rgba(255, 51, 102, 0.05);
            border: 1px solid rgba(255, 51, 102, 0.2);
            color: var(--err);
            box-shadow: 0 0 24px rgba(255, 51, 102, 0.08);
        }
        .result.warn {
            background: rgba(255, 184, 0, 0.05);
            border: 1px solid rgba(255, 184, 0, 0.2);
            color: var(--warn);
            text-transform: none;
            letter-spacing: 0.5px;
            font-weight: 500;
        }

        .captcha-box {
            margin-top: 1.5rem;
            padding: 1.5rem;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border);
            border-radius: 12px;
            display: none;
            animation: fadeIn 0.4s ease;
        }
        .captcha-box.show { display: block; }
        .captcha-box img {
            width: 100%;
            border-radius: 8px;
            margin-bottom: 12px;
            background: #fff;
        }

        .bypass-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .bypass-btn {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 16px;
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border);
            border-radius: 12px;
            color: var(--text);
            text-decoration: none;
            font-weight: 600;
            font-size: 0.95rem;
            transition: all 0.3s ease;
        }
        .bypass-btn:hover {
            border-color: var(--accent);
            background: rgba(0, 212, 255, 0.05);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
            transform: translateY(-2px);
        }
        .bypass-btn svg {
            width: 20px;
            height: 20px;
            color: var(--accent);
            flex-shrink: 0;
        }

        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(0, 212, 255, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="head">
            <div class="logo">Steam Checker</div>
        </div>

        <div class="nav-tabs">
            <div class="nav-tab active" data-view="checker">Проверка</div>
            <div class="nav-tab" data-view="bypass">Обходы лаунчеров</div>
        </div>

        <!-- CHECKER VIEW -->
        <div id="checkerView" class="view-section active">
            <div class="section-header">
                <h2>Auth Check</h2>
                <p>Введите данные для проверки аккаунта</p>
            </div>
            <div class="field">
                <label>Логин</label>
                <input type="text" id="username" placeholder="steam login" autocomplete="off">
            </div>
            <div class="field">
                <label>Пароль</label>
                <input type="password" id="password" placeholder="••••••••">
            </div>
            <button class="btn" id="checkBtn">Проверить</button>
            
            <div class="captcha-box" id="captchaBox">
                <img id="captchaImage" alt="CAPTCHA">
                <div class="field" style="margin-bottom: 10px">
                    <input type="text" id="captchaText" placeholder="Введите код с картинки">
                </div>
                <button class="btn" id="captchaBtn" style="border-color: rgba(255, 184, 0, 0.3); color: var(--warn);">Отправить</button>
            </div>

            <div class="result" id="result"></div>
        </div>

        <!-- BYPASS VIEW -->
        <div id="bypassView" class="view-section">
            <div class="section-header">
                <h2>Обходы лаунчеров</h2>
                <p>Выберите необходимый инструмент для обхода защиты</p>
            </div>
            <div class="bypass-list">
                <a href="https://github.com/onajlikezz/Nightlight-Launcher/releases/download/NLLauncherV5.3.00/Nightlight.Launcher.Setup.5.3.0.exe" class="bypass-btn" target="_blank">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Обход Rockstar Launcher</span>
                </a>
                <a href="https://github.com/LightnigFast/Project-Lightning/releases/download/v5.0.11.0/ProjectLightningInstaller-v5.exe" class="bypass-btn" target="_blank">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                    </svg>
                    <span>Универсальный обход</span>
                </a>
            </div>
        </div>
    </div>

    <script>
        // Tab switching
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.view + 'View').classList.add('active');
            });
        });

        let captchaGid = '-1';
        let cooldownTimer = null;
        const COOLDOWN = 15;

        function startCooldown() {
            const btn = document.getElementById('checkBtn');
            let remaining = COOLDOWN;
            btn.disabled = true;
            btn.textContent = 'Подождите ' + remaining + 'с';
            
            if (cooldownTimer) clearInterval(cooldownTimer);
            
            cooldownTimer = setInterval(() => {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(cooldownTimer);
                    cooldownTimer = null;
                    btn.disabled = false;
                    btn.textContent = 'Проверить';
                } else {
                    btn.textContent = 'Подождите ' + remaining + 'с';
                }
            }, 1000);
        }

        function showResult(type, text) {
            const res = document.getElementById('result');
            res.className = 'result show ' + type;
            res.textContent = text;
        }

        async function doCheck(login, pass, gid, text) {
            try {
                const r = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: login, password: pass, captcha_gid: gid, captcha_text: text })
                });
                return await r.json();
            } catch (e) {
                return { status: 'error', message: 'Ошибка соединения' };
            }
        }

        document.getElementById('checkBtn').addEventListener('click', async () => {
            const u = document.getElementById('username').value.trim();
            const p = document.getElementById('password').value.trim();
            
            if (!u || !p) {
                showResult('err', 'Заполните все поля');
                return;
            }
            
            const btn = document.getElementById('checkBtn');
            btn.disabled = true;
            btn.textContent = 'Проверка...';
            document.getElementById('result').classList.remove('show');
            document.getElementById('captchaBox').classList.remove('show');
            
            const data = await doCheck(u, p, '-1', '');
            
            if (data.status === 'captcha') {
                captchaGid = data.captcha_gid;
                document.getElementById('captchaImage').src = '/api/captcha/' + captchaGid;
                document.getElementById('captchaBox').classList.add('show');
                showResult('warn', 'Требуется капча');
            } else if (data.status === 'success') {
                showResult('ok', 'Аккаунт работает');
            } else {
                showResult('err', 'Аккаунт не работает');
            }
            
            btn.disabled = false;
            btn.textContent = 'Проверить';
            startCooldown();
        });

        document.getElementById('captchaBtn').addEventListener('click', async () => {
            const u = document.getElementById('username').value.trim();
            const p = document.getElementById('password').value.trim();
            const t = document.getElementById('captchaText').value.trim();
            
            if (!t) {
                showResult('err', 'Введите код капчи');
                return;
            }
            
            const btn = document.getElementById('captchaBtn');
            btn.disabled = true;
            btn.textContent = 'Проверка...';
            
            const data = await doCheck(u, p, captchaGid, t);
            
            if (data.status === 'captcha') {
                document.getElementById('captchaImage').src = '/api/captcha/' + data.captcha_gid + '?t=' + Date.now();
                captchaGid = data.captcha_gid;
                document.getElementById('captchaText').value = '';
                showResult('warn', 'Неверная капча, попробуйте снова');
            } else if (data.status === 'success') {
                document.getElementById('captchaBox').classList.remove('show');
                showResult('ok', 'Аккаунт работает');
            } else {
                document.getElementById('captchaBox').classList.remove('show');
                showResult('err', 'Аккаунт не работает');
            }
            
            btn.disabled = false;
            btn.textContent = 'Отправить';
            startCooldown();
        });

        // Background ping for stats (kept for backend compatibility)
        let sid = sessionStorage.getItem('sid');
        if (!sid) {
            sid = Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('sid', sid);
        }
        function ping() {
            fetch('/ping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sid })
            }).catch(() => {});
        }
        setInterval(ping, 10000);
        ping();
    </script>
</body>
</html>`;

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
    const algorithmIdentifier = derSequence([
        derOid(Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01])),
        derNull()
    ]);
    const subjectPublicKeyInfo = derSequence([algorithmIdentifier, derBitString(rsaPublicKey)]);
    const b64 = subjectPublicKeyInfo.toString('base64');
    return `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;
}

async function checkSteamCredentials(username, password, captchaGid = '-1', captchaText = '') {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://steamcommunity.com/login/home/?goto=',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://steamcommunity.com',
        'X-Requested-With': 'XMLHttpRequest'
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
