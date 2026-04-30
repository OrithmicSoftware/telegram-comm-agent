

# telegram-comm-agent: User & Developer Guide

## 1. Introduction

**telegram-comm-agent** is a modular, highly-configurable Telegram bot framework for Node.js, designed for lead capture, service flows, and chat automation. It is built on [Telegraf](https://telegraf.js.org/) and is intended for integration as a library in your own projects.

---

## 2. Architecture & Concepts

- **Config-driven**: All flows, prompts, and services are defined in config files—no business logic in code.
- **Separation of concerns**: Core logic, menus, callbacks, and forwarding are modularized for easy extension and testing.
- **Lead routing**: Flexible admin/agent routing with modes: `all`, `no`, `ask`.
- **Web integration**: Optional Express server for HTTP `/lead` endpoint.

---

## 3. Configuration Reference

See [`config.example.js`](../config.example.js) for a full template. Key fields:

- `BOT_TOKEN`, `ADMIN_CHAT_ID`, `AGENT_CHAT_ID`: Credentials and routing.
- `FORWARD_TO_AGENT`: `'all'`, `'no'`, or `'ask'` (lead routing mode).
- `SERVICES`: Service keys and labels.
- `STRINGS`: All prompts, templates, and button labels.
- `BUTTONS`: Main and service menu buttons.
- `FLOW`: Array of step objects `{ field, prompt }` for each service.

---

## 4. Usage Patterns

### Basic Bot
```js
const { createCommAgent } = require('telegram-comm-agent');
const config = require('./config');
const secrets = require('./secrets');
const bot = createCommAgent(config, secrets);
bot.launch();
```


### Web Server for /lead (since v1.0.4)
```js
const { createLeadWebServer } = require('telegram-comm-agent');
const server = createLeadWebServer({
	BOT_TOKEN: 'your-bot-token',
	ADMIN_CHAT_ID: 'admin-id',
	AGENT_CHAT_ID: 'agent-id',
	port: 3000 // or process.env.PORT
});
```
This enables direct HTTP integration for web forms and external lead sources.

### Custom Lead Forwarding
```js
const { handleLeadForwarding } = require('telegram-comm-agent');
await handleLeadForwarding(bot, config, leadText, { ctx });
```

---

## 5. API Reference

### createCommAgent(config, secrets)
Returns a Telegraf bot instance, fully wired with your config and flows.

### handleLeadForwarding(bot, config, leadText, options)
Forwards a lead to admin/agent according to config. `options` may include `{ ctx }` (Telegram) or `{ res }` (web).

### createLeadWebServer(options)
Returns an Express app with a `/lead` POST endpoint. See `src/server/web-server.js` for details.

---

## 6. Advanced: Extending & Testing

- **Menus, callbacks, and flows**: Extend or override by editing `src/menus.js`, `src/callbackHandlers.js`, etc.
- **Testing**: Use `npm test` for full unit and e2e coverage. E2E tests use instance-level mocking for Telegraf.
- **Mocking**: For tests, mock `bot.telegram.sendMessage` at the instance level.

---

## 7. Troubleshooting

- **Missing secrets/config**: Ensure all required fields are set in your config and secrets files.
- **Telegraf errors**: Check that you have installed a compatible version of `telegraf` (>=4.0.0).
- **Web server issues**: Confirm your Express app is running and receiving POST requests at `/lead`.

---

## 8. License

MIT
