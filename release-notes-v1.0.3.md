-### v1.0.3

- Refactor: all user/admin-facing strings and message templates moved to config for localization and maintainability
- Add English defaults and remove all hardcoded fallbacks
- Fix: BUTTON_DATA_INVALID by using short unique ID and in-memory mapping
- Add message field to flow and template, remove phone from steps
- Export createWebServer from main entry
- Expanded tests for forwarding logic and callback_data
- Release/tag workflow: tags/releases are now consistent and gapless
---
