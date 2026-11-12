import type {
  AIAssistantRequest,
  AIAssistantResponse,
  AIImageAnalysisResult,
  AIProvider,
  AirQualityDataResult,
  LocationContext,
  WeatherDataResult,
} from '../data-providers/types.js';
import type { IEnvironmentalAlert } from '../../models/EnvironmentalAlert.js';
import Report from '../../models/Report.js';

class DeterministicFallbackAIProvider implements AIProvider {
  public readonly name = 'SERPENTIS Deterministic Intelligence (Non-AI Fallback)';

  isConfigured(): boolean {
    return true;
  }

  async answerEnvironmentalQuestion(
    req: AIAssistantRequest,
  ): Promise<AIAssistantResponse> {
    const q = req.question.toLowerCase();
    const ctx = req.contextSnapshot as {
      weather?: WeatherDataResult;
      airQuality?: AirQualityDataResult;
      alerts?: IEnvironmentalAlert[];
      nearbyReportsCount?: number;
      waterloggingCount?: number;
      topHotspotCategories?: Array<{ category: string; count: number }>;
    };

    const weather = ctx.weather;
    const aqi = ctx.airQuality;
    const alerts = ctx.alerts ?? [];

    const parts: string[] = [];
    const sources: string[] = [];

    if (weather) sources.push(`${weather.provider} (${weather.observationTimestamp})`);
    if (aqi) sources.push(`${aqi.provider} (${aqi.observationTimestamp})`);

    if (q.includes('air') || q.includes('aqi') || q.includes('pollut') || q.includes('exercise') || q.includes('outdoor')) {
      if (aqi && aqi.overallAqi !== null) {
        const safeOutdoor = aqi.overallAqi <= 100;
        parts.push(
          `In ${req.location.name}, the ${aqi.isOfficialAqi ? 'official CPCB' : 'modeled indicative'} AQI is ${aqi.overallAqi} (${aqi.aqiCategory}). Dominant pollutant: ${aqi.dominantPollutant?.toUpperCase() ?? 'PM'}. ${safeOutdoor ? 'Conditions are generally suitable for outdoor exercise.' : 'Limit strenuous outdoor exercise and follow AQI precautions.'}`,
        );
        parts.push(aqi.healthAdvisory);
      } else {
        parts.push(
          `Air quality data for ${req.location.name} currently has insufficient pollutant coverage to compute an official AQI.`,
        );
      }
    }

    if (q.includes('rain') || q.includes('umbrella') || q.includes('weather') || q.includes('heat') || q.includes('temp')) {
      if (weather) {
        const rainProb = weather.daily7d[0]?.precipitationProbabilityMaxPct ?? 0;
        const rainSum = weather.daily7d[0]?.precipitationSumMm ?? weather.current.precipitationMm;
        parts.push(
          `Current weather in ${req.location.name}: ${weather.current.temperatureC.toFixed(1)}°C (feels like ${weather.current.feelsLikeC.toFixed(1)}°C), ${weather.current.condition}, humidity ${weather.current.humidityPct}%, wind ${weather.current.windSpeedKmh.toFixed(1)} km/h. Today's rain probability is up to ${rainProb}% (${rainSum.toFixed(1)} mm expected).`,
        );
        if (weather.current.temperatureC >= 37 || (weather.current.heatIndexC ?? 0) >= 40) {
          parts.push(
            'Heat precaution: Drink water regularly, wear light cotton clothing, and avoid midday sun between 12 PM and 4 PM.',
          );
        }
      }
    }

    if (q.includes('waterlog') || q.includes('flood') || q.includes('drain')) {
      const wl = ctx.waterloggingCount ?? 0;
      parts.push(
        wl > 0
          ? `There are ${wl} recent citizen-reported waterlogging or drainage blockage issue(s) near ${req.location.name}. Check the Smart City Map Waterlogging layer before commuting.`
          : `No active citizen waterlogging reports were found near ${req.location.name} in the recent window.`,
      );
      sources.push('SERPENTIS Citizen Reports');
    }

    if (q.includes('problem') || q.includes('issue') || q.includes('hotspot') || q.includes('major')) {
      const hotspots = ctx.topHotspotCategories ?? [];
      if (hotspots.length > 0) {
        const summary = hotspots
          .slice(0, 3)
          .map((h) => `${h.category} (${h.count})`)
          .join(', ');
        parts.push(`Top reported civic/environmental categories nearby: ${summary}.`);
      } else {
        parts.push(`No high-volume report clusters are currently recorded near ${req.location.name}.`);
      }
      sources.push('SERPENTIS Civic & Environmental Reports');
    }

    if (parts.length === 0) {
      parts.push(
        `Summary for ${req.location.name}: Temperature ${weather ? `${weather.current.temperatureC.toFixed(1)}°C (${weather.current.condition})` : 'N/A'}, AQI ${aqi?.overallAqi ?? 'N/A'} (${aqi?.aqiCategory ?? 'Unavailable'}), Active alerts: ${alerts.length}.`,
      );
      if (alerts.length > 0) {
        parts.push(`Active alert: ${alerts[0]!.title}.`);
      }
    }

    return {
      answer: parts.join('\n\n'),
      provider: this.name,
      isAiGenerated: false,
      disclaimer:
        'Generated deterministically from live retrieved environmental and civic data (no external LLM credentials configured).',
      sources: Array.from(new Set(sources)),
      generatedAt: new Date().toISOString(),
    };
  }

