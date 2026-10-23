/**
 * Steam Account Checker — локальный веб-сервис проверки учётных записей Steam.
 * Использует RSA-шифрование пароля на стороне клиента перед отправкой.
 */

const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static('public'));

/**
 * Полная цепочка авторизации Steam:
 * 1. Получение RSA-ключа через /login/getrsakey
 * 2. Шифрование пароля публичным ключом
 * 3. Отправка зашифрованного пароля в /login/dologin/
 * 4. Парсинг ответа (успех / капча / 2FA / email / неверный пароль)
 */
async function checkSteamCredentials(username, password, captchaGid = '-1', captchaText = '') {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://steamcommunity.com/login/home/?goto=',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Origin': 'https://steamcommunity.com',
        'X-Requested-With': 'XMLHttpRequest'
    };

    // Шаг 1: RSA-ключ
    let rsaData;
    try {
        const rsaResponse = await axios.get(
            'https://steamcommunity.com/login/getrsakey',
            {
                params: { username },
                headers,
                timeout: 10000
            }
        );
        rsaData = rsaResponse.data;
    } catch (error) {
        return { status: 'error', message: `Ошибка получения ключа: ${error.message}` };
    }

    if (!rsaData.success) {
        return { status: 'error', message: 'аккаунт не работает (неверный логин)' };
    }

    // Шаг 2: Шифрование пароля
    let encryptedPasswordB64;
    try {
        const rsaMod = BigInt('0x' + rsaData.publickey_mod);
        const rsaExp = BigInt('0x' + rsaData.publickey_exp);
        const timestamp = rsaData.timestamp;

        // Создаём RSA-ключ в формате PEM
        const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n` +
            `MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA${rsaData.publickey_mod}\n` +
            `-----END PUBLIC KEY-----`;

        // Шифруем пароль
        const encrypted = crypto.publicEncrypt(
            {
                key: publicKeyPem,
                padding: crypto.constants.RSA_PKCS1_PADDING
            },
            Buffer.from(password, 'utf-8')
        );
        encryptedPasswordB64 = encrypted.toString('base64');
    } catch (error) {
        return { status: 'error', message: `Ошибка шифрования: ${error.message}` };
    }

    // Шаг 3: Авторизация
    const payload = new URLSearchParams({
        username: username,
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
        const loginResponse = await axios.post(
            'https://steamcommunity.com/login/dologin/',
            payload.toString(),
            {
                headers: {
                    ...headers,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 10000
            }
        );
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
        const captchaUrl = `https://steamcommunity.com/login/rendercaptcha/?gid=${newCaptchaGid}`;
        return {
            status: 'captcha',
            message: 'Требуется капча',
            captcha_gid: newCaptchaGid,
            captcha_url: captchaUrl
        };
    }

    if (loginData.requires_twofactor) {
        return { status: 'error', message: 'аккаунт не работает (стоит стим гвард)' };
    }

    if (loginData.emailauth_needed) {
        return { status: 'error', message: 'аккаунт не работает (требуется код из почты)' };
    }

    const message = loginData.message || 'Неверный логин или пароль';
    if (message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('wrong')) {
        return { status: 'error', message: 'аккаунт не работает (неверный пароль)' };
    }

    return { status: 'error', message: `аккаунт не работает (${message})` };
}

// Маршруты
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://0.0.0.0:${PORT}`);
    console.log(`Открой в браузере: http://localhost:${PORT}`);
});
