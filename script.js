// ===========================================================
// GalaxyHosting — JS (Aternos-style)
// ===========================================================

// ===== STATE =====
let serverState = 'offline'; // offline | starting | online
let currentUser = null;
let serverName = 'myserver';
let serverRam = 4;
let serverSoftware = 'Paper 1.20.4';
let installedPlugins = [];
let resourcesInterval = null;

const onlinePlayers = [
    'Steve','Alex','Notch','Dream','Technoblade','xXGamerXx','CoolBuilder',
    'RedstoneKing','DiamondMiner','ProPvP','Herobrine','EndermanSlayer'
];

// ===== PLUGINS DATA =====
const allPlugins = [
    { id:'essentials', name:'EssentialsX', icon:'⚡', ver:'v2.20.1', desc:'Базовые команды: дом, варп, телепорт, экономика', dl:'12.5M' },
    { id:'worldedit', name:'WorldEdit', icon:'🏗️', ver:'v7.2.15', desc:'Редактирование мира: выделение, заполнение, копирование', dl:'8.3M' },
    { id:'worldguard', name:'WorldGuard', icon:'🛡️', ver:'v7.0.9', desc:'Защита регионов от гриферов', dl:'7.1M' },
    { id:'vault', name:'Vault', icon:'💰', ver:'v1.7.3', desc:'API для экономики и прав', dl:'9.8M' },
    { id:'luckperms', name:'LuckPerms', icon:'🔑', ver:'v5.4.102', desc:'Система прав и групп с веб-редактором', dl:'6.2M' },
    { id:'placeholderapi', name:'PlaceholderAPI', icon:'📝', ver:'v2.11.5', desc:'API плейсхолдеров для плагинов', dl:'5.4M' },
    { id:'viaversion', name:'ViaVersion', icon:'🔄', ver:'v4.9.2', desc:'Подключение с разных версий клиента', dl:'4.7M' },
    { id:'skinsrestorer', name:'SkinsRestorer', icon:'👤', ver:'v15.0.7', desc:'Скины для пиратских серверов', dl:'3.8M' },
    { id:'authme', name:'AuthMe', icon:'🔐', ver:'v5.6.0', desc:'Авторизация для пиратских серверов', dl:'5.1M' },
    { id:'citizens', name:'Citizens', icon:'🤖', ver:'v2.0.33', desc:'Создание NPC для квестов и магазинов', dl:'3.2M' },
    { id:'mcmmo', name:'mcMMO', icon:'⚔️', ver:'v2.1.226', desc:'RPG система прокачки навыков', dl:'2.9M' },
    { id:'griefprevention', name:'GriefPrevention', icon:'🏠', ver:'v16.18.1', desc:'Защита построек через клеймы', dl:'4.1M' },
    { id:'dynmap', name:'Dynmap', icon:'🗺️', ver:'v3.6', desc:'Веб-карта мира в реальном времени', dl:'2.7M' },
    { id:'multiverse', name:'Multiverse-Core', icon:'🌐', ver:'v4.3.12', desc:'Несколько миров на одном сервере', dl:'3.5M' },
    { id:'holodisplays', name:'HolographicDisplays', icon:'✨', ver:'v3.0.1', desc:'Голографические надписи в мире', dl:'2.3M' },
    { id:'tab', name:'TAB', icon:'📊', ver:'v4.0.9', desc:'Настройка TAB-списка и префиксов', dl:'1.8M' },
    { id:'coreprotect', name:'CoreProtect', icon:'🔍', ver:'v21.3', desc:'Логирование блоков и откат грифа', dl:'3.4M' },
    { id:'clearlag', name:'ClearLagg', icon:'🧹', ver:'v3.2.2', desc:'Очистка лагающих энтити', dl:'2.1M' },
];

// ===== PAGE NAVIGATION =====
function showPage(page) {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'none';

    switch(page) {
        case 'landing':
            document.getElementById('landingPage').style.display = '';
            break;
        case 'login':
            document.getElementById('loginPage').style.display = '';
            break;
        case 'signup':
            document.getElementById('signupPage').style.display = '';
            break;
        case 'dashboard':
            document.getElementById('dashboardPage').style.display = '';
            break;
    }
    window.scrollTo(0, 0);
}

function goHome() {
    if (currentUser) {
        showPage('dashboard');
    } else {
        showPage('landing');
    }
}