  async analyzeEnvironmentalImage(
    _imageUrl: string,
    description?: string,
  ): Promise<AIImageAnalysisResult> {
    const text = (description || '').toLowerCase();
    const detectedIssues: string[] = [];
    let suggestedCategory: string | null = null;

    if (text.includes('smoke') || text.includes('burn') || text.includes('fume')) {
      detectedIssues.push('Possible smoke or open burning');
      suggestedCategory = 'open-burning';
    } else if (text.includes('water') || text.includes('flood') || text.includes('drain')) {
      detectedIssues.push('Possible waterlogging or drainage blockage');
      suggestedCategory = 'waterlogging';
    } else if (text.includes('garbage') || text.includes('dump') || text.includes('waste')) {
      detectedIssues.push('Possible solid waste / garbage accumulation');
      suggestedCategory = 'garbage';
    }

    return {
      detectedIssues:
        detectedIssues.length > 0
          ? detectedIssues
          : ['Manual moderator review required (vision AI provider not configured)'],
      suggestedCategory,
      confidenceNote:
        'External vision AI credentials (OPENAI_API_KEY / GEMINI_API_KEY) are not configured. Automated image classification is unavailable; moderator verification is required.',
      isVerifiedEvidence: false,
      provider: this.name,
      isAiGenerated: false,
    };
  }
}

class OpenAIProvider implements AIProvider {
  public readonly name = 'OpenAI';

  isConfigured(): boolean {
    return (
      process.env.AI_PROVIDER === 'openai' &&
      Boolean(process.env.OPENAI_API_KEY?.trim())
    );
  }

  async answerEnvironmentalQuestion(
    req: AIAssistantRequest,
  ): Promise<AIAssistantResponse> {
    const apiKey = process.env.OPENAI_API_KEY!;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const systemPrompt =
      'You are SERPENTIS City Intelligence Assistant for Indian smart cities. Answer ONLY using the provided retrieved environmental and civic JSON context. Never fabricate readings. Distinguish modeled estimates from official station data. Keep advice practical and concise.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Location: ${req.location.name}, ${req.location.district}, ${req.location.state}\nQuestion: ${req.question}\nRetrieved Data:\n${JSON.stringify(req.contextSnapshot)}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`OpenAI HTTP ${response.status}`);
    }

