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
    { game: "Steam Account", login: "msk247542", password: "rae246924" }
];

const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Steam Tools</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#050508;
  --surface:rgba(12,12,18,0.6);
  --surface-2:rgba(18,18,26,0.8);
  --border:rgba(255,255,255,0.06);
  --text:#e8e8f0;
  --text-dim:#6b6b7d;
  --accent:#00d4ff;
  --accent-glow:rgba(0,212,255,0.4);
  --ok:#00ff9d;
  --err:#ff3366;
  --warn:#ffb800;
  --tg:#2AABEE;
}
html,body{background:var(--bg);color:var(--text);font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;min-height:100vh;overflow-x:hidden}
body{
  background:
    radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,212,255,0.08), transparent),
    radial-gradient(ellipse 60% 50% at 50% 120%, rgba(0,255,157,0.04), transparent),
    var(--bg);
  padding:32px 20px;
  display:flex;
  justify-content:center;
  align-items:flex-start;
}
.wrap{width:100%;max-width:480px}

.head{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:32px;
  padding:0 4px;
}
.logo{
  font-size:14px;
  font-weight:600;
  letter-spacing:3px;
  text-transform:uppercase;
  color:var(--text);
  display:flex;
  align-items:center;
  gap:10px;
}
.logo::before{
  content:'';
  width:8px;height:8px;
  border-radius:50%;
  background:var(--accent);
  box-shadow:0 0 12px var(--accent), 0 0 24px var(--accent-glow);
  animation:pulse 2.5s infinite;
}
@keyframes pulse{
  0%,100%{opacity:1;transform:scale(1)}
  50%{opacity:0.6;transform:scale(0.85)}
}
.online{
  font-size:12px;
  color:var(--text-dim);
  font-variant-numeric:tabular-nums;
  display:flex;
  align-items:center;
  gap:8px;
}
.online b{color:var(--accent);font-weight:600}

.tabs{
  display:flex;
  gap:4px;
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:14px;
  padding:4px;
  margin-bottom:24px;
  backdrop-filter:blur(20px);
}
.tab{
  flex:1;
  padding:12px;
  text-align:center;
  font-size:13px;
  font-weight:500;
  color:var(--text-dim);
  border-radius:10px;
  cursor:pointer;
  transition:all 0.3s ease;
  letter-spacing:0.3px;
}
.tab.active{
  background:rgba(0,212,255,0.08);
  color:var(--accent);
  box-shadow:inset 0 0 0 1px rgba(0,212,255,0.2), 0 0 20px rgba(0,212,255,0.08);
}
.tab:hover:not(.active){color:var(--text)}

.view{display:none;animation:fadeIn 0.4s ease}
.view.active{display:block}
@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.card{
  background:var(--surface);
  border:1px solid var(--border);
  border-radius:20px;
  padding:28px;
  backdrop-filter:blur(20px);
  position:relative;
  overflow:hidden;
}
.card::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(0,212,255,0.3),transparent);
}

.title{
  font-size:11px;
  letter-spacing:3px;
  text-transform:uppercase;
  color:var(--text-dim);
  margin-bottom:20px;
  font-weight:500;
}

.field{margin-bottom:14px;position:relative}
.field label{
  display:block;
  font-size:11px;
  letter-spacing:1.5px;
  text-transform:uppercase;
  color:var(--text-dim);
  margin-bottom:8px;
  font-weight:500;
}
.field input{
  width:100%;
  padding:14px 16px;
  background:rgba(0,0,0,0.3);
  border:1px solid var(--border);
  border-radius:10px;
  color:var(--text);
  font-size:14px;
  font-family:inherit;
  outline:none;
  transition:all 0.3s ease;
}
.field input::placeholder{color:var(--text-dim);font-size:13px}
.field input:focus{
  border-color:rgba(0,212,255,0.4);
  box-shadow:0 0 0 3px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.1);
  background:rgba(0,0,0,0.5);
}

.btn{
  width:100%;
  padding:15px;
  margin-top:8px;
  background:transparent;
  border:1px solid rgba(0,212,255,0.3);
  border-radius:10px;
  color:var(--accent);
  font-size:13px;
  font-weight:600;
  letter-spacing:2px;
  text-transform:uppercase;
  cursor:pointer;
  transition:all 0.3s ease;
  position:relative;
  overflow:hidden;
  font-family:inherit;
}
.btn::before{
  content:'';
  position:absolute;
  inset:0;
  background:linear-gradient(135deg,rgba(0,212,255,0.1),rgba(0,212,255,0.02));
  opacity:0;
  transition:opacity 0.3s ease;
}
.btn:hover::before{opacity:1}
.btn:hover{
  border-color:rgba(0,212,255,0.6);
  box-shadow:0 0 24px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.05);
}
.btn:active{transform:scale(0.98)}
.btn:disabled{
  opacity:0.4;
  cursor:not-allowed;
  border-color:var(--border);
  color:var(--text-dim);
}
.btn:disabled::before{display:none}

