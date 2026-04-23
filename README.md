# telegram-comm-agent

[![Release](https://img.shields.io/github/v/release/OrithmicSoftware/telegram-comm-agent?label=release)](https://github.com/OrithmicSoftware/telegram-comm-agent/releases)
[![Lint](https://github.com/OrithmicSoftware/telegram-comm-agent/actions/workflows/lint.yml/badge.svg)](https://github.com/OrithmicSoftware/telegram-comm-agent/actions/workflows/lint.yml)
[![Test](https://github.com/OrithmicSoftware/telegram-comm-agent/actions/workflows/test.yml/badge.svg)](https://github.com/OrithmicSoftware/telegram-comm-agent/actions/workflows/test.yml)

## Overview
A reusable, configurable Telegram communication agent bot template for Node.js, based on Telegraf. Import as a library and provide your own config and secrets.

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
const { handleLeadForwarding } = require('telegram-comm-agent');
await handleLeadForwarding(bot, config, leadText, { ctx });
```

## Web Server & /lead Endpoint
See `src/server/web-server.js` for a ready-to-use Express server for web leads.

## Configuration Reference
- See config.example.js in consumer projects for structure.
- All prompts, flow, and menu labels are customizable.

## Peer Dependencies
- You must install `telegraf` (version >=4.0.0) in your project.
- The library now requires Telegraf directly (no DI). For tests, use `proxyquire` to mock Telegraf.

## Testing
- Run `npm test` to execute the test suite (unit and e2e).
- E2E tests cover Telegram and web flows using a mock Telegram API server.
- Use `proxyquire` for mocking Telegraf in tests.

## Releasing & Installing from GitHub Releases
To use a specific release, download the `telegram-comm-agent.min.js` bundle from the [GitHub Releases page](https://github.com/OrithmicSoftware/telegram-comm-agent/releases).

**Example (in your project):**
1. Download the latest `telegram-comm-agent.min.js` from the [releases](https://github.com/OrithmicSoftware/telegram-comm-agent/releases).
2. Place it in your project (e.g., `vendor/telegram-comm-agent.min.js`).
3. Require it in your code:
   ```js
   const { createCommAgent } = require('./vendor/telegram-comm-agent.min.js');
   // ...
   ```

You can also use GitHub tarball/zip URLs in npm if you want to install the full repo:
```sh
npm install OrithmicSoftware/telegram-comm-agent#v1.0.0
```

> **Note:** This package is not published to npm. Always use the GitHub Releases asset above.

## License
MIT

