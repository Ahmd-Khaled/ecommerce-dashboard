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
const { logFiltersSchema } = require('../src/features/system-logs/schemas/system-log.schema.ts');
async function main() {
  const calls = [];
  const payload = { items: [], pageInfo: { hasNextPage: false, nextCursor: null } };
  const detail = {
    logId: '4e5f1a62-475c-4b6f-bcc6-36a19c3d769e', schemaVersion: 1,
    occurredAt: '2026-11-24T08:30:15.123Z', requestId: 'e56c963d-1e12-4b53-bc02-e5792dd523e1',
    service: 'ecommerce-backend', environment: 'development', kind: 'request', action: 'http.request',
    level: 'error', outcome: 'aborted', actor: { type: 'anonymous' },
    http: { method: 'GET', route: '/:id', statusCode: 200, durationMs: 12, completed: false },
  };
  const statistics = {
    from: '2026-11-24T00:00:00.000Z', to: '2026-11-25T00:00:00.000Z', slowThresholdMs: 1000,
    totalRequests: 0, successfulRequests: 0, failedRequests: 0, completedRequests: 0,
    abortedRequests: 0, deniedRequests: 0, slowRequests: 0, clientErrorRequests: 0,
    serverErrorRequests: 0, averageDurationMs: 0, maxDurationMs: 0,
    p50DurationMs: 0, p95DurationMs: 0, p99DurationMs: 0,
  };
  api.defaults.adapter = async config => {
    calls.push(config);
    const data = config.url.endsWith('/statistics') ? statistics : config.url.endsWith('/event-id') ? detail : payload;
    return { config, status: 200, statusText: 'OK', headers: {}, data: { success: true, data } };
  };
  const signal = new AbortController().signal;
  const filters = { from: '2026-11-24T00:00:00.000Z', to: '2026-11-25T00:00:00.000Z', method: 'POST', route: '/:id', requestId: 'request', outcome: 'failure', statusGroup: '5xx', minDurationMs: '100', limit: 25 };
  assert.deepEqual(await systemLogsApi.list(filters, undefined, signal), payload);
  await systemLogsApi.list(filters, 'signed.cursor', signal);
  assert.deepEqual(Object.fromEntries(calls[1].params), { ...filters, limit: '25', after: 'signed.cursor' });
  assert.deepEqual(await systemLogsApi.statistics(filters, signal), statistics);
  assert.equal(calls[2].url, '/admin/system-logs/statistics');
  assert.deepEqual(Object.fromEntries(calls[2].params), { from: filters.from, to: filters.to, method: 'POST', route: '/:id', slowThresholdMs: '1000' });
  assert.deepEqual(await systemLogsApi.detail('event-id', signal), detail);
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
  const populated = { items: [detail, { ...detail,
    actor: { type: 'admin', id: '123456789012345678901234', identityModel: 'Admin', role: 'super-admin' },
    error: { code: 'FORBIDDEN' },
  }], pageInfo: { hasNextPage: true, nextCursor: 'signed.cursor' } };
  api.defaults.adapter = async config => ({ config, status: 200, headers: {}, data: { success: true, data: populated } });
  assert.deepEqual(await systemLogsApi.list(filters, undefined, signal), populated);
  for (const data of ['<html>Bad gateway</html>', { success: false }, { success: true, data: null },
    { success: true, data: {} }, { success: true, data: { items: [], pageInfo: { hasNextPage: true, nextCursor: null } } },
    { success: true, data: { ...payload, items: [{ ...detail, http: null }] } }]) {
    api.defaults.adapter = async config => ({ config, status: 200, headers: { 'x-request-id': 'invalid-response-id' }, data });
    await assert.rejects(systemLogsApi.list(filters, undefined, signal), e => e.code === 'INVALID_RESPONSE' && e.response.headers['x-request-id'] === 'invalid-response-id');
  }
  for (const [request, data] of [
    [() => systemLogsApi.statistics(filters, signal), { ...statistics, p95DurationMs: '12' }],
    [() => systemLogsApi.statistics(filters, signal), {}],
    [() => systemLogsApi.detail('event-id', signal), { ...detail, actor: null }],
    [() => systemLogsApi.detail('event-id', signal), { ...detail, outcome: 'unknown' }],
  ]) {
    api.defaults.adapter = async config => ({ config, status: 200, headers: {}, data: { success: true, data } });
    await assert.rejects(request(), e => e.code === 'INVALID_RESPONSE');
  }
  const validFilters = { limit: 25, minDurationMs: '0', requestId: detail.requestId };
  assert.equal(logFiltersSchema.safeParse(validFilters).success, true);
  for (const invalid of [
    { limit: 0 }, { limit: 101 }, { requestId: '00000000-0000-0000-0000-000000000001' },
    { route: 'x'.repeat(257) }, { minDurationMs: '2147483648' }, { minDurationMs: '1e3' },
    { statusCode: '200', statusGroup: '2xx' },
  ]) assert.equal(logFiltersSchema.safeParse({ ...validFilters, ...invalid }).success, false);
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
