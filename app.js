 const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steam Auth Check</title>
    <style>
        :root {
            --bg: #0a0b10;
            --card: rgba(27, 30, 38, 0.7);
            --text: #e0e0e0;
            --text-muted: #8b92a1;
            --accent: #66c0f4;
            --accent-glow: rgba(102, 192, 244, 0.3);
            --ok: #00ff88;
            --err: #ff3355;
            --warn: #ffaa00;
            --tg: #2AABEE;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(102, 192, 244, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(255, 51, 85, 0.05) 0%, transparent 40%);
            color: var(--text);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            background: var(--card);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            padding: 2.5rem;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
            width: 100%;
            max-width: 400px;
            text-align: center;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        h2 {
            margin: 0 0 1.5rem 0;
            color: var(--accent);
            text-transform: uppercase;
            font-size: 1.1rem;
            letter-spacing: 2px;
            font-weight: 700;
        }
        .input-group { position: relative; margin-bottom: 1.2rem; }
        input {
            width: 100%;
            padding: 14px 16px;
            background: rgba(15, 16, 20, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            color: white;
            font-size: 1rem;
            outline: none;
            transition: all 0.3s ease;
        }
        input::placeholder { color: var(--text-muted); }
        input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px var(--accent-glow);
            background: rgba(15, 16, 20, 0.9);
        }
        button {
            width: 100%;
            padding: 14px;
            margin-top: 0.5rem;
            background: linear-gradient(135deg, var(--accent) 0%, #4a9fd4 100%);
            color: #0a0b10;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(102, 192, 244, 0.2);
        }
        button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 192, 244, 0.4);
        }
        button:active:not(:disabled) { transform: translateY(0); }
        button:disabled {
            background: #2a2e38;
            color: #666;
            cursor: not-allowed;
            box-shadow: none;
        }
        #result {
            margin-top: 1.5rem;
            padding: 14px;
            border-radius: 10px;
            font-weight: 600;
            font-size: 0.95rem;
            display: none;
            animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .success { background: rgba(0, 255, 136, 0.1); color: var(--ok); border: 1px solid rgba(0, 255, 136, 0.3); }
        .error { background: rgba(255, 51, 85, 0.1); color: var(--err); border: 1px solid rgba(255, 51, 85, 0.3); }
        .captcha { background: rgba(255, 170, 0, 0.1); color: var(--warn); border: 1px solid rgba(255, 170, 0, 0.3); }
        
        #captchaSection {
            display: none;
            margin-top: 1.5rem;
            padding: 1.2rem;
            background: rgba(15, 16, 20, 0.6);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            animation: slideDown 0.4s ease;
        }
        #captchaSection p { margin: 0 0 10px 0; color: var(--warn); font-size: 0.9rem; font-weight: 600; }
        #captchaImage { max-width: 100%; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1); }
        
        .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            margin: 2rem 0 1.5rem 0;
        }
        
        .tg-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, var(--tg) 0%, #229ED9 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 1rem;
            transition: all 0.2s ease;
            box-shadow: 0 4px 15px rgba(42, 171, 238, 0.2);
        }
        .tg-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(42, 171, 238, 0.4);
        }
        .tg-button svg { width: 20px; height: 20px; fill: currentColor; }

        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    </style>