.btn-warn{
  border-color:rgba(255,184,0,0.3);
  color:var(--warn);
}
.btn-warn::before{background:linear-gradient(135deg,rgba(255,184,0,0.1),rgba(255,184,0,0.02))}
.btn-warn:hover{border-color:rgba(255,184,0,0.6);box-shadow:0 0 24px rgba(255,184,0,0.15)}

.result{
  margin-top:20px;
  padding:16px;
  border-radius:10px;
  font-size:13px;
  font-weight:600;
  letter-spacing:1.5px;
  text-transform:uppercase;
  text-align:center;
  display:none;
  animation:fadeIn 0.4s ease;
}
.result.show{display:block}
.result.ok{
  background:rgba(0,255,157,0.05);
  border:1px solid rgba(0,255,157,0.2);
  color:var(--ok);
  box-shadow:0 0 24px rgba(0,255,157,0.08);
}
.result.err{
  background:rgba(255,51,102,0.05);
  border:1px solid rgba(255,51,102,0.2);
  color:var(--err);
  box-shadow:0 0 24px rgba(255,51,102,0.08);
}
.result.warn{
  background:rgba(255,184,0,0.05);
  border:1px solid rgba(255,184,0,0.2);
  color:var(--warn);
  text-transform:none;
  letter-spacing:0.5px;
  font-weight:500;
}

.captcha-box{
  margin-top:20px;
  padding:20px;
  background:rgba(0,0,0,0.3);
  border:1px solid var(--border);
  border-radius:12px;
  display:none;
  animation:fadeIn 0.4s ease;
}
.captcha-box.show{display:block}
.captcha-box img{
  width:100%;
  border-radius:8px;
  margin-bottom:12px;
  background:#fff;
}

.search-box{
  position:relative;
  margin-bottom:16px;
}
.search-box input{
  width:100%;
  padding:12px 16px 12px 40px;
  background:rgba(0,0,0,0.3);
  border:1px solid var(--border);
  border-radius:10px;
  color:var(--text);
  font-size:13px;
  outline:none;
  transition:all 0.3s ease;
  font-family:inherit;
}
.search-box input:focus{
  border-color:rgba(0,212,255,0.4);
  box-shadow:0 0 0 3px rgba(0,212,255,0.08);
}
.search-box::before{
  content:'';
  position:absolute;
  left:16px;top:50%;
  transform:translateY(-50%);
  width:14px;height:14px;
  border:1.5px solid var(--text-dim);
  border-radius:50%;
}
.search-box::after{
  content:'';
  position:absolute;
  left:28px;top:50%;
  transform:translateY(-50%) rotate(45deg);
  width:1.5px;height:6px;
  background:var(--text-dim);
}

.count{
  font-size:11px;
  color:var(--text-dim);
  letter-spacing:1.5px;
  text-transform:uppercase;
  margin-bottom:14px;
  display:flex;
  justify-content:space-between;
}
.count b{color:var(--accent);font-weight:600}

.grid{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:8px;
  max-height:440px;
  overflow-y:auto;
  padding-right:4px;
}
.grid::-webkit-scrollbar{width:4px}
.grid::-webkit-scrollbar-track{background:transparent}
.grid::-webkit-scrollbar-thumb{background:rgba(0,212,255,0.2);border-radius:2px}

.item{
  background:rgba(0,0,0,0.3);
  border:1px solid var(--border);
  border-radius:10px;
  padding:14px 12px;
  cursor:pointer;
  transition:all 0.25s ease;
  text-align:left;
  min-height:72px;
  display:flex;
  align-items:center;
}
.item:hover{
  border-color:rgba(0,212,255,0.3);
  background:rgba(0,212,255,0.03);
  transform:translateY(-1px);
  box-shadow:0 4px 20px rgba(0,212,255,0.08);
}
.item span{
  font-size:12px;
  font-weight:500;
  line-height:1.4;
  color:var(--text);
  display:-webkit-box;
  -webkit-line-clamp:2;
  -webkit-box-orient:vertical;
  overflow:hidden;
}