// ===== MOBILE NAV =====
function toggleMobileNav() {
    document.getElementById('mobileNav').classList.toggle('open');
}

function scrollToEl(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ===== AUTH =====
function doLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    currentUser = email.split('@')[0] || 'Player';
    serverName = localStorage.getItem('gh_server') || 'myserver';
    serverRam = parseInt(localStorage.getItem('gh_ram')) || 4;
    serverSoftware = localStorage.getItem('gh_software') || 'Paper 1.20.4';
    installedPlugins = JSON.parse(localStorage.getItem('gh_plugins') || '[]');
    enterDashboard();
}

function doSignup(e) {
    e.preventDefault();
    currentUser = document.getElementById('signupUser').value;
    serverName = document.getElementById('signupServer').value.toLowerCase().replace(/[^a-z0-9]/g, '') || 'myserver';
    serverRam = parseInt(document.getElementById('signupRam').value);
    serverSoftware = document.getElementById('signupSoftware').value;
    installedPlugins = [];

    localStorage.setItem('gh_server', serverName);
    localStorage.setItem('gh_ram', serverRam);
    localStorage.setItem('gh_software', serverSoftware);
    localStorage.setItem('gh_plugins', '[]');

    enterDashboard();
    notify('🎉 Сервер ' + serverName + ' создан!', 'success');
    addActivity('Сервер создан');
}

function doLogout() {
    currentUser = null;
    serverState = 'offline';
    if (resourcesInterval) clearInterval(resourcesInterval);
    showPage('landing');
    notify('Вы вышли из аккаунта', 'info');
}

function enterDashboard() {
    document.getElementById('dashUsername').textContent = currentUser;
    document.getElementById('dashAvatar').textContent = currentUser[0].toUpperCase();
    document.getElementById('addressText').textContent = 'play.' + serverName + '.galaxy';
    document.getElementById('serverSoftware').textContent = serverSoftware;
    document.getElementById('serverRam').textContent = serverRam + ' ГБ';
    document.getElementById('serverPlayers').textContent = '0 / 50';
    updateServerUI();
    renderPluginSearch();
    renderInstalledPlugins();
    showPage('dashboard');
}

function updateDomainPreview() {
    const val = document.getElementById('signupServer').value.toLowerCase().replace(/[^a-z0-9]/g, '') || 'myserver';
    document.getElementById('domainPreview').innerHTML = 'play.<strong>' + val + '</strong>.galaxy';
}

// ===== SERVER CONTROL =====
function toggleServer() {
    if (serverState === 'offline') {
        startServer();
    } else if (serverState === 'online') {
        stopServer();
    }
}

function startServer() {
    serverState = 'starting';
    updateServerUI();
    addActivity('Сервер запускается...');
    addConsoleLine('[GalaxyHosting] Запуск сервера...', 'info');

    // Simulate startup
    setTimeout(() => addConsoleLine('[Server] Loading libraries...', 'info'), 500);
    setTimeout(() => addConsoleLine('[Server] Starting Minecraft server on *:25565', 'info'), 1200);
    setTimeout(() => addConsoleLine('[Server] Preparing level "world"', 'info'), 2000);
    setTimeout(() => addConsoleLine('[Server] Preparing start region for dimension minecraft:overworld', 'info'), 2800);

    const installedNames = installedPlugins.map(id => {
        const p = allPlugins.find(x => x.id === id);
        return p ? p.name : id;
    });
    if (installedNames.length > 0) {
        setTimeout(() => addConsoleLine('[Server] Loading plugins: ' + installedNames.join(', '), 'info'), 3200);
    }

    setTimeout(() => {
        addConsoleLine('[Server] Done (4.82s)! For help, type "help"', 'success');
        serverState = 'online';
        updateServerUI();
        addActivity('Сервер запущен');
        notify('✅ Сервер запущен! Адрес: play.' + serverName + '.galaxy', 'success');

        // Start resources monitor
        startResourcesMonitor();

        // Fake players joining
        setTimeout(() => {
            const count = Math.floor(Math.random() * 6) + 3;
            for (let i = 0; i < count; i++) {
                setTimeout(() => {
                    const name = onlinePlayers[Math.floor(Math.random() * onlinePlayers.length)];
                    addConsoleLine('[Server] ' + name + ' joined the game', 'info');
                }, i * 1500);
            }
        }, 2000);
    }, 4000);
}

