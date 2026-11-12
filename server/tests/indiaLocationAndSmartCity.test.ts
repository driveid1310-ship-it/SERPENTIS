import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INDIA_CITY_CATALOG,
  INDIA_STATES_AND_UTS,
  IndiaLocationService,
} from '../src/services/location/IndiaLocationService.js';
import { SmartCityCapabilitiesService } from '../src/services/smartcity/SmartCityCapabilitiesService.js';

test('IndiaLocationService supports Badlapur East/West pilot, Maharashtra, and Pan-India hierarchy', async () => {
  const svc = new IndiaLocationService();

  const defaultLoc = svc.getDefaultPilotLocation();
  assert.equal(defaultLoc.city, 'Badlapur');
  assert.equal(defaultLoc.district, 'Thane');
  assert.equal(defaultLoc.state, 'Maharashtra');

  const east = await svc.resolveLocation({ slug: 'badlapur-east-maharashtra' });
  assert.ok(east.locality?.includes('Badlapur East'));

  const west = await svc.resolveLocation({ city: 'Badlapur West' });
  assert.ok(west.locality?.includes('Badlapur West'));

  const pune = await svc.resolveLocation({ city: 'Pune' });
  assert.equal(pune.state, 'Maharashtra');

  const delhi = await svc.resolveLocation({ city: 'Delhi' });
  assert.equal(delhi.city, 'New Delhi');

  // Coordinate resolution near Badlapur
  const nearBadlapur = await svc.resolveLocation({ lat: 19.17, lon: 73.24 });
  assert.equal(nearBadlapur.city, 'Badlapur');

  assert.equal(INDIA_STATES_AND_UTS.length, 36);
  assert.ok(INDIA_CITY_CATALOG.length >= 25);
});

test('SmartCityCapabilitiesService calculates educational carbon footprint transparently', () => {
  const svc = new SmartCityCapabilitiesService();
  const result = svc.calculateEducationalCarbonFootprint({
    carKmPerWeek: 100,
    monthlyElectricityKwh: 200,
    lpgCylindersPerMonth: 1,
  });

  assert.ok(result.totalKgCo2PerYear > 3000);
  assert.ok(result.assumptionsDisclaimer.includes('Educational estimate'));
  assert.ok(result.recommendations.length > 0);
});