.modal{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.85);
  backdrop-filter:blur(12px);
  display:none;
  justify-content:center;
  align-items:center;
  z-index:1000;
  padding:20px;
  animation:fadeIn 0.25s ease;
}
.modal.show{display:flex}
.modal-body{
  background:var(--surface-2);
  border:1px solid var(--border);
  border-radius:20px;
  padding:28px;
  width:100%;
  max-width:400px;
  position:relative;
  animation:modalIn 0.3s cubic-bezier(0.16,1,0.3,1);
}
@keyframes modalIn{from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
.modal-body::before{
  content:'';
  position:absolute;
  top:0;left:0;right:0;
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(0,212,255,0.4),transparent);
}
.modal-title{
  font-size:13px;
  letter-spacing:2px;
  text-transform:uppercase;
  color:var(--accent);
  text-align:center;
  margin-bottom:24px;
  font-weight:600;
  line-height:1.4;
}
.row{
  display:flex;
  gap:8px;
  margin-bottom:10px;
  align-items:center;
}
.row label{
  width:60px;
  font-size:10px;
  letter-spacing:1.5px;
  text-transform:uppercase;
  color:var(--text-dim);
  font-weight:500;
}
.row input{
  flex:1;
  padding:11px 12px;
  background:rgba(0,0,0,0.4);
  border:1px solid var(--border);
  border-radius:8px;
  color:var(--text);
  font-family:'SF Mono',Consolas,monospace;
  font-size:12px;
  outline:none;
}
.row button{
  padding:11px 14px;
  background:transparent;
  border:1px solid var(--border);
  border-radius:8px;
  color:var(--text-dim);
  font-size:11px;
  font-weight:600;
  letter-spacing:1px;
  text-transform:uppercase;
  cursor:pointer;
  transition:all 0.2s ease;
  font-family:inherit;
}
.row button:hover{
  border-color:var(--accent);
  color:var(--accent);
  box-shadow:0 0 12px rgba(0,212,255,0.15);
}
.row button.copied{
  border-color:var(--ok);
  color:var(--ok);
  background:rgba(0,255,157,0.05);
}

.btn-check{
  width:100%;
  padding:13px;
  margin-top:16px;
  background:transparent;
  border:1px solid rgba(0,255,157,0.3);
  border-radius:10px;
  color:var(--ok);
  font-size:12px;
  font-weight:600;
  letter-spacing:2px;
  text-transform:uppercase;
  cursor:pointer;
  transition:all 0.3s ease;
  font-family:inherit;
}
.btn-check:hover{
  border-color:rgba(0,255,157,0.6);
  box-shadow:0 0 24px rgba(0,255,157,0.15);
  background:rgba(0,255,157,0.03);
}
.btn-check:disabled{opacity:0.4;cursor:not-allowed}

.btn-close{
  width:100%;
  padding:12px;
  margin-top:10px;
  background:transparent;
  border:1px solid var(--border);
  border-radius:10px;
  color:var(--text-dim);
  font-size:11px;
  font-weight:600;
  letter-spacing:2px;
  text-transform:uppercase;
  cursor:pointer;
  transition:all 0.2s ease;
  font-family:inherit;
}
.btn-close:hover{border-color:rgba(255,51,102,0.3);color:var(--err)}

.modal-result{
  margin-top:14px;
  padding:12px;
  border-radius:8px;
  font-size:12px;
  font-weight:600;
  letter-spacing:1.5px;
  text-transform:uppercase;
  text-align:center;
  display:none;
}
.modal-result.show{display:block;animation:fadeIn 0.3s ease}

.footer{
  margin-top:24px;
  padding:0 4px;
}
.tg{
  display:flex;
  align-items:center;
  justify-content:center;
  gap:10px;
  padding:14px;
  background:transparent;
  border:1px solid rgba(42,171,238,0.25);
  border-radius:12px;
  color:var(--tg);
  text-decoration:none;
  font-size:12px;
  font-weight:600;
  letter-spacing:2px;
  text-transform:uppercase;
  transition:all 0.3s ease;
}
.tg:hover{
  border-color:rgba(42,171,238,0.5);
  box-shadow:0 0 24px rgba(42,171,238,0.15);
  background:rgba(42,171,238,0.03);
}
.tg svg{width:16px;height:16px;fill:currentColor}

