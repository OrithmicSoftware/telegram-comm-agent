### v1.0.8

- Bot conversation leads now use `MSG_TEMPLATE` instead of `LEAD_TEMPLATE`
- Fallback freetext messages correctly pass `{ message: text }` as collected data to `MSG_TEMPLATE`
- `/lead` endpoint refactored to use `handleLeadForwarding` (supports all forwarding modes: all/ask/no)
- Tests added and passing for all three forwarding modes in both unit and e2e suites
---
