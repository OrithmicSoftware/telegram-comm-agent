# telegram-comm-agent Documentation

## Overview
A reusable, configurable Telegram communication agent bot template for Node.js, based on Telegraf. Import as a library and provide your own config and secrets.

## Features
- Data-driven, step-by-step flow
- All prompts, services, and logic are configurable
- No secrets or business logic hardcoded
- Easy to integrate in any Node.js project

## Usage Example
See the main README.md for usage and configuration examples.

## API
### createCommAgent(TelegrafClass, config, secrets)
- `TelegrafClass`: The Telegraf class to instantiate (must be provided by the consumer; see peerDependencies)
- `config`: Object with STRINGS, SERVICES, BUTTONS, etc.
- `secrets`: Object with BOT_TOKEN, ADMIN_CHAT_ID, AGENT_CHAT_ID, FORWARD_TO_AGENT, etc.
- Returns: Configured Telegraf bot instance

## Configuration Reference
- See config.example.js in consumer projects for structure.
- All prompts, flow, and menu labels are customizable.

## Peer Dependencies
- You must install `telegraf` (version >=4.0.0) in your project and inject it as the first argument to `createCommAgent`.
	Example:
	```js
	const { Telegraf } = require('telegraf');
	const { createCommAgent } = require('telegram-comm-agent');
	const bot = createCommAgent(Telegraf, config, secrets);
	```

## Testing
- Run `npm test` to execute the test suite.

## License
MIT