.empty{
  text-align:center;
  padding:40px 20px;
  color:var(--text-dim);
  font-size:13px;
}
</style>
</head>
<body>
<div class="wrap">

  <div class="head">
    <div class="logo">Steam Tools</div>
    <div class="online"><b id="onlineCount">0</b> online</div>
  </div>

  <div class="tabs">
    <div class="tab active" data-view="checker">Проверка</div>
    <div class="tab" data-view="accounts">Общие аккаунты</div>
  </div>

  <div class="view active" id="view-checker">
    <div class="card">
      <div class="title">Auth Check</div>
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
        <img id="captchaImage" alt="captcha">
        <div class="field" style="margin-bottom:10px">
          <input type="text" id="captchaText" placeholder="код с картинки">
        </div>
        <button class="btn btn-warn" id="captchaBtn">Отправить</button>
      </div>

      <div class="result" id="result"></div>
    </div>
  </div>

  <div class="view" id="view-accounts">
    <div class="card">
      <div class="title">Shared Accounts</div>
      <div class="search-box">
        <input type="text" id="searchInput" placeholder="Поиск игры...">
      </div>
      <div class="count">
        <span>Найдено: <b id="countNum">0</b></span>
        <span>Всего: <b id="totalNum">0</b></span>
      </div>
      <div class="grid" id="grid"></div>
    </div>
  </div>

  <div class="footer">
    <a href="https://t.me/MirArenDaff" target="_blank" class="tg">
      <svg viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.119.098.152.228.166.319.016.101.017.204.011.285z"/></svg>
      Подпишись
    </a>
  </div>

</div>

<div class="modal" id="modal">
  <div class="modal-body">
    <div class="modal-title" id="modalTitle"></div>
    <div class="row">
      <label>Логин</label>
      <input type="text" id="mLogin" readonly>
      <button onclick="copy('mLogin',this)">Copy</button>
    </div>
    <div class="row">
      <label>Пароль</label>
      <input type="text" id="mPassword" readonly>
      <button onclick="copy('mPassword',this)">Copy</button>
    </div>
    <button class="btn-check" id="mCheckBtn">Проверить аккаунт</button>
    <div class="modal-result" id="mResult"></div>
    <button class="btn-close" onclick="closeModal()">Закрыть</button>
  </div>
</div>

<script>
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
    t.classList.add('active');
    document.getElementById('view-'+t.dataset.view).classList.add('active');
    if(t.dataset.view==='accounts')renderGrid();
  });
});

function renderGrid(filter=''){
  const grid=document.getElementById('grid');
  const f=filter.toLowerCase().trim();
  const list=f?sharedAccounts.filter(a=>a.game.toLowerCase().includes(f)):sharedAccounts;
  document.getElementById('countNum').textContent=list.length;
  document.getElementById('totalNum').textContent=sharedAccounts.length;
  if(!list.length){
    grid.innerHTML='<div class="empty" style="grid-column:1/-1">Ничего не найдено</div>';
    return;
  }
  grid.innerHTML=list.map((a,i)=>{
    const idx=sharedAccounts.indexOf(a);
    return '<div class="item" onclick="openModal('+idx+')"><span>'+escapeHtml(a.game)+'</span></div>';
  }).join('');
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

document.getElementById('searchInput').addEventListener('input',e=>renderGrid(e.target.value));

function openModal(i){
  const a=sharedAccounts[i];
  document.getElementById('modalTitle').textContent=a.game;
  document.getElementById('mLogin').value=a.login;
  document.getElementById('mPassword').value=a.password;
  document.getElementById('mResult').classList.remove('show');
  document.getElementById('mCheckBtn').disabled=false;
  document.getElementById('mCheckBtn').textContent='Проверить аккаунт';
  document.getElementById('modal').classList.add('show');
}
function closeModal(){document.getElementById('modal').classList.remove('show')}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});

function copy(id,btn){
  const el=document.getElementById(id);
  el.select();el.setSelectionRange(0,99999);
  navigator.clipboard.writeText(el.value).then(()=>{
    const orig=btn.textContent;
    btn.textContent='✓';
    btn.classList.add('copied');
    setTimeout(()=>{btn.textContent=orig;btn.classList.remove('copied')},1500);
  });
}

