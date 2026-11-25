/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8').replace('"@/lib/api/axios"', '"../../../lib/api/axios"');
  module._compile(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText, filename);
};
const { api } = require('../src/lib/api/axios.ts');
const { systemLogsApi } = require('../src/features/system-logs/api/system-logs.api.ts');
const axios = require('axios');
async function main() {
  const calls = [];
  const payload = { items: [], pageInfo: { hasNextPage: false, nextCursor: null } };
  api.defaults.adapter = async config => {
    calls.push(config);
    return { config, status: 200, statusText: 'OK', headers: {}, data: { success: true, data: payload } };
  };
  const signal = new AbortController().signal;
  const filters = { from: '2026-11-24T00:00:00.000Z', to: '2026-11-25T00:00:00.000Z', method: 'POST', route: '/:id', requestId: 'request', outcome: 'failure', statusGroup: '5xx', minDurationMs: '100', limit: 25 };
  assert.deepEqual(await systemLogsApi.list(filters, undefined, signal), payload);
  await systemLogsApi.list(filters, 'signed.cursor', signal);
  assert.deepEqual(Object.fromEntries(calls[1].params), { ...filters, limit: '25', after: 'signed.cursor' });
  await systemLogsApi.statistics(filters, signal);
  assert.equal(calls[2].url, '/admin/system-logs/statistics');
  assert.deepEqual(Object.fromEntries(calls[2].params), { from: filters.from, to: filters.to, method: 'POST', route: '/:id', slowThresholdMs: '1000' });
  await systemLogsApi.detail('event-id', signal);
  assert.equal(calls[3].url, '/admin/system-logs/event-id');
  for (const call of calls) {
    assert.equal(call.signal, signal);
    assert.equal(call.headers.get('Cache-Control'), 'no-store');
  }
  await systemLogsApi.list({ limit: 25, minDurationMs: '0', route: '<unmatched>', method: '' }, undefined, signal);
  assert.equal(calls[4].params.get('minDurationMs'), '0');
  assert.equal(calls[4].params.has('method'), false);
  assert.equal(calls[4].params.has('after'), false);
  assert.ok(calls[4].params.toString().includes('route=%3Cunmatched%3E'));
  for (const data of ['<html>Bad gateway</html>', { success: false }, { success: true, data: null }]) {
    api.defaults.adapter = async config => ({ config, status: 200, headers: { 'x-request-id': 'invalid-response-id' }, data });
    await assert.rejects(systemLogsApi.list(filters, undefined, signal), e => e.code === 'INVALID_RESPONSE' && e.response.headers['x-request-id'] === 'invalid-response-id');
  }
  const controller = new AbortController(); controller.abort();
  await assert.rejects(systemLogsApi.list(filters, undefined, controller.signal), axios.isCancel);
  const failure = new axios.AxiosError('unavailable', 'ERR_BAD_RESPONSE', undefined, undefined, { status: 503 });
  api.defaults.adapter = async () => { throw failure; };
  await assert.rejects(systemLogsApi.list(filters, undefined, signal), e => e === failure);
  const originalNow = Date.now;
  let now = originalNow();
  Date.now = () => now;
  try {
    for (const [kind, delay] of [['missing', 60000], ['seconds', 90000], ['date', 120000]]) {
      const header = kind === 'missing' ? undefined : kind === 'seconds' ? '90' : new Date(now + 120000).toUTCString();
      let requests = 0;
      api.defaults.adapter = async () => {
        requests++;
        throw new axios.AxiosError('limited', 'ERR_BAD_RESPONSE', undefined, undefined, { status: 429, headers: { 'retry-after': header } });
      };
      await assert.rejects(systemLogsApi.list(filters, undefined, signal));
      await assert.rejects(systemLogsApi.statistics(filters, signal), e => e.code === 'RATE_LIMITED');
      assert.equal(requests, 1, 'shared cooldown must prevent a statistics network request');
      now += delay + 2000;
    }
  } finally { Date.now = originalNow; }
  console.log('System Logs contract checks passed: envelopes, cursor filters, statistics scope, details, no-store, cancellation, error propagation.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