</head>
<body>
    <div class="container">
        <h2>Проверка аккаунта</h2>
        
        <div class="input-group">
            <input type="text" id="username" placeholder="Логин Steam" autocomplete="off">
        </div>
        <div class="input-group">
            <input type="password" id="password" placeholder="Пароль">
        </div>
        
        <button id="checkBtn" onclick="checkAccount()">Проверить</button>
        
        <div id="captchaSection">
            <p>Введите код с картинки:</p>
            <img id="captchaImage" src="" alt="CAPTCHA">
            <input type="text" id="captchaText" placeholder="Введите код" style="margin-top: 0;">
            <button onclick="submitWithCaptcha()" style="margin-top: 10px; background: linear-gradient(135deg, var(--warn) 0%, #e69500 100%);">Отправить с капчей</button>
        </div>
        
        <div id="result"></div>

        <div class="divider"></div>
        
        <a href="https://t.me/MirArenDaff" target="_blank" class="tg-button">
            <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.319.016.101.017.204.011.285z"/></svg>
            Подпишись (:
        </a>
    </div>

    <script>
        let currentCaptchaGid = '-1';
        let cooldownTimer = null;
        const COOLDOWN_SECONDS = 15;

        function startCooldown() {
            const btn = document.getElementById('checkBtn');
            let remaining = COOLDOWN_SECONDS;
            btn.disabled = true;
            btn.textContent = \`Подождите \${remaining}с...\`;
            
            if (cooldownTimer) clearInterval(cooldownTimer);
            
            cooldownTimer = setInterval(() => {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(cooldownTimer);
                    cooldownTimer = null;
                    btn.disabled = false;
                    btn.textContent = 'Проверить';
                } else {
                    btn.textContent = \`Подождите \${remaining}с...\`;
                }
            }, 1000);
        }

        async function checkAccount() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');
            
            if (!u || !p) {
                res.className = 'error';
                res.textContent = 'Заполните все поля';
                res.style.display = 'block';
                return;
            }
            
            btn.disabled = true;
            btn.textContent = 'Проверка...';
            res.style.display = 'none';
            document.getElementById('captchaSection').style.display = 'none';
            
            try {
                const response = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p, captcha_gid: '-1', captcha_text: '' })
                });
                const data = await response.json();
                
                if (data.status === 'captcha') {
                    currentCaptchaGid = data.captcha_gid;
                    document.getElementById('captchaImage').src = data.captcha_url;
                    document.getElementById('captchaSection').style.display = 'block';
                    res.className = 'captcha';
                    res.textContent = data.message;
                    res.style.display = 'block';
                } else {
                    res.className = data.status === 'success' ? 'success' : 'error';
                    res.textContent = data.message;
                    res.style.display = 'block';
                }
            } catch (error) {
                res.className = 'error';
                res.textContent = 'Ошибка соединения с сервером';
                res.style.display = 'block';
            } finally {
                startCooldown();
            }
        }

        async function submitWithCaptcha() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const captchaText = document.getElementById('captchaText').value;
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');
            
            if (!captchaText) {
                res.className = 'error';
                res.textContent = 'Введите код капчи';
                res.style.display = 'block';
                return;
            }
            
            btn.disabled = true;
            btn.textContent = 'Проверка...';
            res.style.display = 'none';
            
            try {
                const response = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: u,
                        password: p,
                        captcha_gid: currentCaptchaGid,
                        captcha_text: captchaText
                    })
                });
                const data = await response.json();
                
                if (data.status === 'captcha') {
                    document.getElementById('captchaImage').src = data.captcha_url + '&t=' + Date.now();
                    document.getElementById('captchaText').value = '';
                    res.className = 'captcha';
                    res.textContent = 'Неверная капча, попробуйте снова';
                    res.style.display = 'block';
                } else {
                    document.getElementById('captchaSection').style.display = 'none';
                    res.className = data.status === 'success' ? 'success' : 'error';
                    res.textContent = data.message;
                    res.style.display = 'block';
                }
            } catch (error) {
                res.className = 'error';
                res.textContent = 'Ошибка соединения с сервером';
                res.style.display = 'block';
            } finally {
                startCooldown();
            }
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
        const bytes = [];
        let l = len;
        while (l > 0) { bytes.unshift(l & 0xff); l >>= 8; }
        return Buffer.from([0x80 | bytes.length, ...bytes]);
    }
    function derTag(tag, content) {
        return Buffer.concat([Buffer.from([tag]), derLength(content.length), content]);
    }
    function derInteger(buf) {
        if (buf.length > 0 && (buf[0] & 0x80)) {
            buf = Buffer.concat([Buffer.from([0x00]), buf]);
        }
        return derTag(0x02, buf);
    }
    function derSequence(items) {
        return derTag(0x30, Buffer.concat(items));
    }
    function derBitString(content) {
        return derTag(0x03, Buffer.concat([Buffer.from([0x00]), content]));
    }
    function derOid(oidBytes) {
        return derTag(0x06, oidBytes);
    }
    function derNull() {
        return Buffer.from([0x05, 0x00]);
    }

    const rsaPublicKey = derSequence([derInteger(modBuf), derInteger(expBuf)]);
    const algorithmIdentifier = derSequence([
        derOid(Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01])),
        derNull()
    ]);
    const subjectPublicKeyInfo = derSequence([
        algorithmIdentifier,
        derBitString(rsaPublicKey)
    ]);

    const b64 = subjectPublicKeyInfo.toString('base64');
    const lines = b64.match(/.{1,64}/g).join('\n');
    return `-----BEGIN PUBLIC KEY-----\n${lines}\n-----END PUBLIC KEY-----`;
}

async function checkSteamCredentials(username, password, captchaGid = '-1', captchaText = '') {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://steamcommunity.com/login/home/?goto=',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://steamcommunity.com',
        'X-Requested-With': 'XMLHttpRequest'
    };

    let rsaData;
    try {
        const rsaResponse = await axios.get('https://steamcommunity.com/login/getrsakey', {
            params: { username }, headers, timeout: 10000
        });
        rsaData = rsaResponse.data;
    } catch (error) {
        return { status: 'error', message: \`Ошибка сети при получении ключа: \${error.message}\` };
    }

    if (!rsaData.success) {
        return { status: 'error', message: 'аккаунт не работает (неверный логин)' };
    }

    let encryptedPasswordB64;
    try {
        const publicKeyPem = buildRSAPublicKeyPEM(rsaData.publickey_mod, rsaData.publickey_exp);
        const encrypted = crypto.publicEncrypt(
            { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
            Buffer.from(password, 'utf-8')
        );
        encryptedPasswordB64 = encrypted.toString('base64');
    } catch (error) {
        return { status: 'error', message: \`Ошибка шифрования: \${error.message}\` };
    }

    const payload = new URLSearchParams({
        username,
        password: encryptedPasswordB64,
        twofactorcode: '',
        emailauth: '',
        loginfriendlyname: '',
        captchagid: captchaGid,
        captcha_text: captchaText,
        emailsteamid: '',
        rsatimestamp: rsaData.timestamp,
        remember_login: 'false',
        donotcache: Date.now().toString()
    });

    let loginData;
    try {
        const loginResponse = await axios.post('https://steamcommunity.com/login/dologin/', payload.toString(), {
            headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 10000
        });
        loginData = loginResponse.data;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            return { status: 'error', message: 'Слишком много попыток. Steam временно заблокировал запросы. Подождите 15-30 минут.' };
        }
        return { status: 'error', message: \`Ошибка сети при входе: \${error.message}\` };
    }

    if (loginData.success) {
        return { status: 'success', message: 'аккаунт работает (верный пароль)' };
    }

    if (loginData.captcha_needed) {
        const newCaptchaGid = loginData.captcha_gid || '-1';
        return {
            status: 'captcha',
            message: 'Требуется капча',
            captcha_gid: newCaptchaGid,
            captcha_url: \`https://steamcommunity.com/login/rendercaptcha/?gid=\${newCaptchaGid}\`
        };
    }

    if (loginData.requires_twofactor) {
        return { status: 'error', message: 'аккаунт не работает (стоит стим гвард)' };
    }

    if (loginData.emailauth_needed) {
        return { status: 'error', message: 'аккаунт не работает (требуется код из почты)' };
    }

    const msg = loginData.message || 'Неверный логин или пароль';
    if (msg.toLowerCase().includes('incorrect') || msg.toLowerCase().includes('wrong')) {
        return { status: 'error', message: 'аккаунт не работает (неверный пароль)' };
    }

    return { status: 'error', message: \`аккаунт не работает (\${msg})\` };
}

app.get('/', (req, res) => {
    res.send(HTML_TEMPLATE);
});

app.post('/check', async (req, res) => {
    const { username, password, captcha_gid, captcha_text } = req.body;

    if (!username || !password) {
        return res.json({ status: 'error', message: 'Введите логин и пароль' });
    }

    const result = await checkSteamCredentials(
        username.trim(),
        password.trim(),
        captcha_gid || '-1',
        captcha_text || ''
    );
    res.json(result);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(\`Сервер запущен на порту \${PORT}\`);
});
