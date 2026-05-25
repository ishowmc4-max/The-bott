# Minecraft Bot - RtxRyzen_

An automated Minecraft bot built with Node.js and Mineflayer that connects to a Minecraft server, handles authentication, executes commands, and navigates to configured coordinates.

## Features

✅ **Auto-connect** - Automatically connects to the configured Minecraft server  
✅ **Auto-login** - Handles both login and registration prompts  
✅ **Command execution** - Automatically executes spawn command  
✅ **Pathfinding** - Uses mineflayer-pathfinder for intelligent navigation  
✅ **Configurable** - All settings stored in `config.json`  
✅ **Auto-reconnect** - Reconnects after 10 seconds if disconnected  
✅ **Detailed logging** - Comprehensive console logs for all bot activities  
✅ **Version auto-detect** - Automatically detects Minecraft server version  

## Requirements

- Node.js 14.0.0 or higher
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ishowmc4-max/The-bott.git
cd The-bott
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Edit `config.json` to customize the bot:

```json
{
  "host": "play.bulletsmp.fun",
  "username": "RtxRyzen_",
  "password": "RtxRyzenHumai",
  "spawnCommand": "/spawn",
  "target": {
    "x": 100,
    "y": 64,
    "z": -200
  },
  "reconnectDelay": 10000,
  "minecraftVersion": null,
  "viewDistance": "far",
  "timeout": 30000
}
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `host` | string | Minecraft server IP address |
| `username` | string | Bot username |
| `password` | string | Bot password |
| `spawnCommand` | string | Command to execute after spawning |
| `target` | object | Target coordinates (x, y, z) to walk to |
| `reconnectDelay` | number | Milliseconds to wait before reconnecting (default: 10000) |
| `minecraftVersion` | string \| null | Minecraft version (null for auto-detect) |
| `viewDistance` | string | Render distance (far, normal, short, tiny) |
| `timeout` | number | Connection timeout in milliseconds |

## Usage

Start the bot:
```bash
npm start
```

Or with Node directly:
```bash
node index.js
```

## Console Output

The bot provides detailed console logs:

```
[BOT] Minecraft Bot Started
[BOT] Connecting to play.bulletsmp.fun as RtxRyzen_...
[BOT] Connected to server
[BOT] Bot spawned in the world
[BOT] Executing command: /spawn
[BOT] Walking to target: x=100, y=64, z=-200
[BOT] Arrived at target location
```

### Log Levels

- `[BOT]` - General bot information
- `[CHAT]` - Chat messages from other players
- `[ERROR]` - Errors and failures

## How It Works

1. **Connection** - Bot connects to the server using credentials
2. **Spawn Detection** - Waits for the bot to fully load in the world
3. **Authentication** - Automatically handles login/register if prompted
4. **Command Execution** - Executes the spawn command
5. **Pathfinding** - Uses mineflayer-pathfinder to navigate to target coordinates
6. **Reconnection** - Automatically reconnects if disconnected

## Troubleshooting

### Bot doesn't connect
- Verify server IP in `config.json`
- Check internet connection
- Ensure Minecraft version is correct (or set to null for auto-detect)

### Bot can't log in
- Verify username and password in `config.json`
- Check if server requires login commands
- Ensure account exists on the server

### Pathfinding fails
- Target coordinates might be inside blocks
- Check if target is reachable from spawn point
- Verify Y coordinate (height) is valid for the location

### Bot keeps disconnecting
- Check server stability
- Verify `timeout` setting is sufficient
- Check `reconnectDelay` setting

## Architecture

```
├── index.js              # Main bot logic
├── config.json           # Configuration file
├── package.json          # Project dependencies
└── README.md             # This file
```

## Key Components

### mineflayer
Client library that emulates a Minecraft client, allowing full control over the bot.

### mineflayer-pathfinder
Plugin that provides intelligent pathfinding using goals and movement planning.

### Event Handlers
- `login` - Bot successfully logged in
- `spawn` - Bot spawned in the world
- `chat` - Chat message received
- `end` - Bot disconnected
- `error` - Error occurred
- `kicked` - Bot was kicked

## Advanced Usage

### Custom Commands

Modify the `spawn` event handler in `index.js` to execute additional commands:

```javascript
bot.chat('/command1');
await delay(1000);
bot.chat('/command2');
```

### Multiple Waypoints

Create waypoints by modifying `moveToTarget()`:

```javascript
const waypoints = [
  {x: 100, y: 64, z: -200},
  {x: 200, y: 64, z: -300},
  {x: 300, y: 64, z: -400}
];

for (const waypoint of waypoints) {
  config.target = waypoint;
  await moveToTarget();
  await delay(5000);
}
```

## Dependencies

- **mineflayer** (4.13.0+) - Minecraft client library
- **mineflayer-pathfinder** (2.4.4+) - Pathfinding plugin

## License

MIT

## Author

RtxRyzen_

## Support

For issues or questions, please open an issue on GitHub.

---

**Note:** Ensure you have permission to use bot accounts on your Minecraft server. Some servers prohibit bots in their terms of service.
