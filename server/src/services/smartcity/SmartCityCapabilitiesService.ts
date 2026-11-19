import Place from '../../models/Place.js';
import PublicService from '../../models/PublicService.js';
import type { LocationContext, WeatherDataResult } from '../data-providers/types.js';

export interface CarbonEstimateInput {
  carKmPerWeek?: number | undefined;
  twoWheelerKmPerWeek?: number | undefined;
  busTrainKmPerWeek?: number | undefined;
  monthlyElectricityKwh?: number | undefined;
  lpgCylindersPerMonth?: number | undefined;
}

export class SmartCityCapabilitiesService {
  async getDisasterPreparedness(location: LocationContext) {
    const centerPoint = {
      type: 'Point' as const,
      coordinates: [location.longitude, location.latitude],
    };

    const [hospitals, policeStations, fireStations] = await Promise.all([
      PublicService.find({
        category: 'hospital',
        location: { $near: { $geometry: centerPoint, $maxDistance: 25000 } },
      })
        .limit(10)
        .select('name address phone openingHours location')
        .lean(),
      PublicService.find({
        category: 'police',
        location: { $near: { $geometry: centerPoint, $maxDistance: 25000 } },
      })
        .limit(5)
        .select('name address phone location')
        .lean(),
      PublicService.find({
        category: 'fire-station',
        location: { $near: { $geometry: centerPoint, $maxDistance: 25000 } },
      })
        .limit(5)
        .select('name address phone location')
        .lean(),
    ]);

    return {
      location,
      nationalEmergencyContacts: [
        { label: 'National Emergency (All-in-One)', number: '112' },
        { label: 'Police', number: '100' },
        { label: 'Fire Brigade', number: '101' },
        { label: 'Ambulance', number: '108' },
        { label: 'Disaster Management (NDMA / State Helpline)', number: '1070' },
        { label: 'District Emergency Operations', number: '1077' },
      ],
      nearbyEmergencyServices: {
        hospitals,
        policeStations,
        fireStations,
      },
      safetyGuides: [
        {
          hazard: 'Urban Flooding / Waterlogging',
          steps: [
            'Avoid walking or driving through moving or stagnant floodwater.',
            'Switch off main electrical supply if water enters ground-floor premises.',
            'Follow official Municipal Corporation & IMD bulletins.',
          ],
        },
        {
          hazard: 'Heatwave',
          steps: [
            'Stay indoors between 12 PM and 4 PM; hydrate with ORS or salted buttermilk.',
            'Seek medical help immediately for dizziness, confusion, or high body temperature.',
          ],
        },
        {
          hazard: 'Severe Air Pollution',
          steps: [
            'Wear N95 masks outdoors and restrict strenuous exercise.',
            'Keep windows shut during peak evening inversion.',
          ],
        },
      ],
    };
  }

  calculateEducationalCarbonFootprint(input: CarbonEstimateInput) {
    // Standard educational emission factors (India CEA grid ~0.82 kg CO2/kWh; typical petrol car ~0.192 kg/km; 2-wheeler ~0.065 kg/km; bus/rail ~0.045 kg/km; 14.2kg LPG ~42.5 kg CO2)
    const carKgYear = (input.carKmPerWeek ?? 0) * 52 * 0.192;
    const twoWheelerKgYear = (input.twoWheelerKmPerWeek ?? 0) * 52 * 0.065;
    const transitKgYear = (input.busTrainKmPerWeek ?? 0) * 52 * 0.045;
    const electricityKgYear = (input.monthlyElectricityKwh ?? 0) * 12 * 0.82;
    const lpgKgYear = (input.lpgCylindersPerMonth ?? 0) * 12 * 42.5;

    const totalKgCo2PerYear = Number(
      (carKgYear + twoWheelerKgYear + transitKgYear + electricityKgYear + lpgKgYear).toFixed(1),
    );
    const totalTonnesPerYear = Number((totalKgCo2PerYear / 1000).toFixed(2));

    const recommendations: string[] = [];
    if (carKgYear > electricityKgYear) {
      recommendations.push(
        'Shifting 30% of weekly car travel to suburban rail, metro, or bus can cut transport emissions substantially.',
      );
    }
    if (electricityKgYear > 1500) {
      recommendations.push(
        'Using BEE 5-star inverter appliances and LED lighting helps reduce residential electricity emissions.',
      );
    }
    if (recommendations.length === 0) {
      recommendations.push(
        'Maintain low-carbon transit habits and consider rooftop solar where feasible.',
      );
    }

    return {
      totalKgCo2PerYear,
      totalTonnesPerYear,
      breakdownKgPerYear: {
        car: Number(carKgYear.toFixed(1)),
        twoWheeler: Number(twoWheelerKgYear.toFixed(1)),
        publicTransit: Number(transitKgYear.toFixed(1)),
        electricity: Number(electricityKgYear.toFixed(1)),
        lpgCooking: Number(lpgKgYear.toFixed(1)),
      },
      recommendations,
      assumptionsDisclaimer:
        'Educational estimate using approximate Indian grid (0.82 kg CO2/kWh) and transport emission factors. Not an audited carbon inventory.',
    };
  }

