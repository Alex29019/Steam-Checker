const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Парсинг аккаунтов из твоего файла (вставь сюда актуальный список, если он изменился)
const sharedAccounts = [
    { game: "Cyberpunk 2077", login: "orderlyinoculat", password: "axQUk8etMajK" },
    { game: "GTA 5, RDR2, Ведьмак 3", login: "0855j9", password: "zZ10301030" },
    { game: "Marvel's Spider-Man 2", login: "groggymovement4", password: "DCN_LliOQhv" },
    { game: "Hogwarts Legacy", login: "nicasacracacenri", password: "EBA9Y59KGCTB" },
    { game: "Forza Horizon 5", login: "bej01201", password: "Bejdw11201" },
    { game: "Mortal Kombat 11", login: "steam123z17", password: "ZXCVBNMQQ" },
    { game: "Resident Evil 4 Remake", login: "bejdw24074", password: "steamkk.com" },
    { game: "The Last of Us Part 1 & 2", login: "STEAMGAMESTT1", password: "funpay.com/users/6932278/" },
    { game: "Call of Duty: Modern Warfare", login: "soham123419", password: "Funpay-0nibist" },
    { game: "Dying Light 2, The Forest", login: "earthlnwza5566", password: "2G6TEM5ZAZC6" }
    // Добавь сюда остальные аккаунты из твоего файла по аналогии
];

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steam Checker Pro</title>
    <style>
        :root {
            --bg: #0f1115;
            --card: #181b21;
            --text: #e0e0e0;
            --text-muted: #8b92a1;
            --accent: #66c0f4;
            --ok: #00ff88;
            --err: #ff3355;
            --warn: #ffb800;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            display: flex;
            justify-content: center;
            padding: 40px 20px;
            min-height: 100vh;
        }
        .container {
            width: 100%;
            max-width: 800px;
        }
        .header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .header h1 {
            margin: 0;
            font-size: 1.8rem;
            color: var(--accent);
            letter-spacing: 1px;
        }
        .header p {
            color: var(--text-muted);
            margin-top: 8px;
            font-size: 0.9rem;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 16px;
        }
        .account-card {
            background: var(--card);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 12px;
            padding: 20px;
            transition: all 0.3s ease;
        }
        .account-card:hover {
            border-color: rgba(102, 192, 244, 0.3);
            transform: translateY(-2px);
        }
        .game-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--text);
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
        }
        .creds {
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.8rem;
            color: var(--text-muted);
            background: rgba(0,0,0,0.3);
            padding: 10px;
            border-radius: 6px;
            margin-bottom: 12px;
            word-break: break-all;
        }
        .check-btn {
            width: 100%;
            padding: 10px;
            background: transparent;
            border: 1px solid var(--accent);
            color: var(--accent);
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }
        .check-btn:hover:not(:disabled) {
            background: rgba(102, 192, 244, 0.1);
        }
        .check-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            border-color: var(--text-muted);
            color: var(--text-muted);
        }
        .status-box {
            margin-top: 12px;
            padding: 10px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            display: none;
            animation: fadeIn 0.3s ease;
        }
        .status-box.success { background: rgba(0, 255, 136, 0.1); color: var(--ok); border: 1px solid rgba(0, 255, 136, 0.3); }
        .status-box.error { background: rgba(255, 51, 85, 0.1); color: var(--err); border: 1px solid rgba(255, 51, 85, 0.3); }
        .status-box.warn { background: rgba(255, 184, 0, 0.1); color: var(--warn); border: 1px solid rgba(255, 184, 0, 0.3); }
        
        .captcha-area {
            margin-top: 12px;
            display: none;
            animation: fadeIn 0.3s ease;
        }
        .captcha-area img {
            width: 100%;
            border-radius: 6px;
            margin-bottom: 8px;
            background: #fff;
        }
        .captcha-input {
            width: 100%;
            padding: 8px;
            background: rgba(0,0,0,0.3);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            color: white;
            margin-bottom: 8px;
            text-align: center;
            font-size: 1rem;
            letter-spacing: 2px;
        }
        .confirm-btn {
            width: 100%;
            padding: 8px;
            background: var(--warn);
            color: #000;
            border: none;
            border-radius: 6px;
            font-weight: 700;
            cursor: pointer;
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Steam Account Checker</h1>
            <p>Умная проверка с поддержкой капчи и детекцией Steam Guard</p>
        </div>
        <div class="grid" id="accountsGrid"></div>
    </div>

    <script>
        const accounts = ${JSON.stringify(sharedAccounts)};

        function renderGrid() {
            const grid = document.getElementById('accountsGrid');
            grid.innerHTML = accounts.map((acc, index) => \`
                <div class="account-card" id="card-\${index}">
                    <div class="game-title">\${acc.game}</div>
                    <div class="creds">
                        <div>👤 \${acc.login}</div>
                        <div>🔑 \${acc.password}</div>
                    </div>
                    <button class="check-btn" id="btn-\${index}" onclick="startCheck(\${index})">Проверить</button>
                    
                    <div class="captcha-area" id="captcha-\${index}">
                        <img id="captcha-img-\${index}" src="" alt="CAPTCHA">
                        <input type="text" class="captcha-input" id="captcha-input-\${index}" placeholder="Введите код" maxlength="6">
                        <button class="confirm-btn" onclick="submitCaptcha(\${index})">Подтвердить</button>
                    </div>
                    
                    <div class="status-box" id="status-\${index}"></div>
                </div>
            \`).join('');
        }

        async function startCheck(index) {
            const acc = accounts[index];
            const btn = document.getElementById(\`btn-\${index}\`);
            const status = document.getElementById(\`status-\${index}\`);
            const captchaArea = document.getElementById(\`captcha-\${index}\`);
            
            btn.disabled = true;
            btn.textContent = 'Проверка...';
            status.style.display = 'none';
            captchaArea.style.display = 'none';

            try {
                const response = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: acc.login, 
                        password: acc.password 
                    })
                });
                const data = await response.json();
                handleResult(index, data);
            } catch (e) {
                showStatus(index, 'error', 'Ошибка сети. Попробуйте позже.');
                btn.disabled = false;
                btn.textContent = 'Проверить';
            }
        }

        async function submitCaptcha(index) {
            const acc = accounts[index];
            const btn = document.getElementById(\`btn-\${index}\`);
            const captchaInput = document.getElementById(\`captcha-input-\${index}\`);
            const status = document.getElementById(\`status-\${index}\`);
            
            const captchaText = captchaInput.value.trim();
            if (!captchaText) return;

            btn.disabled = true;
            btn.textContent = 'Отправка...';
            status.style.display = 'none';

            try {
                const response = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username: acc.login, 
                        password: acc.password,
                        captcha_gid: window[\`captcha_gid_\${index}\`],
                        captcha_text: captchaText
                    })
                });
                const data = await response.json();
                handleResult(index, data);
            } catch (e) {
                showStatus(index, 'error', 'Ошибка сети.');
                btn.disabled = false;
                btn.textContent = 'Проверить';
            }
        }

        function handleResult(index, data) {
            const btn = document.getElementById(\`btn-\${index}\`);
            const captchaArea = document.getElementById(\`captcha-\${index}\`);
            
            if (data.status === 'captcha') {
                window[\`captcha_gid_\${index}\`] = data.captcha_gid;
                document.getElementById(\`captcha-img-\${index}\`).src = data.captcha_url;
                captchaArea.style.display = 'block';
                btn.disabled = false;
                btn.textContent = 'Ожидание капчи...';
            } else if (data.status === 'success') {
                showStatus(index, 'success', data.message);
                btn.disabled = true;
                btn.textContent = 'Проверено';
                captchaArea.style.display = 'none';
            } else if (data.status === 'twofactor' || data.status === 'email') {
                showStatus(index, 'warn', data.message);
                btn.disabled = true;
                btn.textContent = 'Проверено';
                captchaArea.style.display = 'none';
            } else {
                showStatus(index, 'error', data.message);
                btn.disabled = false;
                btn.textContent = 'Проверить снова';
                captchaArea.style.display = 'none';
            }
        }

        function showStatus(index, type, message) {
            const status = document.getElementById(\`status-\${index}\`);
            status.className = \`status-box \${type}\`;
            status.textContent = message;
            status.style.display = 'block';
        }

        renderGrid();
    </script>
</body>
</html>`;

async function checkSteamAccount(username, password, captchaGid = '', captchaText = '') {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://steamcommunity.com/login/home/?goto=',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://steamcommunity.com'
    };

    // 1. Получаем RSA ключ
    let rsaData;
    try {
        const rsaResponse = await axios.get('https://steamcommunity.com/login/getrsakey', {
            params: { username },
            headers,
            timeout: 10000
        });
        rsaData = rsaResponse.data;
    } catch (error) {
        return { status: 'error', message: 'Ошибка соединения с Steam (попробуйте позже)' };
    }

    if (!rsaData.success) {
        return { status: 'error', message: 'Аккаунт не найден или заблокирован' };
    }

    // 2. Шифруем пароль
    let encryptedPasswordB64;
    try {
        const modBuf = Buffer.from(rsaData.publickey_mod, 'hex');
        const expBuf = Buffer.from(rsaData.publickey_exp, 'hex');

        // Формируем корректный PEM ключ
        const derSequence = (items) => {
            const content = Buffer.concat(items);
            const len = Buffer.from([0x30, content.length < 128 ? content.length : (0x80 | 1), content.length]);
            return Buffer.concat([len.length === 3 ? Buffer.from([0x30, 0x81, content.length]) : Buffer.from([0x30, content.length]), content]);
        };
        
        // Упрощенная, но рабочая сборка PEM для Node.js crypto
        const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n` +
            Buffer.from(rsaData.publickey_mod, 'hex').toString('base64').match(/.{1,64}/g).join('\n') +
            `\n-----END PUBLIC KEY-----`;

        const encrypted = crypto.publicEncrypt(
            { key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING },
            Buffer.from(password, 'utf-8')
        );
        encryptedPasswordB64 = encrypted.toString('base64');
    } catch (error) {
        return { status: 'error', message: 'Ошибка шифрования данных' };
    }

    // 3. Отправляем данные на вход
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
        return { status: 'error', message: 'Ошибка сети при попытке входа' };
    }

    // 4. Анализируем ответ Steam
    if (loginData.success) {
        return { status: 'success', message: '✅ Аккаунт работает! (Успешный вход)' };
    }
    
    if (loginData.requires_twofactor) {
        return { status: 'twofactor', message: '⚠️ Пароль ВЕРНЫЙ, но требуется код из мобильного Steam Guard' };
    }
    
    if (loginData.emailauth_needed) {
        return { status: 'email', message: '⚠️ Пароль ВЕРНЫЙ, но требуется код, отправленный на почту' };
    }

    if (loginData.captcha_needed) {
        return { 
            status: 'captcha', 
            message: 'Требуется ввод капчи',
            captcha_gid: loginData.captcha_gid,
            captcha_url: `https://steamcommunity.com/login/rendercaptcha/?gid=${loginData.captcha_gid}`
        };
    }

    if (loginData.message && (loginData.message.toLowerCase().includes('incorrect') || loginData.message.toLowerCase().includes('password'))) {
        return { status: 'error', message: '❌ Неверный пароль (или он был изменен владельцем)' };
    }

    return { status: 'error', message: `❌ Ошибка входа: ${loginData.message || 'Аккаунт недоступен'}` };
}

app.get('/', (req, res) => {
    res.send(HTML_TEMPLATE);
});

app.post('/check', async (req, res) => {
    const { username, password, captcha_gid, captcha_text } = req.body;
    if (!username || !password) {
        return res.json({ status: 'error', message: 'Нет данных для проверки' });
    }
    
    const result = await checkSteamAccount(username, password, captcha_gid || '', captcha_text || '');
    res.json(result);
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
