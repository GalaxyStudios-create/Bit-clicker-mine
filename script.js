// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
let isRunning = false;
let ram = 0;
let cpu = 0;
let players = 0;
let uptime = 0;
let uptimeTimer = null;
let activityTimer = null;
let serverName = 'myserver';

// МОДАЛЬНЫЕ ОКНА
function openLogin() {
    document.getElementById('loginModal').classList.add('active');
}

function closeLogin() {
    document.getElementById('loginModal').classList.remove('active');
}

function openRegister() {
    document.getElementById('registerModal').classList.add('active');
}

function closeRegister() {
    document.getElementById('registerModal').classList.remove('active');
}

// ВХОД
function doLogin() {
    closeLogin();
    showDashboard();
    log('[GalaxyHosting] ✅ Успешный вход');
}

// РЕГИСТРАЦИЯ
function doRegister() {
    closeRegister();
    showDashboard();
    log('[GalaxyHosting] ✅ Аккаунт создан!');
    updateIP();
}

// ПОКАЗАТЬ ПАНЕЛЬ
function showDashboard() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('features').style.display = 'none';
    document.querySelector('.navbar').style.display = 'none';
    document.getElementById('dashboard').classList.add('active');
}

// ВЫХОД
function doLogout() {
    if (isRunning) {
        if (!confirm('⚠️ Сервер запущен! Выйти?')) return;
        stopServer();
    }
    document.getElementById('dashboard').classList.remove('active');
    document.querySelector('.navbar').style.display = 'block';
    document.getElementById('home').style.display = 'flex';
    document.getElementById('features').style.display = 'block';
}

// ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(t => t.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
}

// ЗАПУСК СЕРВЕРА
function startServer() {
    if (isRunning) {
        alert('⚠️ Сервер уже запущен!');
        return;
    }

    isRunning = true;
    uptime = 0;
    updateStatus();

    const version = document.getElementById('mcVersion').value;
    const type = document.getElementById('serverType').value;
    const ip = document.getElementById('serverIP').textContent;

    log('[GalaxyHosting] ========================================');
    log('[GalaxyHosting] 🚀 Запуск сервера...');
    log('[GalaxyHosting] IP: ' + ip);
    log('[GalaxyHosting] Версия: ' + version);
    log('[GalaxyHosting] Тип: ' + type);

    setTimeout(() => {
        log('[' + type + '] Starting minecraft server version ' + version);
    }, 1000);

    setTimeout(() => {
        log('[Minecraft] Loading libraries...');
    }, 2000);

    setTimeout(() => {
        log('[Minecraft] Preparing level "world"');
    }, 3000);

    setTimeout(() => {
        log('[Minecraft] Preparing spawn area: 0%');
    }, 4000);

    setTimeout(() => {
        log('[Minecraft] Preparing spawn area: 47%');
    }, 4500);

    setTimeout(() => {
        log('[Minecraft] Preparing spawn area: 83%');
    }, 5000);

    setTimeout(() => {
        log('[Minecraft] Done! Server started successfully');
        log('[Minecraft] Server is running on *:25565');
        log('[GalaxyHosting] ✅ Сервер запущен!');
        log('[GalaxyHosting] 📌 Подключайтесь: ' + ip);
        startUptime();
        startActivity();
    }, 5500);
}

// ОСТАНОВКА СЕРВЕРА
function stopServer() {
    if (!isRunning) {
        alert('⚠️ Сервер уже остановлен!');
        return;
    }

    log('[GalaxyHosting] 🛑 Остановка сервера...');
    log('[Minecraft] Stopping server');
    log('[Minecraft] Saving worlds...');

    setTimeout(() => {
        log('[Minecraft] Saved the game');
        log('[GalaxyHosting] ✅ Сервер остановлен');
        isRunning = false;
        ram = 0;
        cpu = 0;
        players = 0;
        uptime = 0;
        clearInterval(uptimeTimer);
        clearInterval(activityTimer);
        updateStatus();
        updatePlayers([]);
    }, 1500);
}

// ПЕРЕЗАПУСК
function restartServer() {
    if (!isRunning) {
        startServer();
        return;
    }

    log('[GalaxyHosting] 🔄 Перезапуск...');
    isRunning = false;
    clearInterval(uptimeTimer);
    clearInterval(activityTimer);

    setTimeout(() => {
        startServer();
    }, 2000);
}

// ОБНОВЛЕНИЕ СТАТУСА
function updateStatus() {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');

    if (isRunning) {
        dot.classList.add('online');
        text.textContent = '🟢 Онлайн';
    } else {
        dot.classList.remove('online');
        text.textContent = '🔴 Оффлайн';
    }

    document.getElementById('ramDisplay').textContent = Math.round(ram) + ' MB / 6144 MB';
    document.getElementById('ramProgress').style.width = (ram / 6144 * 100) + '%';
    document.getElementById('playersDisplay').textContent = players + '/100';
    document.getElementById('playerCount').textContent = players;
    document.getElementById('cpuDisplay').textContent = cpu + '%';
}

// UPTIME
function startUptime() {
    uptimeTimer = setInterval(() => {
        uptime++;
        const h = Math.floor(uptime / 3600);
        const m = Math.floor((uptime % 3600) / 60);
        const s = uptime % 60;
        document.getElementById('uptimeDisplay').textContent = 
            pad(h) + ':' + pad(m) + ':' + pad(s);
    }, 1000);
}

