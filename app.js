// Game state
const state = {
  coins: 0,
  punchPower: 1,
  trainingActive: false,
  trainingSecondsLeft: 0,
  trainingCooldown: 0, // seconds
  nextUpgradeCost: 10,
  maxPower: 10,
  leaderboard: [
    {name: 'Alice', coins: 150},
    {name: 'Bob', coins: 120},
    {name: 'Carol', coins: 90}
  ]
};

// DOM elements
let elements = {};

// Current view
let currentView = 'main';

// Game timer
let gameTimer = null;

// Initialize Telegram WebApp
function initTelegram() {
  if (typeof window !== 'undefined' && window.Telegram && window.Telegram.WebApp) {
    const tg = window.Telegram.WebApp;
    
    // Set theme colors
    if (tg.themeParams) {
      const root = document.documentElement;
      if (tg.themeParams.bg_color) {
        root.style.setProperty('--color-background', tg.themeParams.bg_color);
      }
      if (tg.themeParams.text_color) {
        root.style.setProperty('--color-text', tg.themeParams.text_color);
      }
      if (tg.themeParams.hint_color) {
        root.style.setProperty('--color-text-secondary', tg.themeParams.hint_color);
      }
      if (tg.themeParams.button_color) {
        root.style.setProperty('--color-primary', tg.themeParams.button_color);
      }
    }
    
    // Expand to full height and ready
    tg.expand();
    tg.ready();
  }
}

// Initialize DOM elements
function initElements() {
  elements = {
    // Main view elements
    coinsDisplay: document.getElementById('coins-display'),
    powerDisplay: document.getElementById('power-display'),
    trainingStatus: document.getElementById('training-status'),
    trainingActive: document.getElementById('training-active'),
    trainingCooldown: document.getElementById('training-cooldown'),
    trainingTime: document.getElementById('training-time'),
    cooldownTime: document.getElementById('cooldown-time'),
    punchingBag: document.getElementById('punching-bag'),
    trainingBtn: document.getElementById('training-btn'),
    upgradeBtn: document.getElementById('upgrade-btn'),
    leaderboardBtn: document.getElementById('leaderboard-btn'),
    
    // Views
    mainView: document.getElementById('main-view'),
    leaderboardView: document.getElementById('leaderboard-view'),
    
    // Leaderboard elements
    leaderboardList: document.getElementById('leaderboard-list'),
    backBtn: document.getElementById('back-btn')
  };
  
  // Check if all elements were found
  for (const [key, element] of Object.entries(elements)) {
    if (!element) {
      console.error(`Element not found: ${key}`);
    }
  }
}

// Add event listeners
function initEventListeners() {
  // Punching bag click
  if (elements.punchingBag) {
    elements.punchingBag.addEventListener('click', handlePunch);
    console.log('Punching bag event listener added');
  }
  
  // Training button
  if (elements.trainingBtn) {
    elements.trainingBtn.addEventListener('click', buyTraining);
    console.log('Training button event listener added');
  }
  
  // Upgrade button
  if (elements.upgradeBtn) {
    elements.upgradeBtn.addEventListener('click', upgradePower);
    console.log('Upgrade button event listener added');
  }
  
  // Navigation buttons
  if (elements.leaderboardBtn) {
    elements.leaderboardBtn.addEventListener('click', function() {
      showView('leaderboard');
    });
    console.log('Leaderboard button event listener added');
  }
  
  if (elements.backBtn) {
    elements.backBtn.addEventListener('click', function() {
      showView('main');
    });
    console.log('Back button event listener added');
  }
}

// Handle punch action
function handlePunch() {
  console.log('Punch handled! Adding', state.punchPower, 'coins');
  
  // Add coins based on punch power
  state.coins += state.punchPower;
  
  // Show coin animation
  showCoinAnimation();
  
  // Update display
  updateDisplay();
  updateLeaderboard();
  
  console.log('New coin count:', state.coins);
}

