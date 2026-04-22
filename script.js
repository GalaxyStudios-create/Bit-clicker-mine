document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const loginScreen = document.getElementById('login-screen');
    const gameContainer = document.getElementById('game-container');
    const usernameInput = document.getElementById('username-input');
    const registerButton = document.getElementById('register-button');
    const loginButton = document.getElementById('login-button');
    const loginError = document.getElementById('login-error');
    const logoutButton = document.getElementById('logout-button');
    
    const balanceEl = document.getElementById('balance');
    const clickPowerEl = document.getElementById('click-power');
    const autoPerSecondEl = document.getElementById('auto-per-second');
    const bitcoinButton = document.getElementById('bitcoin-button');
    const clickerZone = document.querySelector('.clicker-zone');
    
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseButton = document.getElementById('modal-close-button');
    
    // --- Глобальные переменные ---
    let currentUser = null, allUsersData = {}, gameState = {}, gameLoopInterval = null;

    // --- Данные игры (те же, что и раньше) ---
    const upgrades = [
        { id: 'click_1', name: 'Старая мышь', type: 'click', power: 0.00000001, baseCost: 0.000001, mult: 1.2 },
        { id: 'auto_1',  name: 'Скрипт',   type: 'auto',  power: 0.00000005,  baseCost: 0.00002,  mult: 1.25 },
        { id: 'click_2', name: 'Игровая мышь', type: 'click', power: 0.00000010,   baseCost: 0.0001,   mult: 1.22 },
        { id: 'auto_2',  name: 'Raspberry Pi',    type: 'auto',  power: 0.000001,    baseCost: 0.0005,    mult: 1.30 },
        { id: 'click_3', name: 'Макросы', type: 'click', power: 0.000005, baseCost: 0.001, mult: 1.28},
        { id: 'auto_3',  name: 'Старая видеокарта', type: 'auto', power: 0.00002,   baseCost: 0.01,     mult: 1.35 }
    ];
    const REBIRTH_BASE_COST = 0.1;

    const format = (num) => num.toFixed(8);
    const getRebirthMultiplier = () => 1 + (gameState.rebirths || 0);
    const getUpgradeLevel = (id) => gameState.upgradeLevels[id] || 0;
    const getUpgradeCost = (upg) => upg.baseCost * Math.pow(upg.mult, getUpgradeLevel(upg.id));
    const getRebirthCost = () => REBIRTH_BASE_COST * Math.pow(5, gameState.rebirths || 0);

    // --- Управление данными и аккаунтами ---
    function loadAllData() { allUsersData = JSON.parse(localStorage.getItem('brawlClickerUsers') || '{}'); }
    function saveGame() {
        if (currentUser) {
            allUsersData[currentUser] = gameState;
            localStorage.setItem('brawlClickerUsers', JSON.stringify(allUsersData));
        }
    }
    
    function showError(message) { loginError.textContent = message; setTimeout(() => loginError.textContent = '', 3000); }

    function register() {
        const username = usernameInput.value.trim().toUpperCase();
        if (!username) return showError('Имя не может быть пустым');
        if (allUsersData[username]) return showError('Это имя уже занято');
        
        currentUser = username;
        gameState = { balance: 0.0, clickPowerBase: 0.00000001, autoClickRateBase: 0.0, rebirths: 0, upgradeLevels: {} };
        saveGame();
        startGame();
    }

    function login() {
        const username = usernameInput.value.trim().toUpperCase();
        if (!username) return showError('Введите имя для входа');
        if (!allUsersData[username]) return showError('Аккаунт не найден');
        
        currentUser = username;
        gameState = allUsersData[currentUser];
        startGame();
    }
    
    function startGame() {
        loginScreen.style.display = 'none';
        gameContainer.style.display = 'flex';
        gameLoopInterval = setInterval(gameLoop, 100);
        updateDisplay();
    }

    function logout() {
        saveGame();
        clearInterval(gameLoopInterval);
        currentUser = null;
        gameContainer.style.display = 'none';
        loginScreen.style.display = 'flex';
        usernameInput.value = '';
    }

    // --- Управление модальными окнами ---
    function openModal(type) {
        modalTitle.textContent = type;
        let contentHTML = '';

        if (type === 'Улучшения') {
            contentHTML = upgrades.map(u => {
                const cost = getUpgradeCost(u);
                const canAfford = gameState.balance >= cost;
                return `
                <div class="upgrade-item">
                    <div>
                        <p class="upgrade-title">${u.name} (УР. ${getUpgradeLevel(u.id)})</p>
                        <p class="upgrade-stats">+${format(u.power)} ${u.type === 'click' ? 'КЛИК' : 'СЕК'}</p>
                    </div>
                    <button class="brawl-button ${canAfford ? 'can-afford' : ''}" onclick="buyUpgrade('${u.id}')" ${!canAfford ? 'disabled' : ''}>${format(cost)}</button>
                </div>
            `}).join('');
        } else if (type === 'Перерождение') {
            const cost = getRebirthCost();
            const canAfford = gameState.balance >= cost;
            contentHTML = `
                <p>Сбросьте прогресс, чтобы получить постоянный бонус +100% к доходу за каждое перерождение.</p>
                <p>Текущий бонус: x${getRebirthMultiplier()}</p>
                <hr>
                <p>Стоимость: <strong>${format(cost)} BTC</strong></p>
                <button class="brawl-button ${canAfford ? 'can-afford' : ''}" onclick="performRebirth()" ${!canAfford ? 'disabled' : ''}>Переродиться</button>
            `;
        } else if (type === 'Лидеры') {
            const sorted = Object.entries(allUsersData).map(([name, data]) => ({ name, score: (data.rebirths || 0) * 1e9 + (data.balance || 0) }))
                .sort((a, b) => b.score - a.score).slice(0, 10);
            contentHTML = `<ol id="leaderboard-list">${sorted.map(u => `<li><span>${u.name}</span> <span>${allUsersData[u.name].rebirths || 0} ПЕР.</span></li>`).join('') || '<li>Пусто</li>'}</ol>`;
        }

        modalBody.innerHTML = contentHTML;
        modalContainer.style.display = 'flex';
    }

    function closeModal() { modalContainer.style.display = 'none'; }
    
    // --- Игровая логика ---
    function updateDisplay() {
        if (!currentUser) return;
        const multiplier = getRebirthMultiplier();
        balanceEl.textContent = `${format(gameState.balance)} BTC`;
        clickPowerEl.textContent = format(gameState.clickPowerBase * multiplier);
        autoPerSecondEl.textContent = format(gameState.autoClickRateBase * multiplier);
    }
    
    function gameLoop() {
        gameState.balance += gameState.autoClickRateBase * getRebirthMultiplier() / 10;
        updateDisplay();
    }
    
    function showFloatingNumber(amount, event) {
        const el = document.createElement('span');
        el.textContent = `+${format(amount)}`;
        el.className = 'floating-number';
        el.style.left = `${event.clientX - clickerZone.getBoundingClientRect().left}px`;
        el.style.top = `${event.clientY - clickerZone.getBoundingClientRect().top - 40}px`;
        clickerZone.appendChild(el);
        setTimeout(() => el.remove(), 1500);
    }

    window.buyUpgrade = (id) => {
        const u = upgrades.find(up => up.id === id);
        const cost = getUpgradeCost(u);
        if (gameState.balance >= cost) {
            gameState.balance -= cost;
            gameState.upgradeLevels[id] = getUpgradeLevel(id) + 1;
            if (u.type === 'click') gameState.clickPowerBase += u.power; else gameState.autoClickRateBase += u.power;
            openModal('Улучшения'); // Перерисовываем модалку
            updateDisplay();
        }
    }

    window.performRebirth = () => {
        const cost = getRebirthCost();
        if (gameState.balance >= cost) {
            gameState = { ...gameState, balance: 0, clickPowerBase: 0.00000001, autoClickRateBase: 0, upgradeLevels: {}, rebirths: gameState.rebirths + 1 };
            alert(`Перерождение завершено! Ваш множитель теперь x${getRebirthMultiplier()}!`);
            openModal('Перерождение'); // Перерисовываем модалку
            updateDisplay();
        }
    }
    
    // --- Привязка событий ---
    registerButton.addEventListener('click', register);
    loginButton.addEventListener('click', login);
    logoutButton.addEventListener('click', logout);
    modalCloseButton.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => { if (e.target === modalContainer) closeModal(); });
    
    document.querySelectorAll('#bottom-nav .brawl-button').forEach(btn => {
        btn.addEventListener('click', () => openModal(btn.dataset.modal));
    });

    bitcoinButton.addEventListener('click', (e) => {
        const gain = gameState.clickPowerBase * getRebirthMultiplier();
        gameState.balance += gain;
        showFloatingNumber(gain, e);
        updateDisplay();
    });

    window.addEventListener('beforeunload', saveGame);
    setInterval(saveGame, 5000);
    loadAllData();
});