function stopServer() {
    addConsoleLine('[Server] Stopping the server...', 'warn');
    addActivity('Остановка сервера...');

    setTimeout(() => {
        addConsoleLine('[Server] Saving worlds...', 'info');
    }, 500);

    setTimeout(() => {
        addConsoleLine('[GalaxyHosting] Сервер остановлен.', 'warn');
        serverState = 'offline';
        updateServerUI();
        addActivity('Сервер остановлен');
        notify('Сервер остановлен', 'warning');
        if (resourcesInterval) clearInterval(resourcesInterval);

        document.getElementById('resourcesPanel').style.display = 'none';
        document.getElementById('serverPlayers').textContent = '0 / 50';
        // Clear online players
        const msg = document.getElementById('noPlayersMsg');
        if (msg) msg.style.display = '';
    }, 2000);
}

function updateServerUI() {
    const circle = document.getElementById('statusCircle');
    const label = document.getElementById('statusLabel');
    const sub = document.getElementById('statusSub');
    const btn = document.getElementById('bigStartBtn');
    const btnIcon = document.getElementById('startBtnIcon');
    const btnText = document.getElementById('startBtnText');

    circle.className = 'status-circle ' + serverState;

    if (serverState === 'offline') {
        circle.innerHTML = '<i class="fas fa-power-off"></i>';
        label.textContent = 'Оффлайн';
        sub.textContent = 'Сервер остановлен';
        btn.className = 'big-start-btn';
        btnIcon.className = 'fas fa-play';
        btnText.textContent = 'Запустить';
    } else if (serverState === 'starting') {
        circle.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        label.textContent = 'Запускается...';
        sub.textContent = 'Подождите, сервер загружается';
        btn.className = 'big-start-btn starting';
        btnIcon.className = 'fas fa-spinner fa-spin';
        btnText.textContent = 'Запускается...';
    } else if (serverState === 'online') {
        circle.innerHTML = '<i class="fas fa-check"></i>';
        label.textContent = 'Онлайн';
        sub.textContent = 'play.' + serverName + '.galaxy';
        btn.className = 'big-start-btn running';
        btnIcon.className = 'fas fa-stop';
        btnText.textContent = 'Остановить';

        document.getElementById('resourcesPanel').style.display = '';

        // Show players
        renderOnlinePlayers();
    }
}

function startResourcesMonitor() {
    const update = () => {
        if (serverState !== 'online') return;
        const ramUsed = Math.floor(Math.random() * (serverRam * 1024 * 0.6) + serverRam * 1024 * 0.2);
        const ramTotal = serverRam * 1024;
        const cpuUsage = Math.floor(Math.random() * 50 + 10);
        const diskUsed = (Math.random() * 10 + 2).toFixed(1);
        const tps = (19 + Math.random()).toFixed(1);
        const playerCount = Math.floor(Math.random() * 8) + 3;

        document.getElementById('ramUsageText').textContent = ramUsed + ' / ' + ramTotal + ' МБ';
        document.getElementById('ramBar').style.width = ((ramUsed/ramTotal)*100) + '%';
        document.getElementById('cpuUsageText').textContent = cpuUsage + '%';
        document.getElementById('cpuBar').style.width = cpuUsage + '%';
        document.getElementById('diskUsageText').textContent = diskUsed + ' / 25 ГБ';
        document.getElementById('diskBar').style.width = ((parseFloat(diskUsed)/25)*100) + '%';
        document.getElementById('tpsText').textContent = tps;
        document.getElementById('tpsBar').style.width = ((parseFloat(tps)/20)*100) + '%';
        document.getElementById('serverPlayers').textContent = playerCount + ' / 50';
    };
    update();
    resourcesInterval = setInterval(update, 3000);
}

// ===== DASHBOARD TABS =====
function switchDashTab(e, tab) {
    e.preventDefault();
    document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.querySelectorAll('.dash-tab').forEach(t => t.classList.remove('active'));
    document.getElementById('dtab-' + tab).classList.add('active');
}

// ===== CONSOLE =====
function addConsoleLine(text, type) {
    const out = document.getElementById('consoleOutput');
    const line = document.createElement('div');
    line.className = 'c-line ' + (type || 'info');
    line.textContent = text;
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
}