async function checkModal(){
  const login=document.getElementById('mLogin').value;
  const pass=document.getElementById('mPassword').value;
  const btn=document.getElementById('mCheckBtn');
  const res=document.getElementById('mResult');
  btn.disabled=true;btn.textContent='Проверка...';
  res.classList.remove('show');
  try{
    const r=await fetch('/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:login,password:pass,captcha_gid:'-1',captcha_text:''})});
    const d=await r.json();
    res.classList.add('show');
    if(d.status==='success'){res.className='modal-result show ok';res.textContent='Аккаунт работает';res.style.background='rgba(0,255,157,0.05)';res.style.border='1px solid rgba(0,255,157,0.2)';res.style.color='var(--ok)'}
    else{res.className='modal-result show err';res.textContent='Аккаунт не работает';res.style.background='rgba(255,51,102,0.05)';res.style.border='1px solid rgba(255,51,102,0.2)';res.style.color='var(--err)'}
  }catch(e){
    res.classList.add('show');
    res.className='modal-result show err';
    res.textContent='Ошибка соединения';
    res.style.background='rgba(255,51,102,0.05)';
    res.style.border='1px solid rgba(255,51,102,0.2)';
    res.style.color='var(--err)';
  }finally{btn.disabled=false;btn.textContent='Проверить аккаунт'}
}
document.getElementById('mCheckBtn').addEventListener('click',checkModal);

let captchaGid='-1',cooldown=null;
const COOLDOWN=15;

function startCooldown(){
  const btn=document.getElementById('checkBtn');
  let r=COOLDOWN;
  btn.disabled=true;btn.textContent='Подождите '+r+'с';
  if(cooldown)clearInterval(cooldown);
  cooldown=setInterval(()=>{
    r--;
    if(r<=0){clearInterval(cooldown);cooldown=null;btn.disabled=false;btn.textContent='Проверить'}
    else btn.textContent='Подождите '+r+'с';
  },1000);
}

function showResult(type,text){
  const r=document.getElementById('result');
  r.className='result show '+type;
  r.textContent=text;
}

async function doCheck(login,pass,gid,text){
  try{
    const r=await fetch('/check',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:login,password:pass,captcha_gid:gid,captcha_text:text})});
    return await r.json();
  }catch(e){return{status:'error'}}
}

document.getElementById('checkBtn').addEventListener('click',async()=>{
  const u=document.getElementById('username').value.trim();
  const p=document.getElementById('password').value.trim();
  if(!u||!p){showResult('err','Заполните поля');return}
  const btn=document.getElementById('checkBtn');
  btn.disabled=true;btn.textContent='Проверка...';
  document.getElementById('result').classList.remove('show');
  document.getElementById('captchaBox').classList.remove('show');
  const d=await doCheck(u,p,'-1','');
  if(d.status==='captcha'){
    captchaGid=d.captcha_gid;
    document.getElementById('captchaImage').src='/api/captcha/'+captchaGid;
    document.getElementById('captchaBox').classList.add('show');
    showResult('warn','Требуется капча');
  }else if(d.status==='success'){
    showResult('ok','Аккаунт работает');
  }else{
    showResult('err','Аккаунт не работает');
  }
  btn.disabled=false;btn.textContent='Проверить';
  startCooldown();
});

document.getElementById('captchaBtn').addEventListener('click',async()=>{
  const u=document.getElementById('username').value.trim();
  const p=document.getElementById('password').value.trim();
  const t=document.getElementById('captchaText').value.trim();
  if(!t){showResult('err','Введите код');return}
  const btn=document.getElementById('captchaBtn');
  btn.disabled=true;btn.textContent='Проверка...';
  const d=await doCheck(u,p,captchaGid,t);
  if(d.status==='captcha'){
    document.getElementById('captchaImage').src='/api/captcha/'+d.captcha_gid+'?t='+Date.now();
    captchaGid=d.captcha_gid;
    document.getElementById('captchaText').value='';
    showResult('warn','Неверная капча');
  }else if(d.status==='success'){
    document.getElementById('captchaBox').classList.remove('show');
    showResult('ok','Аккаунт работает');
  }else{
    document.getElementById('captchaBox').classList.remove('show');
    showResult('err','Аккаунт не работает');
  }
  btn.disabled=false;btn.textContent='Отправить';
  startCooldown();
});

let sid=sessionStorage.getItem('sid');
if(!sid){sid=Math.random().toString(36).slice(2);sessionStorage.setItem('sid',sid)}
function ping(){fetch('/ping',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:sid})}).catch(()=>{})}
setInterval(ping,10000);ping();
function updateOnline(){fetch('/stats').then(r=>r.json()).then(d=>{document.getElementById('onlineCount').textContent=d.online}).catch(()=>{})}
setInterval(updateOnline,5000);updateOnline();
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