// Show coin gain animation
function showCoinAnimation() {
  if (!elements.punchingBag) return;
  
  const bagRect = elements.punchingBag.getBoundingClientRect();
  const animation = document.createElement('div');
  animation.className = 'coin-animation';
  animation.textContent = `+${state.punchPower}💰`;
  
  // Position near the bag
  animation.style.position = 'fixed';
  animation.style.left = `${bagRect.left + bagRect.width / 2 - 20}px`;
  animation.style.top = `${bagRect.top + bagRect.height / 2}px`;
  animation.style.zIndex = '1000';
  
  document.body.appendChild(animation);
  
  // Remove after animation
  setTimeout(() => {
    if (animation.parentNode) {
      animation.parentNode.removeChild(animation);
    }
  }, 1000);
}

// Buy personal training
function buyTraining() {
  console.log('Training button clicked. Coins:', state.coins, 'Training active:', state.trainingActive, 'Cooldown:', state.trainingCooldown);
  
  if (state.coins >= 30 && !state.trainingActive && state.trainingCooldown === 0) {
    state.coins -= 30;
    state.trainingActive = true;
    state.trainingSecondsLeft = 60;
    
    console.log('Training started! Remaining coins:', state.coins);
    
    updateDisplay();
    updateLeaderboard();
  }
}

// Upgrade punch power
function upgradePower() {
  console.log('Upgrade button clicked. Coins:', state.coins, 'Power:', state.punchPower, 'Cost:', state.nextUpgradeCost);
  
  if (state.coins >= state.nextUpgradeCost && state.punchPower < state.maxPower) {
    state.coins -= state.nextUpgradeCost;
    state.punchPower += 1;
    
    // Calculate next upgrade cost
    if (state.punchPower < state.maxPower) {
      state.nextUpgradeCost = 10 + (state.punchPower - 1) * 5;
    }
    
    console.log('Power upgraded! New power:', state.punchPower, 'Remaining coins:', state.coins, 'Next cost:', state.nextUpgradeCost);
    
    updateDisplay();
    updateLeaderboard();
  }
}

