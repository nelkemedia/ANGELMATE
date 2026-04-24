import { GoogleGenerativeAI } from '@google/generative-ai';
import { catchAsync } from '../utils/catch-async.js';
import { AppError } from '../utils/app-error.js';

function getModel() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new AppError('GEMINI_API_KEY nicht konfiguriert. Bitte in .env eintragen.', 503);
  const genAI = new GoogleGenerativeAI(key);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
}

export const identifyFish = catchAsync(async (req, res) => {
  const { imageBase64, mimeType = 'image/jpeg' } = req.body;
  if (!imageBase64) throw new AppError('imageBase64 fehlt im Request-Body.', 400);

  const model = getModel();

  let result;
  try {
    result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType } },
      `Du bist ein Experte für Süß- und Salzwasserfische in Mitteleuropa.
Analysiere das Bild und antworte ausschließlich als JSON-Objekt (kein Markdown, kein Text davor/danach):
{
  "species": "Deutscher Artname",
  "speciesLatin": "Lateinischer Name",
  "confidence": "hoch|mittel|niedrig",
  "weightRange": "typisches Gewicht, z.B. 0.5–3 kg",
  "lengthRange": "typische Länge, z.B. 30–60 cm",
  "habitat": "Lebensraum in einem Satz",
  "fishingTip": "Kurzer Anglertipp auf Deutsch (max. 2 Sätze)",
  "isFish": true
}
Falls kein Fisch erkennbar ist, gib { "isFish": false, "species": null } zurück.`
    ]);
  } catch (err) {
    const msg = err?.message ?? '';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return res.status(429).json({ message: 'AI_QUOTA_EXCEEDED' });
    }
    if (msg.includes('API_KEY') || msg.includes('403') || msg.includes('API key')) {
      return res.status(503).json({ message: 'AI_KEY_INVALID' });
    }
    throw err;
  }

  const text = result.response.text().trim();
  let parsed;
  try {
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    parsed = JSON.parse(clean);
  } catch {
    parsed = { isFish: false, raw: text };
  }

  res.json(parsed);
});

export const analyzeForecast = catchAsync(async (req, res) => {
  const { weather, location } = req.body;
  if (!weather) throw new AppError('weather-Objekt fehlt im Request-Body.', 400);

  const { temperature, pressure, windSpeed, cloudCover, humidity, uvIndex, weatherCode } = weather;
  const now = new Date();
  const hour = now.getHours();
  const month = now.getMonth() + 1;

  const model = getModel();

  const prompt = `Du bist ein erfahrener Angler und Fischereibiologe. Analysiere die aktuellen Bedingungen und bewerte die Angelchancen.

Aktuelle Wetterdaten:
- Temperatur: ${temperature}°C
- Luftdruck: ${pressure} hPa
- Windgeschwindigkeit: ${windSpeed} km/h
- Bewölkung: ${cloudCover}%
${humidity !== undefined ? `- Luftfeuchtigkeit: ${humidity}%` : ''}
${uvIndex !== undefined ? `- UV-Index: ${uvIndex}` : ''}
- Tageszeit: ${hour}:00 Uhr
- Monat: ${month} (${getMonthName(month)})
${location ? `- Region: ${location}` : ''}

Antworte ausschließlich als JSON (kein Markdown, kein Text davor/danach):
{
  "biteIndex": <Zahl 0-100>,
  "level": "excellent|good|moderate|poor",
  "headline": "Kurze prägnante Überschrift (max. 8 Wörter)",
  "recommendation": "Ausführliche Empfehlung für den Angler (3-4 Sätze auf Deutsch). Was sollte er/sie beachten? Welche Köder empfiehlt sich?",
  "bestSpecies": ["Fischart1", "Fischart2", "Fischart3"],
  "bestTimeWindow": "z.B. 05:30–08:30 und 19:00–21:00 Uhr",
  "bestBait": "Empfohlener Köder für heute",
  "weatherSummary": "Kurze Wettereinschätzung für Angler (1 Satz)"
}`;

  let result;
  try {
    result = await model.generateContent(prompt);
  } catch (err) {
    const msg = err?.message ?? '';
    if (msg.includes('429') || msg.includes('quota') || msg.includes('Too Many Requests')) {
      return res.status(429).json({ message: 'AI_QUOTA_EXCEEDED' });
    }
    if (msg.includes('API_KEY') || msg.includes('API key') || msg.includes('403') || msg.includes('400')) {
      return res.status(503).json({ message: 'AI_KEY_INVALID' });
    }
    if (msg.includes('404') || msg.includes('not found')) {
      return res.status(503).json({ message: 'AI_MODEL_UNAVAILABLE' });
    }
    throw err;
  }
  const text = result.response.text().trim();

  let parsed;
  try {
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    parsed = JSON.parse(clean);
  } catch {
    parsed = {
      biteIndex: 50, level: 'moderate',
      headline: 'KI-Analyse nicht verfügbar',
      recommendation: text,
      bestSpecies: [], bestTimeWindow: '–', bestBait: '–', weatherSummary: '–'
    };
  }

  res.json(parsed);
});

function getMonthName(m) {
  return ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'][m - 1];
}
