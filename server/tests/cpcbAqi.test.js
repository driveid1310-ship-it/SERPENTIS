import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateCpcbNaqi, computePollutantSubIndex, getCpcbCategoryInfo, } from '../src/services/air-quality/CpcbAqiCalculator.js';
test('CPCB sub-index interpolation matches official breakpoints', () => {
    assert.equal(computePollutantSubIndex('pm25', 0), 0);
    assert.equal(computePollutantSubIndex('pm25', 30), 50);
    assert.equal(computePollutantSubIndex('pm25', 60), 100);
    assert.equal(computePollutantSubIndex('pm25', 90), 200);
    assert.equal(computePollutantSubIndex('pm25', 120), 300);
    assert.equal(computePollutantSubIndex('pm25', 250), 400);
    assert.equal(computePollutantSubIndex('pm25', 350), 500);
    assert.equal(computePollutantSubIndex('pm25', 500), 500);
    // Midpoint check: PM10 = 175 -> between 100..250 -> AQI 101..200 => ~151
    const pm10Mid = computePollutantSubIndex('pm10', 175);
    assert.ok(pm10Mid !== null && pm10Mid >= 150 && pm10Mid <= 151);
    // CO in mg/m3: 1.5 -> between 1.0..2.0 -> AQI 51..100 => 76
    const coMid = computePollutantSubIndex('co', 1.5);
    assert.ok(coMid !== null && coMid >= 75 && coMid <= 76);
});
test('CPCB NAQI uses max sub-index (never averages) and identifies dominant pollutant', () => {
    const result = calculateCpcbNaqi({
        values: {
            pm25: 75, // sub-index ~151 (Moderately Polluted)
            pm10: 80, // sub-index ~80 (Satisfactory)
            no2: 35, // sub-index ~44 (Good)
            so2: 20, // sub-index ~25 (Good)
        },
        isOfficialStationMeasurement: true,
    });
    assert.equal(result.isOfficialAqi, true);
    assert.equal(result.dominantPollutant, 'pm25');
    assert.equal(result.aqiCategory, 'Moderately Polluted');
    assert.ok(result.overallAqi !== null && result.overallAqi >= 150 && result.overallAqi <= 152);
});
test('CPCB Minimum-Three Rule rejects official AQI when fewer than 3 pollutants or no PM', () => {
    const onlyTwo = calculateCpcbNaqi({
        values: { pm25: 45, no2: 30 },
        isOfficialStationMeasurement: true,
    });
    assert.equal(onlyTwo.isOfficialAqi, false);
    assert.equal(onlyTwo.overallAqi, null);
    assert.ok(onlyTwo.insufficientReason?.includes('Insufficient'));
    const noPm = calculateCpcbNaqi({
        values: { no2: 40, so2: 30, o3: 50, co: 1.0 },
        isOfficialStationMeasurement: true,
    });
    assert.equal(noPm.isOfficialAqi, false);
    assert.equal(noPm.overallAqi, null);
    assert.ok(noPm.insufficientReason?.includes('PM2.5 or PM10'));
});
test('Modeled data never produces isOfficialAqi=true and labels category as Modeled Estimate', () => {
    const modeled = calculateCpcbNaqi({
        values: { pm25: 110, pm10: 190, no2: 60 },
        isOfficialStationMeasurement: false,
    });
    assert.equal(modeled.isOfficialAqi, false);
    assert.ok(modeled.overallAqi !== null && modeled.overallAqi >= 201 && modeled.overallAqi <= 300);
    assert.equal(modeled.aqiCategory, 'Poor (Modeled Estimate)');
});
test('Invalid and negative pollutant measurements are flagged as suspect and ignored', () => {
    const invalid = calculateCpcbNaqi({
        values: {
            pm25: -15,
            pm10: 99999,
            no2: 30,
            so2: 20,
            o3: 40,
        },
        isOfficialStationMeasurement: true,
    });
    assert.equal(invalid.pollutants.pm25.status, 'suspect');
    assert.equal(invalid.pollutants.pm10.status, 'suspect');
    assert.equal(invalid.isOfficialAqi, false);
    assert.equal(invalid.overallAqi, null);
});
test('All CPCB AQI category thresholds map accurately', () => {
    assert.equal(getCpcbCategoryInfo(25).category, 'Good');
    assert.equal(getCpcbCategoryInfo(75).category, 'Satisfactory');
    assert.equal(getCpcbCategoryInfo(150).category, 'Moderately Polluted');
    assert.equal(getCpcbCategoryInfo(250).category, 'Poor');
    assert.equal(getCpcbCategoryInfo(350).category, 'Very Poor');
    assert.equal(getCpcbCategoryInfo(450).category, 'Severe');
    assert.equal(getCpcbCategoryInfo(null).category, 'Unavailable');
});
//# sourceMappingURL=cpcbAqi.test.js.map