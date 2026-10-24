const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Список аккаунтов, извлеченный из твоего файла
const sharedAccounts = [
    { game: "BeamNG.Drive", login: "beamngdrive123steam1", password: "Kte!22ijaAII12" },
    { game: "Kingdom Come Deliverance 2", login: "mosgq70379", password: "oeldf55726" },
    { game: "UNCHARTED: Legacy of Thieves Collection", login: "uncharted_st", password: "UNCHARTED@8804" },
    { game: "Forza Horizon 4, ARK Survival, LEGO Batman", login: "nmsukt191", password: "batzaza191" },
    { game: "Black Myth Wukong", login: "gfk66337", password: "Acp234213" },
    { game: "GTA 5, Resident Evil 2, Resident Evil 3, Ведьмак 3", login: "0855j9", password: "zZ10301030" },
    { game: "Marvel's Spider Man 2", login: "groggymovement4", password: "DCN_LliOQhv" },
    { game: "Red Dead Redemption 2", login: "ynysa422", password: "@Gamerspace123" },
    { game: "NBA 2K20, GTA San Andreas, GTA 5", login: "rnmiike", password: "THEGODMIKE1" },
    { game: "Marvel's Spider Man Remastered", login: "mklvn2y9", password: "zhizhure1221" },
    { game: "The Last Of Us 2, Geometry Dash, Resident Evil", login: "STEAMGAMESTT1", password: "funpay.com/users/6932278/" },
    { game: "Hogwarts Legacy", login: "nicasacracacenri", password: "EBA9Y59KGCTB" },
    { game: "Resident Evil 7 Biohazard", login: "jocuriargenrinia", password: "70Games.net92" },
    { game: "Grand Theft Auto 4", login: "wqm322495", password: "ac7QPfa3" },
    { game: "Horizon Forbidden West Complete Edition", login: "vonterr", password: "889162" },
    { game: "Cyberpunk 2077", login: "orderlyinoculat", password: "axQUk8etMajK" },
    { game: "Dying Light 2, Sons Of The Forest, The Forest", login: "earthlnwza5566", password: "2G6TEM5ZAZC6" },
    { game: "Euro Truck Simulator 2", login: "nfpprsq3h", password: "f1qslg5kp" },
    { game: "Atomic Heart", login: "wf6ju3bf5wc3", password: "qKnh6N9SLiMxyvXVX36d" },
    { game: "Forza Horizon 5", login: "bej01201", password: "Bejdw11201" },
    { game: "Call Of Duty Modern Warfare 2, PES 2021", login: "dimkoxd", password: "2G6TEM5ZAZC6" },
    { game: "Mortal Kombat 11, Euro Truck Simulator 2", login: "steam123z17", password: "ZXCVBNMQQ" },
    { game: "Mortal Kombat 1", login: "Mortalk1pehkflt01", password: "TGVBFRETt01" },
    { game: "Farming Simulator 25", login: "neylavewe1985", password: "wFbmEcKQ" },
    { game: "Metro (все части), Sons Of The Forest, Ведьмак 3", login: "negri_pidor1488", password: "fjbjnoDEFSjkndfgzhjkoCDSA09" },
    { game: "FIFA 22", login: "xxyenlover", password: "34cv56BN" },
    { game: "Terraria, Baldi's Basics Classic Remastered", login: "quincypugy", password: "0Heh%v4SSG" },
    { game: "Hearts Of Iron 4, Batman Arkham Asylum", login: "meteprotr", password: "3D88ASX2AMCG" },
    { game: "Ведьмак 3: Дикая Охота, ARK Survival", login: "thnavud1", password: "0641769856Za" },
    { game: "CoD MW 2019, Spider Man, Far Cry 3, Max Payne 3", login: "soham123419", password: "Funpay-0nibist" },
    { game: "The Forest, Outlast 2", login: "hhied98481", password: "Deaiwoq217" },
    { game: "Detroit: Become Human", login: "Detroit_st", password: "DETROIT@7401" },
    { game: "Resident Evil 4 Remake", login: "bejdw24074", password: "steamkk.com" },
    { game: "Dying Light, ETS 2, Left 4 Dead 2", login: "YaKrycheVasFP", password: "VM@KLGT8W34C" },
    { game: "Forza Horizon 5 + все DLC", login: "pq3sz8ar9rx8", password: "SZ7ZF8YSFCXE" },
    { game: "Call Of Duty Black Ops 3", login: "xbeverysketch", password: "st3@mxx645" },
    { game: "FIFA 21, FIFA 22", login: "rd5977", password: "951753852.ACHU" },
    { game: "Days Gone, EA Sports FC 24, GTA 5", login: "juscelinolira", password: "CDTBTD66XEX6" },
    { game: "Sons Of The Forest, The Forest, Schedule, R.E.P.O", login: "SDACHAvARENDY01", password: "$j2si2jLDSJFJ2Nsj" },
    { game: "Elden Ring, Ведьмак 3", login: "shushi_elden_ring", password: "Owner_shushiGames_Seller" },
    { game: "Red Dead Redemption 2, Ведьмак 3", login: "red_dead_profix", password: "DASjsaj72ow8" },
    { game: "CoD MW3, GTA 4, CoD MW2, CoD Black Ops", login: "sunzshiine", password: "msmb1122" },
    { game: "Call Of Duty WW2", login: "pandagame4418", password: "cod1452141" },
    { game: "Silent Hill 2", login: "aboodack", password: "DC5Z25E465DX" },
    { game: "Battlefield 5, ARK Survival", login: "zhangben6662", password: "BNKGTsnMWu" },
    { game: "Metro Last Light, Metro Exodus, Cyberpunk 2077", login: "cyberhitler1488", password: "Bbuv837FSgnB2" },
    { game: "Ghost Of Tsushima", login: "gihmt99337", password: "my_funpay_dtgame" },
    { game: "Black Myth Wukong", login: "mario_wukong", password: "QCP7PFHMW4VV" },
    { game: "Assetto Corsa, ETS 2, City Car Driving", login: "ShezyyyFunPay", password: "funpay.com/users/8943271/" },
    { game: "Metro Exodus и другие игры", login: "opgarpstore1", password: "safEA24O-" }
];

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Steam Checker</title>
    <style>
        :root { --bg: #0a0b10; --card: rgba(12, 12, 18, 0.8); --text: #e0e0e0; --text-muted: #8b92a1; --accent: #66c0f4; --ok: #00ff88; --err: #ff3355; --warn: #ffb800; }
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); display: flex; justify-content: center; min-height: 100vh; padding: 20px; }
        .container { background: var(--card); backdrop-filter: blur(16px); padding: 2rem; border-radius: 20px; width: 100%; max-width: 500px; border: 1px solid rgba(255,255,255,0.05); }
        .tabs { display: flex; gap: 4px; background: rgba(0,0,0,0.3); padding: 4px; border-radius: 12px; margin-bottom: 1.5rem; }
        .tab { flex: 1; padding: 10px; text-align: center; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); border-radius: 8px; cursor: pointer; transition: 0.3s; }
        .tab.active { background: var(--accent); color: #0a0b10; }
        .view { display: none; } .view.active { display: block; }
        .field { margin-bottom: 1rem; }
        .field input { width: 100%; padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; outline: none; }
        .field input:focus { border-color: var(--accent); }
        .btn { width: 100%; padding: 12px; background: var(--accent); color: #0a0b10; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn:hover { opacity: 0.9; } .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .result { margin-top: 1rem; padding: 12px; border-radius: 10px; font-weight: 700; text-align: center; display: none; }
        .result.ok { background: rgba(0,255,136,0.1); color: var(--ok); border: 1px solid rgba(0,255,136,0.3); }
        .result.err { background: rgba(255,51,85,0.1); color: var(--err); border: 1px solid rgba(255,51,85,0.3); }
        .acc-list { max-height: 400px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
        .acc-item { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
        .acc-game { font-weight: 700; color: var(--accent); margin-bottom: 8px; font-size: 0.9rem; }
        .acc-row { display: flex; gap: 8px; margin-bottom: 6px; align-items: center; }
        .acc-label { width: 60px; font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
        .acc-val { flex: 1; font-size: 0.85rem; font-family: monospace; background: rgba(0,0,0,0.3); padding: 6px 8px; border-radius: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .copy-btn { width: auto; padding: 6px 10px; font-size: 0.75rem; background: rgba(102,192,244,0.2); color: var(--accent); border: 1px solid rgba(102,192,244,0.3); border-radius: 6px; cursor: pointer; }
        .copy-btn:hover { background: rgba(102,192,244,0.4); }
        .check-btn { width: 100%; margin-top: 8px; padding: 8px; background: rgba(0,255,136,0.15); color: var(--ok); border: 1px solid rgba(0,255,136,0.3); border-radius: 8px; font-weight: 600; cursor: pointer; }
        .check-btn:hover { background: rgba(0,255,136,0.25); }
    </style>
</head>
<body>
    <div class="container">
        <div class="tabs">
            <div class="tab active" onclick="switchTab('checker')">Проверка</div>
            <div class="tab" onclick="switchTab('accounts')">Общие аккаунты</div>
        </div>

        <div id="checker" class="view active">
            <div class="field"><input type="text" id="username" placeholder="Логин Steam"></div>
            <div class="field"><input type="password" id="password" placeholder="Пароль"></div>
            <button class="btn" id="checkBtn" onclick="checkAccount()">Проверить</button>
            <div class="result" id="result"></div>
        </div>

        <div id="accounts" class="view">
            <div class="acc-list" id="accList"></div>
        </div>
    </div>

    <script>
        function switchTab(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(tab).classList.add('active');
            if (tab === 'accounts') renderAccounts();
        }

        function renderAccounts() {
            const list = document.getElementById('accList');
            if (list.children.length > 0) return;
            sharedAccounts.forEach((acc, i) => {
                const div = document.createElement('div');
                div.className = 'acc-item';
                div.innerHTML = \`
                    <div class="acc-game">\${acc.game}</div>
                    <div class="acc-row">
                        <span class="acc-label">Логин</span>
                        <span class="acc-val" id="l-\${i}">\${acc.login}</span>
                        <button class="copy-btn" onclick="copy('l-\${i}', this)">Копировать</button>
                    </div>
                    <div class="acc-row">
                        <span class="acc-label">Пароль</span>
                        <span class="acc-val" id="p-\${i}">\${acc.password}</span>
                        <button class="copy-btn" onclick="copy('p-\${i}', this)">Копировать</button>
                    </div>
                    <button class="check-btn" onclick="checkAcc('\${acc.login}', '\${acc.password}', this)">Проверить аккаунт</button>
                \`;
                list.appendChild(div);
            });
        }

        function copy(id, btn) {
            const text = document.getElementById(id).textContent;
            navigator.clipboard.writeText(text).then(() => {
                const orig = btn.textContent;
                btn.textContent = '✓';
                setTimeout(() => btn.textContent = orig, 1000);
            });
        }

        async function checkAcc(login, password, btn) {
            const orig = btn.textContent;
            btn.textContent = 'Проверка...';
            btn.disabled = true;
            try {
                const r = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: login, password: password })
                });
                const d = await r.json();
                if (d.status === 'success') {
                    btn.style.background = 'rgba(0,255,136,0.3)';
                    btn.textContent = '✓ Работает';
                } else {
                    btn.style.background = 'rgba(255,51,85,0.3)';
                    btn.textContent = '✗ Не работает';
                }
            } catch (e) {
                btn.textContent = 'Ошибка';
            }
            setTimeout(() => { btn.textContent = orig; btn.disabled = false; btn.style.background = ''; }, 2000);
        }

        async function checkAccount() {
            const u = document.getElementById('username').value.trim();
            const p = document.getElementById('password').value.trim();
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');
            
            if (!u || !p) {
                res.className = 'result err'; res.textContent = 'Заполните все поля'; res.style.display = 'block'; return;
            }
            
            btn.disabled = true; btn.textContent = 'Проверка...'; res.style.display = 'none';
            
            try {
                const r = await fetch('/check', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p })
                });
                const d = await r.json();
                res.style.display = 'block';
                if (d.status === 'success') {
                    res.className = 'result ok'; res.textContent = 'Аккаунт работает';
                } else {
                    res.className = 'result err'; res.textContent = 'Аккаунт не работает';
                }
            } catch (e) {
                res.className = 'result err'; res.textContent = 'Ошибка сети'; res.style.display = 'block';
            }
            btn.disabled = false; btn.textContent = 'Проверить';
        }
    </script>
</body>
</html>`;

async function checkSteamCredentials(username, password) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://steamcommunity.com/login/home/?goto=',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://steamcommunity.com'
    };

    let rsaData, sessionCookies = '';
    try {
        const rsaResponse = await axios.get('https://steamcommunity.com/login/getrsakey', { params: { username }, headers, timeout: 10000 });
        rsaData = rsaResponse.data;
        if (rsaResponse.headers['set-cookie']) {
            sessionCookies = rsaResponse.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
        }
    } catch (error) { return { status: 'error' }; }

    if (!rsaData.success) return { status: 'error' };

    let encryptedPasswordB64;
    try {
        const modBuf = Buffer.from(rsaData.publickey_mod, 'hex');
        const expBuf = Buffer.from(rsaData.publickey_exp, 'hex');
        
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
        const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`;

        const encrypted = crypto.publicEncrypt({ key: publicKeyPem, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(password, 'utf-8'));
        encryptedPasswordB64 = encrypted.toString('base64');
    } catch (error) { return { status: 'error' }; }

    const payload = new URLSearchParams({
        username, password: encryptedPasswordB64, twofactorcode: '', emailauth: '', loginfriendlyname: '',
        captchagid: '-1', captcha_text: '', emailsteamid: '', rsatimestamp: rsaData.timestamp,
        remember_login: 'false', donotcache: Date.now().toString()
    });

    const loginHeaders = { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' };
    if (sessionCookies) loginHeaders['Cookie'] = sessionCookies;

    try {
        const loginResponse = await axios.post('https://steamcommunity.com/login/dologin/', payload.toString(), { headers: loginHeaders, timeout: 10000 });
        const loginData = loginResponse.data;
        if (loginData.success) return { status: 'success' };
        return { status: 'error' };
    } catch (error) { return { status: 'error' }; }
}

app.get('/', (req, res) => res.send(HTML_TEMPLATE));

app.post('/check', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ status: 'error' });
    const result = await checkSteamCredentials(username.trim(), password.trim());
    res.json(result);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Сервер запущен на порту ${PORT}`));
