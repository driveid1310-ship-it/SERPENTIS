import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCpcbCategoryInfo,
  calculateCpcbNaqi,
} from '../src/services/air-quality/CpcbAqiCalculator.js';
import {
  INDIA_CITY_CATALOG,
  DEFAULT_PILOT_CITY_SLUG,
  indiaLocationService,
} from '../src/services/location/IndiaLocationService.js';
import type {
  ApiResponse,
  ApiSuccessResponse,
  ApiErrorResponse,
  ReportCategory,
  SOSType,
  ServiceCategory,
  PlaceCategory,
} from '../src/types/index.js';

test('Shared types and contracts integrity test suite', async (t) => {
  await t.test('Standard API response envelopes conform to contract', () => {
    const successEnvelope: ApiSuccessResponse<{ count: number }> = {
      success: true,
      message: 'Resource retrieved',
      data: { count: 42 },
    };
    assert.equal(successEnvelope.success, true);
    assert.equal(successEnvelope.data.count, 42);

    const errorEnvelope: ApiErrorResponse = {
      success: false,
      message: 'Validation failed',
      errors: ['Invalid field'],
    };
    assert.equal(errorEnvelope.success, false);
    assert.ok(errorEnvelope.errors?.length === 1);
  });

  await t.test('Domain category types encompass all standard civic and environmental values', () => {
    const reportCategories: ReportCategory[] = [
      'pothole',
      'garbage',
      'water-leakage',
      'air-pollution',
      'waterlogging',
      'food-safety',
    ];
    assert.ok(reportCategories.length === 6);

    const sosTypes: SOSType[] = ['accident', 'medical', 'fire', 'crime', 'flood'];
    assert.ok(sosTypes.length === 5);

    const serviceCategories: ServiceCategory[] = [
      'hospital',
      'police',
      'fire-station',
      'pharmacy',
      'other',
    ];
    assert.ok(serviceCategories.length >= 4);

    const placeCategories: PlaceCategory[] = ['fort', 'temple', 'museum', 'park'];
    assert.ok(placeCategories.length === 4);
  });

  await t.test('City catalog includes default pilot city with complete metadata', () => {
    assert.equal(DEFAULT_PILOT_CITY_SLUG, 'badlapur-maharashtra');
    const pilot = indiaLocationService.findInCatalogBySlugOrName('badlapur-maharashtra');
    assert.ok(pilot !== null);
    assert.equal(pilot.city, 'Badlapur');
    assert.equal(pilot.district, 'Thane');
    assert.equal(pilot.state, 'Maharashtra');
    assert.equal(pilot.isPilot, true);
    assert.ok(INDIA_CITY_CATALOG.length >= 10);
  });

  await t.test('CPCB categories and NAQI calculators return valid types', () => {
    const catGood = getCpcbCategoryInfo(35);
    assert.equal(catGood.category, 'Good');
    assert.equal(catGood.colorHex, '#22C55E');

    const catSevere = getCpcbCategoryInfo(450);
    assert.equal(catSevere.category, 'Severe');
    assert.equal(catSevere.colorHex, '#A855F7');

    const result = calculateCpcbNaqi({
      values: {
        pm25: 65,
        pm10: 120,
        no2: 45,
      },
      isOfficialStationMeasurement: true,
    });
    assert.ok(result.overallAqi !== null);
    assert.equal(result.isOfficialAqi, true);
    assert.ok(result.dominantPollutant !== null);
  });
});