function sendConsoleCmd() {
    const input = document.getElementById('consoleInput');
    const cmd = input.value.trim();
    if (!cmd) return;
    input.value = '';

    addConsoleLine('> ' + cmd, 'cmd');

    if (serverState !== 'online') {
        addConsoleLine('[GalaxyHosting] Сервер оффлайн. Сначала запустите сервер.', 'error');
        return;
    }

    setTimeout(() => {
        const resp = processCmd(cmd);
        addConsoleLine(resp.text, resp.type);
    }, 200);
}

function processCmd(cmd) {
    const c = cmd.toLowerCase();
    if (c === 'help') return { text: '[Server] Команды: help, list, say <msg>, time set <day/night>, weather <clear/rain>, gamemode <mode>, tps, seed, plugins, version, stop, op <player>, kick <player>, ban <player>', type: 'info' };
    if (c === 'list') {
        const count = Math.floor(Math.random()*8)+3;
        const names = onlinePlayers.slice(0, count).join(', ');
        return { text: '[Server] Онлайн (' + count + '/50): ' + names, type: 'info' };
    }
    if (c === 'tps') return { text: '[Server] TPS: ' + (19 + Math.random()).toFixed(2), type: 'success' };
    if (c === 'seed') return { text: '[Server] Seed: -4823947291038571', type: 'info' };
    if (c === 'version') return { text: '[Server] ' + serverSoftware, type: 'info' };
    if (c === 'plugins') {
        const names = installedPlugins.map(id => { const p = allPlugins.find(x=>x.id===id); return p?p.name:id; });
        return { text: '[Server] Плагины (' + names.length + '): ' + (names.join(', ')||'нет'), type: 'info' };
    }
    if (c === 'stop') { stopServer(); return { text: '[Server] Остановка...', type: 'warn' }; }
    if (c.startsWith('say ')) return { text: '[Server] [Server] ' + cmd.substring(4), type: 'info' };
    if (c === 'time set day') return { text: '[Server] Время: 1000 (день)', type: 'success' };
    if (c === 'time set night') return { text: '[Server] Время: 13000 (ночь)', type: 'success' };
    if (c === 'weather clear') return { text: '[Server] Погода: ясная', type: 'success' };
    if (c === 'weather rain') return { text: '[Server] Погода: дождь', type: 'success' };
    if (c.startsWith('gamemode ')) {
        const m = c.split(' ')[1];
        const modes = {survival:'Survival',creative:'Creative',adventure:'Adventure',spectator:'Spectator','0':'Survival','1':'Creative','2':'Adventure','3':'Spectator'};
        if (modes[m]) return { text: '[Server] Режим: ' + modes[m], type: 'success' };
    }
    if (c.startsWith('op ')) return { text: '[Server] ' + cmd.split(' ')[1] + ' теперь оператор', type: 'success' };
    if (c.startsWith('kick ')) return { text: '[Server] ' + cmd.split(' ')[1] + ' кикнут', type: 'warn' };
    if (c.startsWith('ban ')) return { text: '[Server] ' + cmd.split(' ')[1] + ' забанен', type: 'error' };
    return { text: '[Server] Неизвестная команда. Введите "help".', type: 'error' };
}

// ===== ACTIVITY LOG =====
function addActivity(text) {
    const list = document.getElementById('activityList');
    const now = new Date();
    const time = now.getHours().toString().padStart(2,'0') + ':' + now.getMinutes().toString().padStart(2,'0');
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = '<span class="act-time">' + time + '</span><span class="act-text">' + text + '</span>';
    list.prepend(item);
    // Keep max 20
    while (list.children.length > 20) list.removeChild(list.lastChild);
}

// ===== PLUGINS =====
function renderPluginSearch() {
    const container = document.getElementById('pluginSearchResults');
    container.innerHTML = '';
    allPlugins.forEach(p => {
        const isInstalled = installedPlugins.includes(p.id);
        const row = document.createElement('div');
        row.className = 'plugin-result-row';
        row.setAttribute('data-name', p.name.toLowerCase());
        row.innerHTML = `
            <div class="pr-left">
                <div class="pr-icon">${p.icon}</div>
                <div class="pr-info">
                    <div class="pr-name">${p.name} <span class="pr-meta">${p.ver}</span></div>
                    <div class="pr-desc">${p.desc}</div>
                    <div class="pr-meta"><i class="fas fa-download"></i> ${p.dl}</div>
                </div>
            </div>
            <button class="pr-install-btn ${isInstalled?'installed':''}" 
                    onclick="installPlugin('${p.id}', this)"
                    ${isInstalled?'disabled':''}>${isInstalled?'✓ Установлен':'Установить'}</button>
        `;
        container.appendChild(row);
    });
}

