const { test } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers/load.cjs');
const { resolveEntitlement } = load('src/domain/entitlement.ts');

test('no source or an explicit Free source resolves to Free', async () => {
  assert.equal(await resolveEntitlement(), 'free');
  assert.equal(await resolveEntitlement({ getEntitlement: () => 'free' }), 'free');
});

test('a valid synchronous or asynchronous Pro source resolves deterministically', async () => {
  const source = { getEntitlement: async () => 'pro' };
  assert.equal(await resolveEntitlement({ getEntitlement: () => 'pro' }), 'pro');
  assert.equal(await resolveEntitlement(source), 'pro');
  assert.equal(await resolveEntitlement(source), 'pro');
});

test('failed or malformed sources fail closed without changing their state', async () => {
  const source = { calls: 0, getEntitlement() { this.calls++; throw new Error('unavailable'); } };
  assert.equal(await resolveEntitlement(source), 'free');
  assert.equal(source.calls, 1);
  assert.equal(await resolveEntitlement({ getEntitlement: async () => { throw new Error('offline'); } }), 'free');
  assert.equal(await resolveEntitlement({ getEntitlement: () => 'unknown' }), 'free');
  assert.equal(await resolveEntitlement({ getEntitlement: () => null }), 'free');
});