function pad(n) {
    return n < 10 ? '0' + n : n;
}

// АКТИВНОСТЬ
function startActivity() {
    ram = 1200 + Math.random() * 300;

    activityTimer = setInterval(() => {
        if (!isRunning) return;

        ram += Math.random() * 150 - 50;
        ram = Math.max(1200, Math.min(5500, ram));

        cpu = Math.floor(Math.random() * 40) + 20;

        if (Math.random() > 0.85) {
            const change = Math.floor(Math.random() * 3) - 1;
            const old = players;
            players = Math.max(0, Math.min(100, players + change));

            if (players > old) {
                const name = 'Player' + Math.floor(Math.random() * 999);
                log('[Minecraft] ' + name + ' joined the game');
            } else if (players < old) {
                const name = 'Player' + Math.floor(Math.random() * 999);
                log('[Minecraft] ' + name + ' left the game');
            }
        }

        updateStatus();
    }, 3000);
}

// ЛОГИ
function log(msg) {
    const output = document.getElementById('consoleOutput');
    const line = document.createElement('div');
    line.className = 'console-line';
    const time = new Date().toLocaleTimeString();
    line.textContent = '[' + time + '] ' + msg;
    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

// КОМАНДЫ
function sendCommand() {
    const input = document.getElementById('consoleInput');
    const cmd = input.value.trim();

    if (!cmd) return;

    if (!isRunning) {
        log('[GalaxyHosting] ⚠️ Сервер не запущен!');
        input.value = '';
        return;
    }

    log('> ' + cmd);

    setTimeout(() => {
        if (cmd === 'stop') {
            stopServer();
        } else if (cmd === 'list') {
            log('[Minecraft] There are ' + players + ' of max 100 players online');
        } else if (cmd.startsWith('say ')) {
            log('[Server] ' + cmd.substring(4));
        } else if (cmd === 'help') {
            log('[Minecraft] Commands: stop, list, say, op, kick, save-all');
        } else if (cmd.startsWith('op ')) {
            log('[Minecraft] Made ' + cmd.substring(3) + ' a server operator');
        } else if (cmd === 'save-all') {
            log('[Minecraft] Saving...');
            setTimeout(() => log('[Minecraft] Saved the game'), 500);
        } else {
            log('[Minecraft] Command executed');
        }
    }, 200);

    input.value = '';
}

// ENTER для команд
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('consoleInput');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendCommand();
        });
    }
});

// КОПИРОВАТЬ IP
function copyIP() {
    const ip = document.getElementById('serverIP').textContent;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(ip).then(() => {
            alert('✅ IP скопирован: ' + ip);
        });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = ip;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('✅ IP скопирован: ' + ip);
    }
}

// ОБНОВИТЬ IP
function updateIP() {
    const name = document.getElementById('serverName').value.toLowerCase().replace(/[^a-z0-9]/g, '');
    serverName = name || 'myserver';
    const ip = 'play.' + serverName + '.galaxy';
    document.getElementById('serverIP').textContent = ip;
    log('[GalaxyHosting] IP обновлён: ' + ip);
}

// СОХРАНИТЬ НАСТРОЙКИ
function saveSettings() {
    updateIP();
    
    const version = document.getElementById('mcVersion').value;
    const type = document.getElementById('serverType').value;
    
    log('[GalaxyHosting] 💾 Сохранение настроек...');
    
    setTimeout(() => {
        log('[GalaxyHosting] Версия: ' + version);
        log('[GalaxyHosting] Тип: ' + type);
        log('[GalaxyHosting] ✅ Настройки сохранены!');
        
        document.getElementById('versionDisplay').textContent = version;
        
        alert('✅ Настройки сохранены!\n\n⚠️ Перезапустите сервер');
    }, 500);
}

// БЭКАП
function createBackup() {
    log('[GalaxyHosting] 💾 Создание бэкапа...');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 20;
        log('[GalaxyHosting] Прогресс: ' + progress + '%');
        
        if (progress >= 100) {
            clearInterval(interval);
            const date = new Date().toLocaleString();
            const size = Math.floor(Math.random() * 500 + 100);
            log('[GalaxyHosting] ✅ Бэкап создан!');
            alert('✅ Бэкап создан!\n\nДата: ' + date + '\nРазмер: ' + size + ' MB');
        }
    }, 300);
}

// СПИСОК ИГРОКОВ
function updatePlayers(list) {
    const playerList = document.getElementById('playerList');
    
    if (list.length === 0) {
        playerList.innerHTML = '<div class="empty-state">Нет игроков онлайн</div>';
    } else {
        playerList.innerHTML = list.map(name => 
            '<div style="padding: 10px; background: rgba(108, 99, 255, 0.1); margin: 5px 0; border-radius: 5px;">👤 ' + name + '</div>'
        ).join('');
    }
}

// ИНИЦИАЛИЗАЦИЯ
document.addEventListener('DOMContentLoaded', () => {
    updateStatus();
    log('[GalaxyHosting] 🌌 Система загружена');
    log('[GalaxyHosting] 📌 Готов к работе!');
});