    const json = (await response.json()) as any;
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty OpenAI response.');

    return {
      answer: content,
      provider: `${this.name} (${model})`,
      isAiGenerated: true,
      disclaimer:
        'AI-generated guidance grounded in SERPENTIS retrieved data. Not medical or official regulatory advice.',
      sources: ['OpenAI', 'SERPENTIS Live Environmental Context'],
      generatedAt: new Date().toISOString(),
    };
  }

  async analyzeEnvironmentalImage(
    imageUrl: string,
    description?: string,
  ): Promise<AIImageAnalysisResult> {
    const apiKey = process.env.OPENAI_API_KEY!;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Classify visible environmental issues (garbage, smoke, waterlogging, pollution, drainage) in JSON with keys detectedIssues (string[]) and suggestedCategory (string|null). User note: ${description || 'none'}`,
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error(`OpenAI Vision HTTP ${response.status}`);
    const json = (await response.json()) as any;
    const text = String(json.choices?.[0]?.message?.content || '');

    return {
      detectedIssues: [text.slice(0, 240)],
      suggestedCategory: null,
      confidenceNote:
        'AI visual assessment is assistive only and does not verify or confirm a complaint.',
      isVerifiedEvidence: false,
      provider: `${this.name} (${model})`,
      isAiGenerated: true,
    };
  }
}

class GeminiAIProvider implements AIProvider {
  public readonly name = 'Google Gemini';

  isConfigured(): boolean {
    return (
      process.env.AI_PROVIDER === 'gemini' &&
      Boolean(process.env.GEMINI_API_KEY?.trim())
    );
  }

  async answerEnvironmentalQuestion(
    req: AIAssistantRequest,
  ): Promise<AIAssistantResponse> {
    const apiKey = process.env.GEMINI_API_KEY!;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const prompt = `You are SERPENTIS City Intelligence Assistant. Answer concisely using ONLY the retrieved data below. Distinguish modeled estimates from official station measurements.\nLocation: ${req.location.name}, ${req.location.state}\nQuestion: ${req.question}\nData: ${JSON.stringify(req.contextSnapshot)}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) throw new Error(`Gemini HTTP ${response.status}`);
    const json = (await response.json()) as any;
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error('Empty Gemini response.');

    return {
      answer: text,
      provider: `${this.name} (${model})`,
      isAiGenerated: true,
      disclaimer:
        'AI-generated guidance grounded in SERPENTIS retrieved data. Not medical or official regulatory advice.',
      sources: ['Google Gemini', 'SERPENTIS Live Environmental Context'],
      generatedAt: new Date().toISOString(),
    };
  }

  async analyzeEnvironmentalImage(
    _imageUrl: string,
    description?: string,
  ): Promise<AIImageAnalysisResult> {
    return new DeterministicFallbackAIProvider().analyzeEnvironmentalImage(
      _imageUrl,
      description,
    );
  }
}

export class CityIntelligenceAIService {
  private readonly openai = new OpenAIProvider();
  private readonly gemini = new GeminiAIProvider();
  private readonly fallback = new DeterministicFallbackAIProvider();

  getActiveProvider(): AIProvider {
    if (this.openai.isConfigured()) return this.openai;
    if (this.gemini.isConfigured()) return this.gemini;
    return this.fallback;
  }

  getProviderStatus() {
    return {
      configuredProvider: process.env.AI_PROVIDER || 'none',
      openaiConfigured: this.openai.isConfigured(),
      geminiConfigured: this.gemini.isConfigured(),
      activeProvider: this.getActiveProvider().name,
    };
  }

