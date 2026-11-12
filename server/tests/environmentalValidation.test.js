import test from 'node:test';
import assert from 'node:assert/strict';
import { celsiusToFahrenheit, computeDaylightDurationHours, computeDewPointC, computeHeatIndexC, computeWindChillC, fahrenheitToCelsius, haversineDistanceKm, isReadingStale, isValidCoordinates, kmhToMs, msToKmh, validatePollutantReading, } from '../src/services/environmental/EnvironmentalValidationService.js';
test('Temperature and wind speed unit conversions are accurate', () => {
    assert.equal(celsiusToFahrenheit(0), 32);
    assert.equal(celsiusToFahrenheit(100), 212);
    assert.equal(celsiusToFahrenheit(35), 95);
    assert.equal(fahrenheitToCelsius(95), 35);
    assert.equal(kmhToMs(36), 10);
    assert.equal(msToKmh(10), 36);
});
test('Scientific weather indicators compute accurately within valid physical domains', () => {
    const hi = computeHeatIndexC(35, 60);
    assert.ok(hi !== null && hi > 40);
    assert.equal(computeHeatIndexC(22, 60), null); // outside domain
    const dp = computeDewPointC(30, 50);
    assert.ok(dp !== null && dp > 17 && dp < 20);
    const wc = computeWindChillC(5, 20);
    assert.ok(wc !== null && wc < 5);
    assert.equal(computeWindChillC(25, 20), null); // outside domain
    const dl = computeDaylightDurationHours('2026-11-12T06:40:00+05:30', '2026-11-12T18:00:00+05:30');
    assert.equal(dl, 11.33);
});
test('Coordinate, stale-reading, and pollutant validation behave reliably', () => {
    assert.equal(isValidCoordinates(19.1668, 73.2355), true);
    assert.equal(isValidCoordinates(95, 73), false);
    assert.equal(isValidCoordinates(19, -200), false);
    const oldIso = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const freshIso = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    assert.equal(isReadingStale(oldIso, 180), true);
    assert.equal(isReadingStale(freshIso, 180), false);
    assert.equal(validatePollutantReading('pm25', 45.678).sanitized, 45.68);
    assert.equal(validatePollutantReading('pm25', -5).status, 'suspect');
    assert.equal(validatePollutantReading('pm25', null).status, 'insufficient');
    // Badlapur to Thane ~ 27 km
    const dist = haversineDistanceKm(19.1668, 73.2355, 19.2183, 72.9781);
    assert.ok(dist > 20 && dist < 35);
});
//# sourceMappingURL=environmentalValidation.test.js.map