  getSolarPotential(location: LocationContext, weather: WeatherDataResult) {
    const radWm2 = weather.current.solarRadiationWm2;
    const daylight = weather.current.daylightDurationHours;
    const cloudPct = weather.current.cloudCoverPct;

    let rating = 'Moderate';
    if (radWm2 !== null) {
      if (radWm2 >= 600) rating = 'High';
      else if (radWm2 < 200) rating = 'Low (Current / Cloud-Affected)';
    }

    return {
      location,
      currentSolarRadiationWm2: radWm2,
      daylightDurationHours: daylight,
      cloudCoverPct: cloudPct,
      currentRating: rating,
      provider: weather.provider,
      note:
        radWm2 !== null
          ? 'Instantaneous shortwave solar radiation from weather model. Multi-year rooftop kWp sizing requires site-specific shading and tilt survey.'
          : 'Solar irradiance measurement unavailable from active provider.',
    };
  }

  async getMobilityAndGreenSpaces(location: LocationContext) {
    const centerPoint = {
      type: 'Point' as const,
      coordinates: [location.longitude, location.latitude],
    };

    const [transitStops, greenSpaces] = await Promise.all([
      PublicService.find({
        category: { $in: ['bus-stop', 'railway-station'] },
        location: { $near: { $geometry: centerPoint, $maxDistance: 20000 } },
      })
        .limit(25)
        .select('name category address location')
        .lean(),
      Place.find({
        category: { $in: ['park', 'lake', 'waterfall', 'viewpoint'] },
        location: { $near: { $geometry: centerPoint, $maxDistance: 25000 } },
      })
        .limit(25)
        .select('name category address location visitingHours averageRating')
        .lean(),
    ]);

    return {
      location,
      transitStops,
      greenSpaces,
      dataNote:
        'Transit stops and green spaces reflect verified entries stored in the SERPENTIS database; unrecorded hours are omitted rather than fabricated.',
    };
  }

  getCitizenChallenges(location: LocationContext) {
    return {
      location,
      challenges: [
        {
          id: 'clean-ward-drive',
          title: 'Zero-Dumping Ward Mapping',
          description: `Log and help resolve garbage or open-burning hotspots in ${location.city}.`,
          rewardPoints: 25,
          badgeHint: 'City Guardian',
        },
        {
          id: 'monsoon-drain-watch',
          title: 'Pre-Monsoon Drain & Waterlogging Watch',
          description: 'Report clogged stormwater drains and localized waterlogging points.',
          rewardPoints: 20,
          badgeHint: 'Active Reporter',
        },
        {
          id: 'green-audit',
          title: 'Local Green Space & Tree Protection',
          description: 'Document park maintenance needs or illegal tree cutting.',
          rewardPoints: 20,
          badgeHint: 'Community Champion',
        },
      ],
    };
  }
}

export const smartCityCapabilitiesService = new SmartCityCapabilitiesService();
