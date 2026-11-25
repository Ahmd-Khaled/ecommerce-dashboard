// Run with node scripts/test-request-id.cjs; use the installed TypeScript compiler.
/* eslint-disable @typescript-eslint/no-require-imports -- This CommonJS harness installs a TypeScript require hook. */
const fs = require('node:fs');
const assert = require('node:assert/strict');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, filename);
};
const axios = require('axios');
let refreshAdapter;
axios.defaults.adapter = config => refreshAdapter(config);
const { api, setAdminSessionBootstrapInProgress } = require('../src/lib/api/axios.ts');
const { getRequestId } = require('../src/lib/api/request-id.ts');
const response = (config, id, status = 200) => ({ config, status, statusText: '', data: {}, headers: id ? { 'X-ReQuEsT-Id': id } : {} });
const fail = (config, id, status) => new axios.AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, undefined, response(config, id, status));

async function main() {
  assert.equal(getRequestId(response({}, 'success')), 'success');
  assert.equal(getRequestId({ ...response({}, undefined), headers: new axios.AxiosHeaders({ 'X-Request-Id': 'axios-header' }) }), 'axios-header');
  for (const value of [null, {}, new Error('offline'), new axios.AxiosError('Network Error'), response({}, undefined), response({}, 'bad\nvalue')]) {
    assert.equal(getRequestId(value), undefined);
  }
  const results = await Promise.all(['one', 'two'].map(id => api.get('/test', { adapter: async config => response(config, id) })));
  assert.deepEqual(results.map(getRequestId), ['one', 'two']);
  setAdminSessionBootstrapInProgress(true);
  const original = fail({}, 'http-error', 500);
  await assert.rejects(api.get('/test', { adapter: async () => { throw original; } }), error => error === original && getRequestId(error) === 'http-error');
  for (const original of [new axios.CanceledError(), new axios.AxiosError('timeout', 'ECONNABORTED'), new axios.AxiosError('Network Error', 'ERR_NETWORK')]) {
    await assert.rejects(api.get('/test', { adapter: async () => { throw original; } }), error => error === original && getRequestId(error) === undefined);
  }
  setAdminSessionBootstrapInProgress(false);
  const savedAdapter = axios.defaults.adapter;
  refreshAdapter = async config => ({ ...response(config, 'refresh'), data: { tokens: { accessToken: 'test-token' } } });
  try {
    let first;
    const retried = await api.get('/test', { adapter: async config => {
      if (!config._retry) { first = fail(config, 'first-attempt', 401); throw first; }
      return response(config, 'second-attempt');
    } });
    assert.equal(getRequestId(first), 'first-attempt');
    assert.equal(getRequestId(retried), 'second-attempt');
    const withoutHeader = await api.get('/test', { adapter: async config => {
      if (!config._retry) throw fail(config, 'discarded-401', 401);
      return response(config, undefined);
    } });
    assert.equal(getRequestId(withoutHeader), undefined);
    await assert.rejects(api.get('/test', { adapter: async config => { throw fail(config, config._retry ? 'retry-error' : 'initial-error', config._retry ? 500 : 401); } }), error => getRequestId(error) === 'retry-error');
    refreshAdapter = async config => { throw fail(config, 'refresh-error', 401); };
    await assert.rejects(api.get('/test', { adapter: async config => { throw fail(config, 'original-401', 401); } }), error => getRequestId(error) === 'refresh-error');
  } finally { axios.defaults.adapter = savedAdapter; }
  const form = new FormData();
  form.append('file', 'example');
  await api.post('/upload', form, { adapter: async config => {
    assert.equal(config.data, form);
    assert.equal(config.timeout, 15000);
    return response(config, 'upload');
  } });
  for (const locale of ['en', 'ar']) {
    const messages = JSON.parse(fs.readFileSync(`messages/${locale}.json`, 'utf8'));
    assert.ok(messages.ApiError.reference.includes('{requestId}'));
    assert.ok(!messages.ApiError.reference.includes('?'));
  }
  console.log('Request ID checks passed: headers, errors, concurrency, retries, refresh failure, cancellation, timeout, multipart, locales.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
