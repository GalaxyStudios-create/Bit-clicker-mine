// Игровые данные
let gameData = {
    balance: 0.000000001,
    perClick: 0.000000001,
    perSecond: 0,
    totalClicks: 0,
    rebirths: 0,
    multiplier: 1,
    upgrades: [
        {
            name: 'Слабый процессор',
            baseCost: 0.00000001,
            baseProduction: 0.000000001,
            cost: 0.00000001,
            production: 0.000000001,
            count: 0,
            type: 'auto'
        },
        {
            name: 'Видеокарта GTX',
            baseCost: 0.0000001,
            baseProduction: 0.00000001,
            cost: 0.0000001,
            production: 0.00000001,
            count: 0,
            type: 'auto'
        },
        {
            name: 'ASIC майнер',
            baseCost: 0.000001,
            baseProduction: 0.0000001,
            cost: 0.000001,
            production: 0.0000001,
            count: 0,
            type: 'auto'
        },
        {
            name: 'Майнинг ферма',
            baseCost: 0.00001,
            baseProduction: 0.000001,
            cost: 0.00001,
            production: 0.000001,
            count: 0,
            type: 'auto'
        },
        {
            name: 'Дата-центр',
            baseCost: 0.0001,
            baseProduction: 0.00001,
            cost: 0.0001,
            production: 0.00001,
            count: 0,
            type: 'auto'
        },
        {
            name: 'Квантовый компьютер',
            baseCost: 0.001,
            baseProduction: 0.0001,
            cost: 0.001,
            production: 0.0001,
            count: 0,
            type: 'auto'
        },
        {
            name: 'Улучшение клика',
            baseCost: 0.00000005,
            baseProduction: 0.000000001,
            cost: 0.00000005,
            production: 0.000000001,
            count: 0,
            type: 'click'
        },
        {
            name: 'Мощное улучшение клика',
            baseCost: 0.0000005,
            baseProduction: 0.00000001,
            cost: 0.0000005,
            production: 0.00000001,
            count: 0,
            type: 'click'
        },
        {
            name: 'Супер клик',
            baseCost: 0.000005,
            baseProduction: 0.0000001,
            cost: 0.000005,
            production: 0.0000001,
            count: 0,
            type: 'click'
        }
    ]
};

// Элементы DOM
const balanceElement = document.getElementById('balance');
const perClickElement = document.getElementById('perClick');
const perSecondElement = document.getElementById('perSecond');
const rebirthsElement = document.getElementById('rebirths');
const multiplierElement = document.getElementById('multiplier');
const totalClicksElement = document.getElementById('totalClicks');
const clickBtn = document.getElementById('clickBtn');
const upgradesContainer = document.getElementById('upgradesContainer');
const rebirthBtn = document.getElementById('rebirthBtn');
const rebirthCostElement = document.getElementById('rebirthCost');
const newMultiplierElement = document.getElementById('newMultiplier');

// Форматирование чисел
function formatNumber(num) {
    if (num < 0.000001) {
        return num.toFixed(9);
    } else if (num < 0.001) {
        return num.toFixed(7);
    } else if (num < 1) {
        return num.toFixed(5);
    } else if (num < 1000) {
        return num.toFixed(3);
    } else if (num < 1000000) {
        return (num / 1000).toFixed(2) + 'K';
    } else if (num < 1000000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else {
        return (num / 1000000000).toFixed(2) + 'B';
    }
}

// Обновление UI
function updateUI() {
    balanceElement.textContent = formatNumber(gameData.balance);
    perClickElement.textContent = formatNumber(gameData.perClick);
    perSecondElement.textContent = formatNumber(gameData.perSecond);
    rebirthsElement.textContent = gameData.rebirths;
    multiplierElement.textContent = gameData.multiplier.toFixed(1);
    totalClicksElement.textContent = gameData.totalClicks;
    
    const rebirthCost = getRebirthCost();
    rebirthCostElement.textContent = formatNumber(rebirthCost);
    newMultiplierElement.textContent = (gameData.multiplier + 0.5).toFixed(1);
    
    rebirthBtn.disabled = gameData.balance < rebirthCost;
}

// Клик
clickBtn.addEventListener('click', function(e) {
    gameData.balance += gameData.perClick * gameData.multiplier;
    gameData.totalClicks++;
    
    // Визуальный эффект
    createClickEffect(e.clientX, e.clientY);
    
    updateUI();
    updateUpgrades();
});

// Создание эффекта клика
function createClickEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.textContent = '+' + formatNumber(gameData.perClick * gameData.multiplier);
    effect.style.left = x + 'px';
    effect.style.top = y + 'px';
    document.body.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 1000);
}