function filterPlugins() {
    const q = document.getElementById('pluginSearchInput').value.toLowerCase();
    document.querySelectorAll('.plugin-result-row').forEach(row => {
        const name = row.getAttribute('data-name');
        row.style.display = name.includes(q) ? '' : 'none';
    });
}

function installPlugin(id, btn) {
    if (installedPlugins.includes(id)) return;
    btn.textContent = '...';
    btn.disabled = true;

    setTimeout(() => {
        installedPlugins.push(id);
        localStorage.setItem('gh_plugins', JSON.stringify(installedPlugins));
        btn.textContent = '✓ Установлен';
        btn.classList.add('installed');
        const p = allPlugins.find(x => x.id === id);
        notify('Плагин ' + (p?p.name:id) + ' установлен!', 'success');
        addActivity('Установлен плагин ' + (p?p.name:id));
        addConsoleLine('[GalaxyHosting] Плагин ' + (p?p.name:id) + ' установлен.', 'success');
        renderInstalledPlugins();
    }, 1000);
}

function renderInstalledPlugins() {
    const container = document.getElementById('installedPluginsList');
    if (installedPlugins.length === 0) {
        container.innerHTML = '<div class="no-plugins-msg">Нет установленных плагинов. Перейдите в «Поиск плагинов» для установки.</div>';
        return;
    }
    container.innerHTML = '';
    installedPlugins.forEach(id => {
        const p = allPlugins.find(x => x.id === id);
        if (!p) return;
        const item = document.createElement('div');
        item.className = 'installed-plugin-item';
        item.innerHTML = `
            <div class="ip-left">
                <span class="ip-icon">${p.icon}</span>
                <span class="ip-name">${p.name}</span>
                <span class="ip-ver">${p.ver}</span>
            </div>
            <button class="ip-remove-btn" onclick="removePlugin('${id}',this.parentElement)"><i class="fas fa-trash"></i> Удалить</button>
        `;
        container.appendChild(item);
    });
}

function removePlugin(id, el) {
    installedPlugins = installedPlugins.filter(x => x !== id);
    localStorage.setItem('gh_plugins', JSON.stringify(installedPlugins));
    el.remove();
    const p = allPlugins.find(x => x.id === id);
    notify('Плагин ' + (p?p.name:id) + ' удалён', 'warning');
    addActivity('Удалён плагин ' + (p?p.name:id));
    renderPluginSearch();
    if (installedPlugins.length === 0) renderInstalledPlugins();
}

