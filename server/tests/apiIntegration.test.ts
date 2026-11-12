import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';

function startTestServer(): Promise<{ server: http.Server; baseUrl: string }> {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });
}

test('Express app health, locations, carbon-estimate, auth guard, and 404 handler', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    // 1. Health endpoint
    const healthRes = await fetch(`${baseUrl}/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = (await healthRes.json()) as any;
    assert.equal(healthJson.success, true);
    assert.equal(healthJson.service, 'SERPENTIS API');
    assert.equal(healthRes.headers.get('x-content-type-options'), 'nosniff');

    // 2. Locations catalog
    const locRes = await fetch(`${baseUrl}/api/environment/locations?stage=pilot`);
    assert.equal(locRes.status, 200);
    const locJson = (await locRes.json()) as any;
    assert.equal(locJson.success, true);
    assert.ok(locJson.data.cities.length >= 3);
    assert.equal(locJson.data.cities[0].state, 'Maharashtra');

    // 3. Carbon estimate endpoint
    const carbonRes = await fetch(`${baseUrl}/api/environment/carbon-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlyElectricityKwh: 150, busTrainKmPerWeek: 40 }),
    });
    assert.equal(carbonRes.status, 200);
    const carbonJson = (await carbonRes.json()) as any;
    assert.equal(carbonJson.success, true);
    assert.ok(carbonJson.data.totalKgCo2PerYear > 0);

    // 4. Protected environmental endpoints enforce authMiddleware (401)
    const readingRes = await fetch(`${baseUrl}/api/environment/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metricName: 'noise-db', numericValue: 72 }),
    });
    assert.equal(readingRes.status, 401);

    const prefRes = await fetch(`${baseUrl}/api/environment/preferences`);
    assert.equal(prefRes.status, 401);

    // 5. Unknown route returns structured 404 JSON
    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-endpoint`);
    assert.equal(notFoundRes.status, 404);
    const notFoundJson = (await notFoundRes.json()) as any;
    assert.equal(notFoundJson.success, false);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
