const { makeCorsConfig } = require('../../src/utils/cors');

describe('makeCorsConfig', () => {
  it('returns false for false', () => {
    expect(makeCorsConfig(false)).toEqual({ origin: false });
  });
  it('returns false for empty array', () => {
    expect(makeCorsConfig([])).toEqual({ origin: false });
  });
  it('splits string origins', () => {
    expect(makeCorsConfig('a.com, b.com')).toEqual({
      origin: ['a.com', 'b.com'],
      methods: ['POST'],
      credentials: false,
    });
  });
  it('returns array origins', () => {
    expect(makeCorsConfig(['a.com', 'b.com'])).toEqual({
      origin: ['a.com', 'b.com'],
      methods: ['POST'],
      credentials: false,
    });
  });
});