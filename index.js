const mineflayer = require('mineflayer');
const pathfinder = require('mineflayer-pathfinder');
const { Movements, goals } = require('mineflayer-pathfinder');
const fs = require('fs');
const path = require('path');

// Load configuration
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

let bot;
let isMoving = false;
let hasSpawned = false;
let reconnectTimeout;

/**
 * Create and connect the bot
 */
async function createBot() {
  console.log('[BOT] Creating bot instance...');

  const options = {
    host: config.host,
    username: config.username,
    password: config.password,
    version: config.minecraftVersion || null,
    viewDistance: config.viewDistance || 'far',
    timeout: config.timeout || 30000
  };

  bot = mineflayer.createBot(options);

  // Load pathfinder plugin
  bot.loadPlugin(pathfinder.pathfinder);

  setupEventHandlers();
}

/**
 * Setup all event handlers for the bot
 */
function setupEventHandlers() {
  bot.on('login', () => {
    console.log('[BOT] Connected to server');
  });

  bot.on('spawn', async () => {
    console.log('[BOT] Bot spawned in the world');
    hasSpawned = true;

    try {
      // Wait a moment for the bot to fully load
      await delay(2000);

      // Check if login/registration is required
      await handleAuthentication();

      // Wait a moment after authentication
      await delay(1000);

      // Execute spawn command
      console.log(`[BOT] Executing command: ${config.spawnCommand}`);
      bot.chat(config.spawnCommand);

      // Wait for teleport to complete
      await delay(3000);

      // Start pathfinding to target coordinates
      await moveToTarget();
    } catch (error) {
      console.error('[ERROR] Failed during spawn sequence:', error.message);
    }
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`[CHAT] ${username}: ${message}`);

    // Check for login prompt
    if (message.toLowerCase().includes('login')) {
      console.log('[BOT] Login required, sending credentials...');
      bot.chat(`/login ${config.password}`);
    }

    // Check for registration prompt
    if (message.toLowerCase().includes('register')) {
      console.log('[BOT] Registration required, sending credentials...');
      bot.chat(`/register ${config.password} ${config.password}`);
    }
  });

  bot.on('end', () => {
    console.log('[BOT] Disconnected from server');
    hasSpawned = false;
    isMoving = false;
    scheduleReconnect();
  });

  bot.on('error', (error) => {
    console.error('[ERROR] Bot error:', error.message);
  });

  bot.on('kicked', (reason) => {
    console.log('[BOT] Kicked from server:', reason);
  });

  bot.on('error_string', (error) => {
    console.error('[ERROR] Server error:', error);
  });
}

/**
 * Handle authentication (login/register)
 */
async function handleAuthentication() {
  return new Promise((resolve) => {
    let authTimeout;
    let chatListener;

    const cleanup = () => {
      clearTimeout(authTimeout);
      if (chatListener) {
        bot.removeListener('chat', chatListener);
      }
    };

    chatListener = (username, message) => {
      if (username === bot.username) return;

      const lowerMessage = message.toLowerCase();

      if (lowerMessage.includes('logged in') || lowerMessage.includes('successfully logged in')) {
        console.log('[BOT] Successfully logged in');
        cleanup();
        resolve();
      }

      if (lowerMessage.includes('registered') || lowerMessage.includes('successfully registered')) {
        console.log('[BOT] Successfully registered');
        cleanup();
        resolve();
      }

      if (lowerMessage.includes('login') && !lowerMessage.includes('logged')) {
        console.log('[BOT] Login prompt detected, sending credentials...');
        bot.chat(`/login ${config.password}`);
      }

      if (lowerMessage.includes('register') && !lowerMessage.includes('registered')) {
        console.log('[BOT] Register prompt detected, sending credentials...');
        bot.chat(`/register ${config.password} ${config.password}`);
      }
    };

    bot.on('chat', chatListener);

    // Timeout after 10 seconds
    authTimeout = setTimeout(() => {
      cleanup();
      resolve();
    }, 10000);
  });
}

/**
 * Move to the target coordinates
 */
async function moveToTarget() {
  const target = config.target;

  if (!target || typeof target.x !== 'number' || typeof target.y !== 'number' || typeof target.z !== 'number') {
    console.error('[ERROR] Invalid target coordinates in config');
    return;
  }

  try {
    isMoving = true;
    const goalPos = new goals.GoalBlock(target.x, target.y, target.z);

    console.log(`[BOT] Walking to target: x=${target.x}, y=${target.y}, z=${target.z}`);

    // Start pathfinding
    bot.pathfinder.setMovements(new Movements(bot));
    bot.pathfinder.goto(goalPos).then(() => {
      console.log('[BOT] Arrived at target location');
      isMoving = false;
    }).catch((err) => {
      console.error('[ERROR] Pathfinding error:', err.message);
      isMoving = false;
    });
  } catch (error) {
    console.error('[ERROR] Failed to start movement:', error.message);
    isMoving = false;
  }
}

/**
 * Schedule bot reconnection
 */
function scheduleReconnect() {
  const delay = config.reconnectDelay || 10000;
  console.log(`[BOT] Reconnecting in ${delay}ms...`);

  clearTimeout(reconnectTimeout);
  reconnectTimeout = setTimeout(() => {
    console.log('[BOT] Attempting to reconnect...');
    createBot();
  }, delay);
}

/**
 * Utility function for delays
 */
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Handle graceful shutdown
 */
process.on('SIGINT', () => {
  console.log('[BOT] Shutting down gracefully...');
  if (bot) {
    bot.quit();
  }
  clearTimeout(reconnectTimeout);
  process.exit(0);
});

/**
 * Start the bot
 */
console.log('[BOT] Minecraft Bot Started');
console.log(`[BOT] Connecting to ${config.host} as ${config.username}...`);
createBot();
