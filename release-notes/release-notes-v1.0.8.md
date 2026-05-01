### v1.0.8

- Telegram `/start` payloads such as `src_<source>` are now preserved through the bot flow and appended to bot-generated leads
- Added `POST /bot/lead` for source-aware lead forwarding with `name`, `phone`, `message`, and `source`
- Source rendering is configurable through `STRINGS.SOURCE_LABEL`, with focused test coverage for source propagation and source-aware forwarding
---
