// src/leadStore.js
// In-memory map for short-lived lead data (callback_data -> leadText)
// NOTE: This is reset on process restart. For production, use a persistent store.

const leadMap = new Map();

function storeLead(leadText) {
  // Generate a short unique ID (timestamp + random)
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  leadMap.set(id, leadText);
  // Optionally, prune old entries here
  return id;
}

function getLead(id) {
  return leadMap.get(id);
}

function deleteLead(id) {
  leadMap.delete(id);
}

module.exports = { storeLead, getLead, deleteLead };
