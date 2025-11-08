// Polyfill for TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock HelmetAsync context
class MockHelmetDispatcher {
  constructor() {
    this.instances = new Set();
  }
  add() {}
  remove() {}
  canUseDOM() {
    return false;
  }
}

global.mockHelmetContext = {
  helmet: {},
  setHelmet: () => {},
  helmetInstances: {
    get: () => new MockHelmetDispatcher(),
    add: () => {},
    remove: () => {},
  },
};
