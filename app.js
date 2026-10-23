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
        :root { --bg: #0f1014; --card: #1b1e26; --text: #e0e0e0; --accent: #66c0f4; --ok: #00ff88; --err: #ff3355; --warn: #ffaa00; }
        body { margin: 0; font-family: 'Segoe UI', sans-serif; background: var(--bg); color: var(--text); display: flex; justify-content: center; align-items: center; min-height: 100vh; padding: 20px; }
        .container { background: var(--card); padding: 2rem; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.4); width: 100%; max-width: 380px; text-align: center; border: 1px solid #2a2e38; }
        h2 { margin-top: 0; color: var(--accent); text-transform: uppercase; font-size: 1.2rem; letter-spacing: 1px; }
        input { width: 100%; padding: 14px; margin: 10px 0; background: #0f1014; border: 1px solid #2a2e38; border-radius: 6px; color: white; font-size: 1rem; box-sizing: border-box; outline: none; transition: border-color 0.3s; }
        input:focus { border-color: var(--accent); }
        button { width: 100%; padding: 14px; margin-top: 15px; background: var(--accent); color: #0f1014; border: none; border-radius: 6px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: transform 0.1s; }
        button:active { transform: scale(0.98); }
        button:disabled { background: #2a2e38; color: #666; cursor: not-allowed; }
        #result { margin-top: 20px; padding: 15px; border-radius: 6px; font-weight: 600; display: none; animation: fadeIn 0.4s ease-out; }
        .success { background: rgba(0, 255, 136, 0.1); color: var(--ok); border: 1px solid var(--ok); }
        .error { background: rgba(255, 51, 85, 0.1); color: var(--err); border: 1px solid var(--err); }
        .captcha { background: rgba(255, 170, 0, 0.1); color: var(--warn); border: 1px solid var(--warn); }
        #captchaSection { display: none; margin-top: 20px; padding: 15px; background: #0f1014; border-radius: 6px; border: 1px solid #2a2e38; }
        #captchaImage { max-width: 100%; margin: 10px 0; border-radius: 4px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>
    <div class="container">
        <h2>Проверка аккаунта</h2>
        <input type="text" id="username" placeholder="Логин Steam" autocomplete="off">
        <input type="password" id="password" placeholder="Пароль">
        <button id="checkBtn" onclick="checkAccount()">Проверить</button>
        
        <div id="captchaSection">
            <p style="margin: 10px 0; color: var(--warn);">Введите код с картинки:</p>
            <img id="captchaImage" src="" alt="CAPTCHA">
            <input type="text" id="captchaText" placeholder="Введите код">
            <button onclick="submitWithCaptcha()">Отправить с капчей</button>
        </div>
        
        <div id="result"></div>
    </div>

    <script>
        let currentCaptchaGid = '-1';

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
                res.textContent = 'Ошибка соединения';
                res.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Проверить';
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
                res.textContent = 'Ошибка соединения';
                res.style.display = 'block';
            } finally {
                btn.disabled = false;
                btn.textContent = 'Проверить';
            }
        }
    </script>
</body>
</html>
`;

/**
 * Собирает корректный PEM из hex-модуля и экспоненты Steam.
 * Формат: SubjectPublicKeyInfo (ASN.1 DER) с алгоритмом rsaEncryption.
 */
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

    // RSAPublicKey ::= SEQUENCE { modulus INTEGER, publicExponent INTEGER }
    const rsaPublicKey = derSequence([derInteger(modBuf), derInteger(expBuf)]);

    // AlgorithmIdentifier ::= SEQUENCE { algorithm OID, parameters NULL }
    // OID 1.2.840.113549.1.1.1 (rsaEncryption)
    const algorithmIdentifier = derSequence([
        derOid(Buffer.from([0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01])),
        derNull()
    ]);

    // SubjectPublicKeyInfo ::= SEQUENCE { algorithm AlgorithmIdentifier, subjectPublicKey BIT STRING }
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

    // Шаг 1: Получение RSA-ключа
    let rsaData;
    try {
        const rsaResponse = await axios.get('https://steamcommunity.com/login/getrsakey', {
            params: { username }, headers, timeout: 10000
        });
        rsaData = rsaResponse.data;
    } catch (error) {
        return { status: 'error', message: `Ошибка сети при получении ключа: ${error.message}` };
    }

    if (!rsaData.success) {
        return { status: 'error', message: 'аккаунт не работает (неверный логин)' };
    }

    // Шаг 2: Шифрование пароля
    let encryptedPasswordB64;
    try {
        const publicKeyPem = buildRSAPublicKeyPEM(rsaData.publickey_mod, rsaData.publickey_exp);
        const encrypted = crypto.publicEncrypt(
            { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
            Buffer.from(password, 'utf-8')
        );
        encryptedPasswordB64 = encrypted.toString('base64');
    } catch (error) {
        return { status: 'error', message: `Ошибка шифрования: ${error.message}` };
    }

    // Шаг 3: Отправка авторизации
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
        return { status: 'error', message: `Ошибка входа: ${error.message}` };
    }

    // Шаг 4: Парсинг ответа
    if (loginData.success) {
        return { status: 'success', message: 'аккаунт работает (верный пароль)' };
    }

    if (loginData.captcha_needed) {
        const newCaptchaGid = loginData.captcha_gid || '-1';
        return {
            status: 'captcha',
            message: 'Требуется капча',
            captcha_gid: newCaptchaGid,
            captcha_url: `https://steamcommunity.com/login/rendercaptcha/?gid=${newCaptchaGid}`
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

    return { status: 'error', message: `аккаунт не работает (${msg})` };
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
    console.log(`Сервер запущен на порту ${PORT}`);
});
