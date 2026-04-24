export const calculateBiteIndex = ({ temperature, pressure, windSpeed, cloudCover, hour }) => {
  let score = 50;

  if (temperature >= 8 && temperature <= 18) score += 12;
  else if (temperature > 18 && temperature <= 26) score += 6;
  else score -= 8;

  if (pressure >= 1008 && pressure <= 1022) score += 10;
  else score -= 6;

  if (windSpeed >= 5 && windSpeed <= 18) score += 8;
  else if (windSpeed > 25) score -= 10;

  if (cloudCover >= 20 && cloudCover <= 75) score += 8;
  else if (cloudCover > 90) score -= 4;

  if ((hour >= 5 && hour <= 8) || (hour >= 18 && hour <= 21)) score += 15;
  if (hour >= 11 && hour <= 15) score -= 6;

  score = Math.max(0, Math.min(100, Math.round(score)));

  const level = score >= 80 ? 'excellent' : score >= 65 ? 'good' : score >= 45 ? 'moderate' : 'poor';

  const recommendation =
    score >= 80
      ? 'Sehr gute Bedingungen. Flache Bereiche, Schilfkanten und aktive Köder testen.'
      : score >= 65
        ? 'Gute Bedingungen. Ufernahe Struktur, Gummiköder oder Spinner versuchen.'
        : score >= 45
          ? 'Durchschnittliche Bedingungen. Langsamer führen und Spotwechsel einplanen.'
          : 'Schwierige Bedingungen. Tiefer fischen, langsam präsentieren und kleinere Köder wählen.';

  return { score, level, recommendation };
};
