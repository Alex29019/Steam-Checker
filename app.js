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

// База аккаунтов Steam (458 аккаунтов)
const steamAccounts = [
  {"login":"beamngdrive123steam1","password":"Kte!22ijaAII12","game":"BeamNG Drive"},
  {"login":"uncharted_st","password":"UNCHARTED@8804","game":"UNCHARTED: Legacy of Thieves Collection"},
  {"login":"nmsukt191","password":"batzaza191","game":"Steam Account #3"},
  {"login":"gfk66337","password":"Acp234213","game":"Black Myth Wukong"},
  {"login":"0855j9","password":"zZ10301030","game":"Steam Account #5"},
  {"login":"groggymovement4","password":"DCN_LliOQhv","game":"Marvel's Spider Man 2"},
  {"login":"ynysa422","password":"@Gamerspace123","game":"Red Dead Redemption 2"},
  {"login":"rnmiike","password":"THEGODMIKE1","game":"Steam Account #8"},
  {"login":"mklvn2y9","password":"zhizhure1221","game":"Marvel's Spider Man Remastered"},
  {"login":"nicasacracacenri","password":"EBA9Y59KGCTB","game":"Hogwarts Legacy"},
  {"login":"jocuriargenrinia","password":"70Games.net92","game":"Resident Evil 7 Biohazard"},
  {"login":"wqm322495","password":"ac7QPfa3","game":"Grand Theft Auto 4"},
  {"login":"vonterr","password":"889162","game":"Horizon Forbidden West Complete Edition"},
  {"login":"orderlyinoculat","password":"axQUk8etMajK","game":"Cyberpunk 2077"},
  {"login":"earthlnwza5566","password":"2G6TEM5ZAZC6","game":"Steam Account #15"},
  {"login":"nfpprsq3h","password":"f1qslg5kp","game":"Euro Truck Simulator 2"},
  {"login":"wf6ju3bf5wc3","password":"qKnh6N9SLiMxyvXVX36d","game":"Atomic Heart"},
  {"login":"bej01201","password":"Bejdw11201","game":"Forza Horizon 5"},
  {"login":"dimkoxd","password":"2G6TEM5ZAZC6","game":"Steam Account #19"},
  {"login":"steam123z17","password":"ZXCVBNMQQ","game":"Steam Account #20"},
  {"login":"twistnewold","password":"5sMgwST4L5j","game":"Lego Marvel Super Heroes"}
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
            width: 100%; max-width: 500px; text-align: center; position: relative;
            animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lang-switcher {
            position: absolute; top: 15px; right: 15px; display: flex; gap: 8px;
            background: rgba(15, 16, 20, 0.6); padding: 4px; border-radius: 8px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .lang-opt {
            font-size: 0.75rem; font-weight: 700; color: var(--text-muted); cursor: pointer;
            padding: 4px 8px; border-radius: 6px; transition: all 0.2s ease; user-select: none;
        }
        .lang-opt.active { background: var(--accent); color: #0a0b10; }
        .lang-opt:hover:not(.active) { color: var(--text); }
        
        .tabs {
            display: flex; gap: 10px; margin-bottom: 1.5rem; background: rgba(15, 16, 20, 0.6);
            padding: 4px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .tab {
            flex: 1; padding: 12px; border-radius: 8px; cursor: pointer;
            font-weight: 600; font-size: 0.9rem; transition: all 0.2s ease;
            color: var(--text-muted);
        }
        .tab.active { background: var(--accent); color: #0a0b10; }
        .tab:hover:not(.active) { color: var(--text); }
        
        .section { display: none; }
        .section.active { display: block; }
        
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        h2 { margin: 0; color: var(--accent); text-transform: uppercase; font-size: 1.1rem; letter-spacing: 2px; font-weight: 700; }
        .online-badge {
            display: flex; align-items: center; gap: 6px; background: rgba(0, 255, 136, 0.1);
            color: var(--ok); padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600;
            border: 1px solid rgba(0, 255, 136, 0.2);
        }
        .online-dot { width: 8px; height: 8px; background: var(--ok); border-radius: 50%; animation: pulse 2s infinite; }
        .input-group { position: relative; margin-bottom: 1.2rem; }
        input {
            width: 100%; padding: 14px 16px; background: rgba(15, 16, 20, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; color: white;
            font-size: 1rem; outline: none; transition: all 0.3s ease;
        }
        input::placeholder { color: var(--text-muted); }
        input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); background: rgba(15, 16, 20, 0.9); }
        button {
            width: 100%; padding: 14px; margin-top: 0.5rem;
            background: linear-gradient(135deg, var(--accent) 0%, #4a9fd4 100%);
            color: #0a0b10; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700;
            cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(102, 192, 244, 0.2);
        }
        button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102, 192, 244, 0.4); }
        button:active:not(:disabled) { transform: translateY(0); }
        button:disabled { background: #2a2e38; color: #666; cursor: not-allowed; box-shadow: none; }
        #result {
            margin-top: 1.5rem; padding: 14px; border-radius: 10px; font-weight: 700; font-size: 1rem;
            display: none; animation: popIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); text-transform: uppercase; letter-spacing: 1px;
        }
        .success { background: rgba(0, 255, 136, 0.1); color: var(--ok); border: 1px solid rgba(0, 255, 136, 0.3); }
        .error { background: rgba(255, 51, 85, 0.1); color: var(--err); border: 1px solid rgba(255, 51, 85, 0.3); }
        .captcha { background: rgba(255, 170, 0, 0.1); color: var(--warn); border: 1px solid rgba(255, 170, 0, 0.3); text-transform: none; letter-spacing: 0; font-weight: 600; font-size: 0.95rem; }
        #captchaSection {
            display: none; margin-top: 1.5rem; padding: 1.2rem; background: rgba(15, 16, 20, 0.6);
            border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); animation: slideDown 0.4s ease;
        }
        #captchaSection p { margin: 0 0 10px 0; color: var(--warn); font-size: 0.9rem; font-weight: 600; }
        #captchaImage { max-width: 100%; border-radius: 8px; margin-bottom: 12px; border: 1px solid rgba(255,255,255,0.1); background: #fff; }
        .divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent); margin: 2rem 0 1.5rem 0; }
        .tg-button {
            display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px;
            background: linear-gradient(135deg, var(--tg) 0%, #229ED9 100%); color: white; text-decoration: none;
            border-radius: 10px; font-weight: 700; font-size: 1rem; transition: all 0.2s ease; box-shadow: 0 4px 15px rgba(42, 171, 238, 0.2);
        }
        .tg-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(42, 171, 238, 0.4); }
        .tg-button svg { width: 20px; height: 20px; fill: currentColor; }
        
        /* Accounts Grid */
        .accounts-search {
            margin-bottom: 1rem;
        }
        .accounts-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            max-height: 300px;
            overflow-y: auto;
            padding: 10px;
            background: rgba(15, 16, 20, 0.4);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .account-card {
            background: rgba(27, 30, 38, 0.8);
            padding: 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.08);
            text-align: left;
        }
        .account-card:hover {
            transform: translateY(-2px);
            border-color: var(--accent);
            box-shadow: 0 4px 12px rgba(102, 192, 244, 0.2);
        }
        .account-card-game {
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .account-card-count {
            font-size: 0.7rem;
            color: var(--text-muted);
            margin-top: 4px;
        }
        
        /* Modal */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(8px);
            z-index: 1000;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .modal.active { display: flex; }
        .modal-content {
            background: var(--card);
            backdrop-filter: blur(16px);
            padding: 2rem;
            border-radius: 16px;
            width: 100%;
            max-width: 400px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            animation: popIn 0.3s ease;
        }
        .modal-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--accent);
            margin-bottom: 1.5rem;
            text-align: center;
        }
        .modal-field {
            margin-bottom: 1rem;
        }
        .modal-label {
            font-size: 0.8rem;
            color: var(--text-muted);
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .modal-value {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        .modal-input {
            flex: 1;
            padding: 12px;
            background: rgba(15, 16, 20, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: var(--text);
            font-family: monospace;
            font-size: 0.9rem;
        }
        .copy-btn {
            padding: 12px 16px;
            background: var(--accent);
            color: #0a0b10;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 700;
            transition: all 0.2s ease;
            margin-top: 0;
            width: auto;
        }
        .copy-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 192, 244, 0.3);
        }
        .copy-btn.copied {
            background: var(--ok);
        }
        .modal-close {
            width: 100%;
            padding: 12px;
            background: rgba(255, 51, 85, 0.2);
            color: var(--err);
            border: 1px solid rgba(255, 51, 85, 0.3);
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            margin-top: 1rem;
            transition: all 0.2s ease;
        }
        .modal-close:hover {
            background: rgba(255, 51, 85, 0.3);
        }
        
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(0, 255, 136, 0); } 100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="lang-switcher">
            <span class="lang-opt" data-lang="ru">RUS</span>
            <span class="lang-opt" data-lang="en">EN</span>
        </div>
        
        <div class="tabs">
            <div class="tab active" data-tab="checker">Checker</div>
            <div class="tab" data-tab="accounts">Accounts</div>
        </div>
        
        <!-- Checker Section -->
        <div class="section active" id="checkerSection">
            <div class="header">
                <h2 id="checkerTitle">Проверка аккаунта</h2>
                <div class="online-badge"><div class="online-dot"></div><span id="onlineCount">0</span></div>
            </div>
            <div class="input-group"><input type="text" id="username" placeholder="Логин Steam" autocomplete="off"></div>
            <div class="input-group"><input type="password" id="password" placeholder="Пароль"></div>
            <button id="checkBtn" onclick="checkAccount()">Проверить</button>
            
            <div id="captchaSection">
                <p id="captchaPrompt">Введите код с картинки:</p>
                <img id="captchaImage" src="" alt="CAPTCHA">
                <input type="text" id="captchaText" placeholder="Введите код" style="margin-top: 0;">
                <button onclick="submitWithCaptcha()" style="margin-top: 10px; background: linear-gradient(135deg, var(--warn) 0%, #e69500 100%);" id="captchaBtn">Отправить с капчей</button>
            </div>
            <div id="result"></div>
        </div>
        
        <!-- Accounts Section -->
        <div class="section" id="accountsSection">
            <div class="header">
                <h2 id="accountsTitle">Общие аккаунты</h2>
                <div class="online-badge"><div class="online-dot"></div><span id="accountsCount">0</span></div>
            </div>
            <div class="accounts-search">
                <input type="text" id="accountsSearch" placeholder="Поиск игры..." oninput="filterAccounts()">
            </div>
            <div class="accounts-grid" id="accountsGrid">
                <!-- Cards will be inserted here -->
            </div>
        </div>
        
        <div class="divider"></div>
        <a href="https://t.me/MirArenDaff" target="_blank" class="tg-button" id="tgButton">
            <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.319.016.101.017.204.011.285z"/></svg>
            <span id="tgButtonText">Подпишись (:</span>
        </a>
    </div>
    
    <!-- Modal -->
    <div class="modal" id="accountModal">
        <div class="modal-content">
            <div class="modal-title" id="modalTitle">Account Details</div>
            <div class="modal-field">
                <div class="modal-label">Login</div>
                <div class="modal-value">
                    <input type="text" class="modal-input" id="modalLogin" readonly>
                    <button class="copy-btn" onclick="copyToClipboard('modalLogin', this)">Copy</button>
                </div>
            </div>
            <div class="modal-field">
                <div class="modal-label">Password</div>
                <div class="modal-value">
                    <input type="password" class="modal-input" id="modalPassword" readonly>
                    <button class="copy-btn" onclick="copyToClipboard('modalPassword', this)">Copy</button>
                </div>
            </div>
            <button class="modal-close" onclick="closeModal()" id="modalCloseBtn">Close</button>
        </div>
    </div>

    <script>
        const translations = {
            ru: {
                checkerTitle: "Проверка аккаунта", phLogin: "Логин Steam", phPass: "Пароль", btnCheck: "Проверить",
                captchaPrompt: "Введите код с картинки:", phCaptcha: "Введите код", btnCaptcha: "Отправить с капчей",
                errEmpty: "Заполните все поля", errFail: "Аккаунт не работает", success: "Аккаунт работает",
                reqCaptcha: "Требуется капча", badCaptcha: "Неверная капча, попробуйте снова", tgBtn: "Подпишись (:",
                accountsTitle: "Общие аккаунты", phSearch: "Поиск игры...", modalClose: "Закрыть"
            },
            en: {
                checkerTitle: "Account Check", phLogin: "Steam Login", phPass: "Password", btnCheck: "Check",
                captchaPrompt: "Enter code from image:", phCaptcha: "Enter code", btnCaptcha: "Submit with captcha",
                errEmpty: "Fill in all fields", errFail: "Account does not work", success: "Account works",
                reqCaptcha: "Captcha required", badCaptcha: "Invalid captcha, try again", tgBtn: "Subscribe (:",
                accountsTitle: "Shared Accounts", phSearch: "Search game...", modalClose: "Close"
            }
        };

        let currentLang = localStorage.getItem('lang') || 'ru';
        let allAccounts = [];

        function applyLanguage(lang) {
            currentLang = lang;
            localStorage.setItem('lang', lang);
            document.querySelectorAll('.lang-opt').forEach(el => el.classList.toggle('active', el.dataset.lang === lang));
            const t = translations[lang];
            document.getElementById('checkerTitle').textContent = t.checkerTitle;
            document.getElementById('accountsTitle').textContent = t.accountsTitle;
            document.getElementById('username').placeholder = t.phLogin;
            document.getElementById('password').placeholder = t.phPass;
            document.getElementById('checkBtn').textContent = t.btnCheck;
            document.getElementById('captchaPrompt').textContent = t.captchaPrompt;
            document.getElementById('captchaText').placeholder = t.phCaptcha;
            document.getElementById('captchaBtn').textContent = t.btnCaptcha;
            document.getElementById('accountsSearch').placeholder = t.phSearch;
            document.getElementById('modalCloseBtn').textContent = t.modalClose;
            document.getElementById('tgButtonText').textContent = t.tgBtn;
        }

        document.querySelectorAll('.lang-opt').forEach(el => el.addEventListener('click', () => applyLanguage(el.dataset.lang)));
        applyLanguage(currentLang);

        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab + 'Section').classList.add('active');
            });
        });

        // Load accounts
        async function loadAccounts() {
            try {
                const response = await fetch('/api/accounts');
                allAccounts = await response.json();
                document.getElementById('accountsCount').textContent = allAccounts.length;
                renderAccounts(allAccounts);
            } catch (error) {
                console.error('Error loading accounts:', error);
            }
        }

        function renderAccounts(accounts) {
            const grid = document.getElementById('accountsGrid');
            grid.innerHTML = '';
            
            // Group by game
            const grouped = {};
            accounts.forEach(acc => {
                if (!grouped[acc.game]) grouped[acc.game] = [];
                grouped[acc.game].push(acc);
            });
            
            Object.keys(grouped).slice(0, 50).forEach(game => {
                const card = document.createElement('div');
                card.className = 'account-card';
                card.innerHTML = \`
                    <div class="account-card-game">\${game}</div>
                    <div class="account-card-count">\${grouped[game].length} account(s)</div>
                \`;
                card.onclick = () => showAccountModal(grouped[game][0]);
                grid.appendChild(card);
            });
        }

        function filterAccounts() {
            const query = document.getElementById('accountsSearch').value.toLowerCase();
            const filtered = allAccounts.filter(acc => acc.game.toLowerCase().includes(query));
            renderAccounts(filtered);
        }

        function showAccountModal(account) {
            document.getElementById('modalTitle').textContent = account.game;
            document.getElementById('modalLogin').value = account.login;
            document.getElementById('modalPassword').value = account.password;
            document.getElementById('accountModal').classList.add('active');
        }

        function closeModal() {
            document.getElementById('accountModal').classList.remove('active');
        }

        function copyToClipboard(elementId, btn) {
            const input = document.getElementById(elementId);
            input.select();
            document.execCommand('copy');
            const originalText = btn.textContent;
            btn.textContent = '✓';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('copied');
            }, 1500);
        }

        // Close modal on outside click
        document.getElementById('accountModal').addEventListener('click', (e) => {
            if (e.target.id === 'accountModal') closeModal();
        });

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
            btn.disabled = true;
            if (cooldownTimer) clearInterval(cooldownTimer);
            cooldownTimer = setInterval(() => {
                remaining--;
                if (remaining <= 0) { 
                    clearInterval(cooldownTimer); 
                    cooldownTimer = null; 
                    btn.disabled = false; 
                    btn.textContent = translations[currentLang].btnCheck; 
                } else { 
                    btn.textContent = (currentLang === 'ru' ? 'Подождите ' : 'Wait ') + remaining + 's...'; 
                }
            }, 1000);
        }

        async function checkAccount() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');
            const t = translations[currentLang];
            
            if (!u || !p) { res.className = 'error'; res.textContent = t.errEmpty; res.style.display = 'block'; return; }
            
            btn.disabled = true; btn.textContent = t.btnCheck + '...'; res.style.display = 'none';
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
                    res.className = 'captcha'; res.textContent = t.reqCaptcha; res.style.display = 'block';
                } else if (data.status === 'success') {
                    res.className = 'success'; res.textContent = t.success; res.style.display = 'block';
                } else {
                    res.className = 'error'; res.textContent = t.errFail; res.style.display = 'block';
                }
            } catch (error) {
                res.className = 'error'; res.textContent = t.errFail; res.style.display = 'block';
            } finally { startCooldown(); }
        }

        async function submitWithCaptcha() {
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            const captchaText = document.getElementById('captchaText').value;
            const btn = document.getElementById('checkBtn');
            const res = document.getElementById('result');
            const t = translations[currentLang];
            
            if (!captchaText) { res.className = 'error'; res.textContent = t.errEmpty; res.style.display = 'block'; return; }
            
            btn.disabled = true; btn.textContent = t.btnCheck + '...'; res.style.display = 'none';
            
            try {
                const response = await fetch('/check', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: u, password: p, captcha_gid: currentCaptchaGid, captcha_text: captchaText })
                });
                const data = await response.json();
                if (data.status === 'captcha') {
                    document.getElementById('captchaImage').src = '/api/captcha/' + data.captcha_gid + '?t=' + Date.now();
                    document.getElementById('captchaText').value = '';
                    res.className = 'captcha'; res.textContent = t.badCaptcha; res.style.display = 'block';
                } else if (data.status === 'success') {
                    document.getElementById('captchaSection').style.display = 'none';
                    res.className = 'success'; res.textContent = t.success; res.style.display = 'block';
                } else {
                    document.getElementById('captchaSection').style.display = 'none';
                    res.className = 'error'; res.textContent = t.errFail; res.style.display = 'block';
                }
            } catch (error) {
                res.className = 'error'; res.textContent = t.errFail; res.style.display = 'block';
            } finally { startCooldown(); }
        }

        // Load accounts on page load
        loadAccounts();
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
    return \`-----BEGIN PUBLIC KEY-----\n\${b64.match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----\`;
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

// API для получения списка аккаунтов
app.get('/api/accounts', (req, res) => {
    res.json(steamAccounts);
});

app.get('/api/captcha/:gid', async (req, res) => {
    try {
        const response = await axios.get(\`https://steamcommunity.com/login/rendercaptcha/?gid=\${req.params.gid}\`, {
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

app.listen(PORT, '0.0.0.0', () => console.log(\`Сервер запущен на порту \${PORT}\`));