function switchPluginTab(e, tab) {
    e.currentTarget.parentElement.querySelectorAll('.ptab-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.querySelectorAll('.plugins-subtab').forEach(t => t.classList.remove('active'));
    document.getElementById('ptab-' + tab).classList.add('active');
}

// ===== PLAYERS =====
function renderOnlinePlayers() {
    const container = document.getElementById('onlinePlayersList');
    const msg = document.getElementById('noPlayersMsg');
    if (serverState !== 'online') {
        if (msg) msg.style.display = '';
        return;
    }
    if (msg) msg.style.display = 'none';

    // Clear old player cards but keep message
    container.querySelectorAll('.player-card-item').forEach(c => c.remove());

    const count = Math.floor(Math.random() * 6) + 4;
    const selected = [...onlinePlayers].sort(() => Math.random() - 0.5).slice(0, count);

    selected.forEach(name => {
        const card = document.createElement('div');
        card.className = 'player-card-item';
        card.innerHTML = `
            <div class="pc-avatar">${name[0]}</div>
            <div class="pc-info">
                <div class="pc-name">${name}</div>
                <div class="pc-sub">Ping: ${Math.floor(Math.random()*80+10)}ms</div>
            </div>
            <div class="pc-actions">
                <button onclick="kickPlayerAction('${name}')" title="Kick"><i class="fas fa-times"></i></button>
                <button onclick="banPlayerAction('${name}')" title="Ban"><i class="fas fa-ban"></i></button>
            </div>
        `;
        container.appendChild(card);
    });
}

function kickPlayerAction(name) {
    notify(name + ' кикнут', 'warning');
    addConsoleLine('[Server] ' + name + ' was kicked from the game', 'warn');
}

function banPlayerAction(name) {
    notify(name + ' забанен', 'error');
    addConsoleLine('[Server] Banned player ' + name, 'error');
}

function switchPlayerTab(e, tab) {
    e.currentTarget.parentElement.querySelectorAll('.ptab-btn').forEach(b => b.classList.remove('active'));
    e.currentTarget.classList.add('active');
    document.querySelectorAll('.players-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('pp-' + tab).classList.add('active');
}

function addOp() {
    const input = document.getElementById('opInput');
    const name = input.value.trim();
    if (!name) return;
    input.value = '';
    const list = document.getElementById('opsList');
    const item = document.createElement('div');
    item.className = 'simple-list-item';
    item.innerHTML = name + ' <button onclick="this.parentElement.remove();notify(\'ОП снят\',\'info\')"><i class="fas fa-times"></i></button>';
    list.appendChild(item);
    notify(name + ' добавлен как ОП', 'success');
    addConsoleLine('[Server] Opped ' + name, 'success');
}

function addWhitelist() {
    const input = document.getElementById('wlInput');
    const name = input.value.trim();
    if (!name) return;
    input.value = '';
    const list = document.getElementById('wlList');
    const item = document.createElement('div');
    item.className = 'simple-list-item';
    item.innerHTML = name + ' <button onclick="this.parentElement.remove();notify(\'Убран из whitelist\',\'info\')"><i class="fas fa-times"></i></button>';
    list.appendChild(item);
    notify(name + ' добавлен в whitelist', 'success');
}

function addBan() {
    const input = document.getElementById('banInput');
    const name = input.value.trim();
    if (!name) return;
    input.value = '';
    const list = document.getElementById('banList');
    const item = document.createElement('div');
    item.className = 'simple-list-item';
    item.innerHTML = name + ' <button onclick="this.parentElement.remove();notify(\'Разбанен\',\'info\')"><i class="fas fa-times"></i></button>';
    list.appendChild(item);
    notify(name + ' забанен', 'error');
    addConsoleLine('[Server] Banned ' + name, 'error');
}

// ===== BACKUPS =====
function createBackup() {
    notify('Создание бэкапа...', 'info');
    setTimeout(() => {
        const now = new Date();
        const d = now.toISOString().slice(0,10);
        const t = now.toTimeString().slice(0,5).replace(':','-');
        const name = 'backup_' + d + '_' + t + '.zip';
        const size = (Math.random()*50+120).toFixed(1);

        const list = document.getElementById('backupsList');
        const row = document.createElement('div');
        row.className = 'backup-row';
        row.innerHTML = `
            <div class="backup-row-info">
                <i class="fas fa-archive"></i>
                <div>
                    <div class="backup-name">${name}</div>
                    <div class="backup-sub">${size} MB • Ручной</div>
                </div>
            </div>
            <div class="backup-row-actions">
                <button class="btn-tab-action"><i class="fas fa-undo"></i> Восстановить</button>
                <button class="btn-tab-action"><i class="fas fa-download"></i> Скачать</button>
                <button class="btn-tab-action danger" onclick="this.closest('.backup-row').remove();notify('Бэкап удалён','warning')"><i class="fas fa-trash"></i></button>
            </div>
        `;
        list.prepend(row);
        notify('✅ Бэкап создан: ' + name, 'success');
        addActivity('Создан бэкап');
    }, 2000);
}

// ===== COPY ADDRESS =====
function copyAddress() {
    const addr = document.getElementById('addressText').textContent;
    navigator.clipboard.writeText(addr).then(() => {
        notify('📋 Адрес скопирован: ' + addr, 'success');
    }).catch(() => {
        notify('Адрес: ' + addr, 'info');
    });
}

// ===== NOTIFICATIONS =====
function notify(message, type) {
    type = type || 'info';
    const container = document.getElementById('toasts');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icons = { success:'fa-check-circle', error:'fa-exclamation-circle', warning:'fa-exclamation-triangle', info:'fa-info-circle' };
    toast.innerHTML = '<i class="fas ' + (icons[type]||icons.info) + '"></i><span>' + message + '</span>';
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut .3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    showPage('landing');
    renderPluginSearch();
});