  async answerQuestion(
    question: string,
    location: LocationContext,
    weather: WeatherDataResult,
    airQuality: AirQualityDataResult,
    alerts: IEnvironmentalAlert[],
  ): Promise<AIAssistantResponse> {
    let waterloggingCount = 0;
    let topHotspotCategories: Array<{ category: string; count: number }> = [];

    try {
      const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const [wlCount, hotspotAgg] = await Promise.all([
        Report.countDocuments({
          category: { $in: ['waterlogging', 'drainage-blockage'] },
          createdAt: { $gte: since7d },
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [location.longitude, location.latitude] },
              $maxDistance: 15000,
            },
          },
        }),
        Report.aggregate([
          { $match: { createdAt: { $gte: since7d } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 5 },
        ]),
      ]);
      waterloggingCount = wlCount;
      topHotspotCategories = hotspotAgg.map((h) => ({
        category: String(h._id),
        count: Number(h.count),
      }));
    } catch {
      // ignore if DB unavailable
    }

    const contextSnapshot = {
      weather: {
        provider: weather.provider,
        dataType: weather.dataType,
        observationTimestamp: weather.observationTimestamp,
        current: weather.current,
        todayForecast: weather.daily7d[0] ?? null,
      },
      airQuality: {
        provider: airQuality.provider,
        dataType: airQuality.dataType,
        isOfficialAqi: airQuality.isOfficialAqi,
        overallAqi: airQuality.overallAqi,
        aqiCategory: airQuality.aqiCategory,
        dominantPollutant: airQuality.dominantPollutant,
        healthAdvisory: airQuality.healthAdvisory,
        observationTimestamp: airQuality.observationTimestamp,
      },
      alerts: alerts.map((a) => ({ title: a.title, severity: a.severity, category: a.category })),
      waterloggingCount,
      topHotspotCategories,
    };

    const provider = this.getActiveProvider();
    try {
      return await provider.answerEnvironmentalQuestion({
        question,
        location,
        contextSnapshot,
      });
    } catch {
      return this.fallback.answerEnvironmentalQuestion({
        question,
        location,
        contextSnapshot,
      });
    }
  }

  async detectPatternsAndSummarize(
    location: LocationContext,
    weather: WeatherDataResult,
    airQuality: AirQualityDataResult,
    alerts: IEnvironmentalAlert[],
  ) {
    let recurringHotspots: Array<{ category: string; count: number; unresolved: number }> = [];
    try {
      const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const agg = await Report.aggregate([
        { $match: { createdAt: { $gte: since30d } } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            unresolved: { $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] } },
          },
        },
        { $match: { count: { $gte: 2 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]);
      recurringHotspots = agg.map((r) => ({
        category: String(r._id),
        count: Number(r.count),
        unresolved: Number(r.unresolved),
      }));
    } catch {
      recurringHotspots = [];
    }

    const dailySummary = `${location.name} (${location.district}, ${location.state}): Currently ${weather.current.temperatureC.toFixed(1)}°C with ${weather.current.condition.toLowerCase()} and ${weather.current.humidityPct}% humidity. Air quality is ${airQuality.overallAqi !== null ? `${airQuality.overallAqi} (${airQuality.aqiCategory})` : 'unavailable'}. ${alerts.length} active advisory alert(s).`;

    return {
      location,
      generatedAt: new Date().toISOString(),
      dailySummary,
      patterns: {
        recurringHotspots,
        predictiveStatus: 'experimental-inactive',
        predictiveNote:
          'Experimental forecasting models remain inactive until sufficient multi-week validated local station training data is accumulated.',
      },
      sources: [
        { name: weather.provider, timestamp: weather.observationTimestamp, dataType: weather.dataType },
        { name: airQuality.provider, timestamp: airQuality.observationTimestamp, dataType: airQuality.dataType },
      ],
    };
  }

  async analyzeImage(imageUrl: string, description?: string) {
    const provider = this.getActiveProvider();
    try {
      return await provider.analyzeEnvironmentalImage(imageUrl, description);
    } catch {
      return this.fallback.analyzeEnvironmentalImage(imageUrl, description);
    }
  }
}

export const cityIntelligenceAIService = new CityIntelligenceAIService();
