
# telegram-comm-agent

[![Release](https://img.shields.io/github/v/release/OrithmicSoftware/telegram-comm-agent?label=release)](https://github.com/OrithmicSoftware/telegram-comm-agent/releases)
[![Lint](https://github.com/OrithmicSoftware/telegram-comm-agent/actions/workflows/lint.yml/badge.svg)](https://github.com/OrithmicSoftware/telegram-comm-agent/actions/workflows/lint.yml)
[![Test](https://github.com/OrithmicSoftware/telegram-comm-agent/actions/workflows/test.yml/badge.svg)](https://github.com/OrithmicSoftware/telegram-comm-agent/actions/workflows/test.yml)

## Overview

**telegram-comm-agent** is a reusable, highly-configurable Telegram communication agent bot template for Node.js, built on [Telegraf](https://telegraf.js.org/). It enables you to create powerful, data-driven bots for lead capture, service flows, and chat-based automation—without hardcoding business logic or secrets.

---

## Features

- **Data-driven step-by-step flows**: Define your own service flows, prompts, and menus in config.
- **No hardcoded secrets or business logic**: All sensitive data and flow logic are externalized.
- **Admin/agent lead routing**: Flexible forwarding modes (`all`, `no`, `ask`) for leads and messages.
- **Web server integration**: Built-in Express server for `/lead` HTTP endpoint.
- **Extensible and testable**: Clean modular code, full unit and e2e test coverage, easy to mock.

---

## Installation

Install the package directly from GitHub Releases or source:

```sh
npm install OrithmicSoftware/telegram-comm-agent#main
```

> **Note:** This package is not published to npm. Use the GitHub repo or releases.

---

## Quick Start

1. **Install [telegraf](https://www.npmjs.com/package/telegraf)** in your project:
	```sh
	npm install telegraf
	```
2. **Copy and edit `config.example.js` and `secrets.example.js`** to define your services, prompts, and credentials.
3. **Create and launch your bot:**
	```js
	const { createCommAgent } = require('telegram-comm-agent');
	const config = require('./config');
	const secrets = require('./secrets');
	const bot = createCommAgent(config, secrets);
	bot.launch();
	```

---

## Configuration

All bot behavior is controlled by your config and secrets files. See [`config.example.js`](config.example.js) for a full template.

- **SERVICES**: List of services (e.g. pizza, car rental, etc.)
- **STRINGS**: All prompts, menu labels, and templates
- **BUTTONS**: Main menu and service menu button labels
- **FLOW**: Step-by-step fields and prompts for each service
- **FORWARD_TO_AGENT**: `'all'`, `'no'`, or `'ask'` (lead routing mode)

---

## API

### `createCommAgent(config, secrets)`
Creates and returns a Telegraf bot instance, fully wired with your config and flows.

### `handleLeadForwarding(bot, config, leadText, options)`
Forwards a lead to admin/agent according to your config. See [docs/README.md](docs/README.md) for details.

### Web Server: `/lead` endpoint
Use `require('telegram-comm-agent/web-server')` to get an Express app that accepts POSTed leads and forwards them to Telegram.

---

## Testing

- Run `npm test` for full unit and e2e coverage.
- E2E tests simulate Telegram and web flows with instance-level mocking.

---

## Documentation

See [docs/README.md](docs/README.md) for advanced usage, configuration reference, and extension patterns.

---

---

## GitHub Labels

This repository uses the following labels to organize issues and pull requests:

| Label              | Color    | Description                              |
|--------------------|----------|------------------------------------------|
| `bug`              | d73a4a   | Something isn't working                  |
| `documentation`    | 0075ca   | Improvements or additions to documentation |
| `duplicate`        | cfd3d7   | This issue or pull request already exists |
| `enhancement`      | a2eeef   | New feature or request                   |
| `good first issue` | 7057ff   | Good for newcomers                       |
| `help wanted`      | 008672   | Extra attention is needed                |
| `invalid`          | e4e669   | This doesn't seem right                  |
| `question`         | d876e3   | Further information is requested         |
| `wontfix`          | ffffff   | This will not be worked on               |

---

## License

MIT
**Install:**
```sh
npm install OrithmicSoftware/telegram-comm-agent#main
```

> **Note:** This package is not published to npm. Install directly from GitHub.

## License
MIT
