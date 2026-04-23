# telegram-comm-agent



## Overview

A reusable, configurable Telegram communication agent bot template for Node.js, based on Telegraf. Import as a library and provide your own config and secrets.

**No bundle/minified build is provided. Install via GitHub or copy the source.**

## Features
- Data-driven, step-by-step flow
- All prompts, services, and logic are configurable
- No secrets or business logic hardcoded
- Easy to integrate in any Node.js project

## Usage Example

See the main docs/README.md for usage and configuration examples.

## API
### handleLeadForwarding(bot, config, leadText, options)
Handles forwarding a lead according to your config's FORWARD_TO_AGENT setting.

- `bot`: Telegraf bot instance
- `config`: Bot config (must include ADMIN_CHAT_ID, AGENT_CHAT_ID, FORWARD_TO_AGENT, STRINGS)
- `leadText`: The formatted lead text (string)
- `options`: Optional context for callback (e.g. `{ ctx }` for Telegram, `{ res }` for web)
- Returns: Promise resolving to 'all', 'admin', or 'ask' (how the lead was forwarded)

**Behavior:**
- If `FORWARD_TO_AGENT` is `'all'`, sends the lead to both admin and agent.
- If `'no'`, sends only to admin.
- If `'ask'`, sends to admin with inline buttons to approve/forward to agent.


**Example:**
```js
const { createCommAgent, handleLeadForwarding } = require('telegram-comm-agent');
const config = require('./config');
const secrets = require('./secrets');
const bot = createCommAgent(config, secrets);
// ...
```

## Web Server & /lead Endpoint

See `src/server/web-server.js` for a ready-to-use Express server for web leads.

## Configuration Reference

- See config.example.js in consumer projects for structure.
- All prompts, flow, and menu labels are customizable.

## Peer Dependencies

- You must install `telegraf` (version >=4.0.0) in your project.
- The library now requires Telegraf directly (no DI). For tests, use instance-level mocking.

## Testing

- Run `npm test` to execute the test suite (unit and e2e).
- E2E tests cover Telegram and web flows using instance-level mocking.

## Releasing & Installing from GitHub Releases

**Install:**
```sh
npm install OrithmicSoftware/telegram-comm-agent#main
```

> **Note:** This package is not published to npm. Install directly from GitHub.

## License
MIT

