document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const loginScreen = document.getElementById('login-screen');
    const gameContainer = document.getElementById('game-container');
    const usernameInput = document.getElementById('username-input');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');
    
    // Игровые элементы
    const balanceEl = document.getElementById('balance');
    const clickPowerEl = document.getElementById('click-power');
    const autoPerSecondEl = document.getElementById('auto-per-second');
    const bitcoinButton = document.getElementById('bitcoin-button');
    const clickerZone = document.querySelector('.clicker-zone');
    
    // Панели и вкладки
    const tabs = document.querySelectorAll('.tab-button');
    const panels = document.querySelectorAll('.panel');
    const upgradesPanel = document.getElementById('upgrades-panel');
    const rebirthMultiplierEl = document.getElementById('rebirth-multiplier');
    const rebirthCostEl = document.getElementById('rebirth-cost');
    const rebirthButton = document.getElementById('rebirth-button');
    const leaderboardList = document.getElementById('leaderboard-list');

    // --- Глобальные переменные ---
    let currentUser = null;
    let allUsersData = {};
    let gameState = {};
    let gameLoopInterval = null;

    // --- Данные игры (перебалансировано) ---
    const upgrades = [
        { id: 'click_1', name: 'Старая мышь', type: 'click', power: 0.00000001, baseCost: 0.000001, mult: 1.2 },
        { id: 'auto_1',  name: 'Скрипт',   type: 'auto',  power: 0.00000005,  baseCost: 0.00002,  mult: 1.25 },
        { id: 'click_2', name: 'Игровая мышь', type: 'click', power: 0.00000010,   baseCost: 0.0001,   mult: 1.22 },
        { id: 'auto_2',  name: 'Raspberry Pi',    type: 'auto',  power: 0.000001,    baseCost: 0.0005,    mult: 1.30 },
        { id: 'click_3', name: 'Макросы', type: 'click', power: 0.000005, baseCost: 0.001, mult: 1.28},
        { id: 'auto_3',  name: 'Старая видеокарта', type: 'auto', power: 0.00002,   baseCost: 0.01,     mult: 1.35 }
    ];
    const REBIRTH_BASE_COST = 0.1;

    // --- Функции-помощники ---
    const format = (num) => num.toFixed(8);
    const getRebirthMultiplier = () => 1 + (gameState.rebirths || 0);
    const getUpgradeLevel = (id) => gameState.upgradeLevels[id] || 0;
    const getUpgradeCost = (upg) => upg.baseCost * Math.pow(upg.mult, getUpgradeLevel(upg.id));
    const getRebirthCost = () => REBIRTH_BASE_COST * Math.pow(5, gameState.rebirths || 0);

    // --- Управление данными (аккаунты и сохранение) ---
    function loadAllData() {
        const data = localStorage.getItem('bitcoinClickerUsers');
        allUsersData = data ? JSON.parse(data) : {};
    }

    function saveGame() {
        if (!currentUser) return;
        allUsersData[currentUser] = gameState;
        localStorage.setItem('bitcoinClickerUsers', JSON.stringify(allUsersData));
    }

    function login(username) {
        if (!username) return;
        currentUser = username;
        
        if (allUsersData[currentUser]) {
            gameState = allUsersData[currentUser];
        } else {
            // Новый игрок
            gameState = {
                balance: 0.0,
                clickPowerBase: 0.00000001,
                autoClickRateBase: 0.0,
                rebirths: 0,
                upgradeLevels: {}
            };
        }
        
        loginScreen.style.display = 'none';
        gameContainer.style.display = 'flex';
        initializeGameUI();
    }
    
    function logout() {
        saveGame();
        clearInterval(gameLoopInterval);
        currentUser = null;
        gameState = {};
        gameContainer.style.display = 'none';
        loginScreen.style.display = 'block';
    }

    // --- Инициализация и UI ---
    function initializeGameUI() {
        // Создаем HTML для улучшений
        upgradesPanel.innerHTML = upgrades.map(u => `
            <div class="upgrade-item">
                <div>
                    <p class="upgrade-title">${u.name} (ур. <span id="level-${u.id}">0</span>)</p>
                    <p class="upgrade-stats">+${format(u.power)} ${u.type === 'click' ? 'за клик' : 'в сек.'}</p>
                </div>
                <button id="buy-${u.id}">Купить за <span id="cost-${u.id}">0</span></button>
            </div>
        `).join('');

        // Привязываем события к созданным кнопкам улучшений
        upgrades.forEach(u => {
            document.getElementById(`buy-${u.id}`).addEventListener('click', () => buyUpgrade(u.id));
        });
        
        gameLoopInterval = setInterval(gameLoop, 100);
        updateDisplay();
    }

    function updateDisplay() {
        if (!currentUser) return;
        const multiplier = getRebirthMultiplier();
        
        balanceEl.textContent = format(gameState.balance);
        clickPowerEl.textContent = format(gameState.clickPowerBase * multiplier);
        autoPerSecondEl.textContent = format(gameState.autoClickRateBase * multiplier);

        upgrades.forEach(upgrade => {
            const cost = getUpgradeCost(upgrade);
            const button = document.getElementById(`buy-${upgrade.id}`);
            document.getElementById(`level-${upgrade.id}`).textContent = getUpgradeLevel(upgrade.id);
            document.querySelector(`#cost-${upgrade.id}`).textContent = format(cost);
            
            button.classList.toggle('can-afford', gameState.balance >= cost);
            button.disabled = gameState.balance < cost;
        });

        const currentRebirthCost = getRebirthCost();
        rebirthMultiplierEl.textContent = `x${multiplier}`;
        rebirthCostEl.textContent = format(currentRebirthCost);
        rebirthButton.classList.toggle('can-afford', gameState.balance >= currentRebirthCost);
        rebirthButton.disabled = gameState.balance < currentRebirthCost;
    }
    
    function updateLeaderboard() {
        const sortedUsers = Object.entries(allUsersData)
            .map(([name, data]) => ({
                name,
                score: (data.rebirths || 0) * 1e9 + (data.balance || 0) // Сортируем по перерождениям, потом по балансу
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 10); // Топ 10

        leaderboardList.innerHTML = sortedUsers.map(user => `
            <li>
                <span>${user.name}</span>
                <span>${allUsersData[user.name].rebirths || 0} пер. / ${format(allUsersData[user.name].balance || 0)} BTC</span>
            </li>
        `).join('') || '<li>Пока нет данных</li>';
    }

    // --- Игровые действия ---
    function gameLoop() {
        gameState.balance += gameState.autoClickRateBase * getRebirthMultiplier() / 10; // Делим для плавности
        updateDisplay();
    }
    
    function showFloatingNumber(amount, event) {
        const numberEl = document.createElement('span');
        numberEl.textContent = `+${format(amount)}`;
        numberEl.className = 'floating-number';
        
        const rect = clickerZone.getBoundingClientRect();
        numberEl.style.left = `${event.clientX - rect.left + (Math.random() * 30 - 15)}px`;
        numberEl.style.top = `${event.clientY - rect.top}px`;
        
        clickerZone.appendChild(numberEl);
        setTimeout(() => numberEl.remove(), 1500);
    }
    
    function buyUpgrade(id) {
        const upgrade = upgrades.find(u => u.id === id);
        const cost = getUpgradeCost(upgrade);
        if (gameState.balance >= cost) {
            gameState.balance -= cost;
            gameState.upgradeLevels[id] = getUpgradeLevel(id) + 1;
            if (upgrade.type === 'click') gameState.clickPowerBase += upgrade.power;
            else if (upgrade.type === 'auto') gameState.autoClickRateBase += upgrade.power;
            updateDisplay();
        }
    }

    function performRebirth() {
        const cost = getRebirthCost();
        if (gameState.balance >= cost) {
            gameState.balance = 0;
            gameState.clickPowerBase = 0.00000001;
            gameState.autoClickRateBase = 0.0;
            gameState.upgradeLevels = {};
            gameState.rebirths += 1;
            alert(`Поздравляем с перерождением! Ваш множитель дохода теперь x${getRebirthMultiplier()}.`);
            updateDisplay();
        }
    }

    // --- Привязка событий ---
    loginButton.addEventListener('click', () => login(usernameInput.value.trim()));
    logoutButton.addEventListener('click', logout);
    bitcoinButton.addEventListener('click', (event) => {
        const clickGain = gameState.clickPowerBase * getRebirthMultiplier();
        gameState.balance += clickGain;
        showFloatingNumber(clickGain, event);
        updateDisplay(); // Обновляем, чтобы кнопки могли стать доступными
    });
    rebirthButton.addEventListener('click', performRebirth);

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab + '-panel').classList.add('active');
            
            if(tab.dataset.tab === 'leaderboard') {
                updateLeaderboard();
            }
        });
    });

    // --- Запуск приложения ---
    window.addEventListener('beforeunload', saveGame); // Сохраняемся при закрытии вкладки
    setInterval(saveGame, 5000); // Автосохранение каждые 5 секунд
    loadAllData();
});
