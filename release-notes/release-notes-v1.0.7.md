### v1.0.7

- Full config-driven localization: all user/admin-facing strings and templates are now provided by the consumer (no hardcoded fallbacks)
- Username in lead templates is now rendered as a Telegram link
- Fallback message for random user input uses consumer MSG_TEMPLATE (fully localized)
- /lead endpoint and all forwarding logic use only config-provided templates and button labels
- Tests updated and passing for all config-driven changes
- Documentation and release notes updated for v1.0.7
---