// Создание списка улучшений
function createUpgrades() {
    upgradesContainer.innerHTML = '';
    
    gameData.upgrades.forEach((upgrade, index) => {
        const upgradeDiv = document.createElement('div');
        upgradeDiv.className = 'upgrade-item';
        
        const typeText = upgrade.type === 'auto' ? 'в секунду' : 'за клик';
        const production = formatNumber(upgrade.production * gameData.multiplier);
        
        upgradeDiv.innerHTML = `
            <div class="upgrade-header">
                <span class="upgrade-name">${upgrade.name}</span>
                <span class="upgrade-count">${upgrade.count}</span>
            </div>
            <div class="upgrade-info">
                +${production} BTC ${typeText}
            </div>
            <button class="upgrade-btn" onclick="buyUpgrade(${index})">
                Купить: ${formatNumber(upgrade.cost)} BTC
            </button>
        `;
        
        upgradesContainer.appendChild(upgradeDiv);
    });
}

// Покупка улучшения
function buyUpgrade(index) {
    const upgrade = gameData.upgrades[index];
    
    if (gameData.balance >= upgrade.cost) {
        gameData.balance -= upgrade.cost;
        upgrade.count++;
        
        if (upgrade.type === 'auto') {
            gameData.perSecond += upgrade.production * gameData.multiplier;
        } else {
            gameData.perClick += upgrade.production * gameData.multiplier;
        }
        
        // Увеличение стоимости (x1.15)
        upgrade.cost = upgrade.baseCost * Math.pow(1.15, upgrade.count);
        
        updateUI();
        updateUpgrades();
    }
}

// Обновление кнопок улучшений
function updateUpgrades() {
    const buttons = upgradesContainer.querySelectorAll('.upgrade-btn');
    buttons.forEach((btn, index) => {
        btn.disabled = gameData.balance < gameData.upgrades[index].cost;
    });
}

// Получение стоимости перерождения
function getRebirthCost() {
    return 1 * Math.pow(10, gameData.rebirths);
}

// Перерождение
rebirthBtn.addEventListener('click', function() {
    const cost = getRebirthCost();
    
    if (gameData.balance >= cost) {
        if (confirm('Вы уверены? Весь прогресс будет сброшен, но множитель увеличится!')) {
            gameData.rebirths++;
            gameData.multiplier += 0.5;
            
            // Сброс прогресса
            gameData.balance = 0.000000001;
            gameData.perClick = 0.000000001;
            gameData.perSecond = 0;
            gameData.totalClicks = 0;
            
            // Сброс улучшений
            gameData.upgrades.forEach(upgrade => {
                upgrade.count = 0;
                upgrade.cost = upgrade.baseCost;
            });
            
            updateUI();
            createUpgrades();
            saveGame();
        }
    }
});

// Автоматическое производство
setInterval(() => {
    if (gameData.perSecond > 0) {
        gameData.balance += gameData.perSecond / 10;
        updateUI();
        updateUpgrades();
    }
}, 100);

// Сохранение игры
function saveGame() {
    localStorage.setItem('bitcoinClicker', JSON.stringify(gameData));
}

// Загрузка игры
function loadGame() {
    const saved = localStorage.getItem('bitcoinClicker');
    if (saved) {
        const loadedData = JSON.parse(saved);
        gameData = { ...gameData, ...loadedData };
    }
}

// Автосохранение каждые 10 секунд
setInterval(saveGame, 10000);

// Инициализация
loadGame();
updateUI();
createUpgrades();

// Сохранение при закрытии
window.addEventListener('beforeunload', saveGame);