// Update display
function updateDisplay() {
  // Update stats
  if (elements.coinsDisplay) {
    elements.coinsDisplay.textContent = state.coins;
  }
  if (elements.powerDisplay) {
    elements.powerDisplay.textContent = state.punchPower;
  }
  
  // Update training status
  if (state.trainingActive) {
    if (elements.trainingStatus) elements.trainingStatus.classList.remove('hidden');
    if (elements.trainingActive) elements.trainingActive.classList.remove('hidden');
    if (elements.trainingCooldown) elements.trainingCooldown.classList.add('hidden');
    if (elements.trainingTime) elements.trainingTime.textContent = state.trainingSecondsLeft;
  } else if (state.trainingCooldown > 0) {
    if (elements.trainingStatus) elements.trainingStatus.classList.remove('hidden');
    if (elements.trainingActive) elements.trainingActive.classList.add('hidden');
    if (elements.trainingCooldown) elements.trainingCooldown.classList.remove('hidden');
    
    const minutes = Math.floor(state.trainingCooldown / 60);
    const seconds = state.trainingCooldown % 60;
    if (elements.cooldownTime) {
      elements.cooldownTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  } else {
    if (elements.trainingStatus) elements.trainingStatus.classList.add('hidden');
    if (elements.trainingActive) elements.trainingActive.classList.add('hidden');
    if (elements.trainingCooldown) elements.trainingCooldown.classList.add('hidden');
  }
  
  // Update training button
  if (elements.trainingBtn) {
    const canBuyTraining = state.coins >= 30 && !state.trainingActive && state.trainingCooldown === 0;
    elements.trainingBtn.disabled = !canBuyTraining;
    
    if (!canBuyTraining) {
      if (state.coins < 30) {
        elements.trainingBtn.textContent = `Персональная тренировка (30💰) - Нужно ${30 - state.coins} монет`;
      } else {
        elements.trainingBtn.textContent = 'Персональная тренировка (недоступно)';
      }
    } else {
      elements.trainingBtn.textContent = 'Персональная тренировка (30💰)';
    }
  }
  
  // Update upgrade button
  if (elements.upgradeBtn) {
    const canUpgrade = state.coins >= state.nextUpgradeCost && state.punchPower < state.maxPower;
    elements.upgradeBtn.disabled = !canUpgrade;
    
    if (state.punchPower >= state.maxPower) {
      elements.upgradeBtn.textContent = 'Сила удара максимальна!';
    } else if (state.coins < state.nextUpgradeCost) {
      elements.upgradeBtn.textContent = `Улучшить силу (${state.nextUpgradeCost}💰) - Нужно ${state.nextUpgradeCost - state.coins} монет`;
    } else {
      elements.upgradeBtn.textContent = `Улучшить силу (${state.nextUpgradeCost}💰)`;
    }
  }
}

// Update leaderboard
function updateLeaderboard() {
  // Update current user in leaderboard
  const userIndex = state.leaderboard.findIndex(player => player.name === 'Вы');
  if (userIndex !== -1) {
    state.leaderboard[userIndex].coins = state.coins;
  } else {
    state.leaderboard.push({name: 'Вы', coins: state.coins});
  }
  
  // Sort leaderboard
  state.leaderboard.sort((a, b) => b.coins - a.coins);
  
  // Render leaderboard if currently viewing it
  if (currentView === 'leaderboard') {
    renderLeaderboard();
  }
}

// Render leaderboard
function renderLeaderboard() {
  if (!elements.leaderboardList) return;
  
  elements.leaderboardList.innerHTML = '';
  
  state.leaderboard.forEach((player, index) => {
    const entry = document.createElement('div');
    entry.className = `leaderboard-entry ${player.name === 'Вы' ? 'current-user' : ''}`;
    
    entry.innerHTML = `
      <div class="rank">${index + 1}</div>
      <div class="name">${player.name}</div>
      <div class="coins">${player.coins}💰</div>
    `;
    
    elements.leaderboardList.appendChild(entry);
  });
}

// Show view
function showView(viewName) {
  console.log('Switching to view:', viewName);
  
  // Hide all views
  if (elements.mainView) elements.mainView.classList.remove('active');
  if (elements.leaderboardView) elements.leaderboardView.classList.remove('active');
  
  // Show selected view
  currentView = viewName;
  if (viewName === 'main') {
    if (elements.mainView) elements.mainView.classList.add('active');
  } else if (viewName === 'leaderboard') {
    if (elements.leaderboardView) elements.leaderboardView.classList.add('active');
    renderLeaderboard();
  }
}

// Game tick (runs every second)
function gameTick() {
  // Handle training
  if (state.trainingActive) {
    // Add 2 coins per second during training
    state.coins += 2;
    state.trainingSecondsLeft -= 1;
    
    // Check if training finished
    if (state.trainingSecondsLeft <= 0) {
      state.trainingActive = false;
      state.trainingCooldown = 600; // 10 minutes in seconds
    }
  } else if (state.trainingCooldown > 0) {
    // Decrease cooldown
    state.trainingCooldown -= 1;
  }
  
  // Update display
  updateDisplay();
  updateLeaderboard();
}

// Initialize game
function initGame() {
  console.log('Initializing Boxer Clicker game...');
  
  try {
    initTelegram();
    initElements();
    initEventListeners();
    
    // Start game timer
    if (gameTimer) {
      clearInterval(gameTimer);
    }
    gameTimer = setInterval(gameTick, 1000);
    
    // Initial display update
    updateDisplay();
    updateLeaderboard();
    
    console.log('Boxer Clicker game initialized successfully');
  } catch (error) {
    console.error('Error initializing game:', error);
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGame);
} else {
  initGame();
}