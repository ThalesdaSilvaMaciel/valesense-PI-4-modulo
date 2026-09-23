export type WeatherDataEntry = {
  id: string;
  temperatura: number;
  umidade: number;
  timestamp: string;
};

function temperatureVariation(index: number) {
  return (((index * 13) % 17) - 8) * 0.18;
}

function humidityVariation(index: number) {
  return ((index * 11) % 19) - 9;
}
export function listWeatherData(hours = 24): WeatherDataEntry[] {
  const entries: WeatherDataEntry[] = [];
  const currentHour = new Date();
  currentHour.setMinutes(0, 0, 0);
  const firstTimestamp = currentHour.getTime() - (hours - 1) * 60 * 60 * 1000;

  for (let index = 0; index < hours; index++) {
    const timestamp = new Date(firstTimestamp + index * 60 * 60 * 1000).toISOString();
    entries.push({
      id: `weather-${index + 1}`,
      temperatura: Number((27 + temperatureVariation(index)).toFixed(1)),
      umidade: 62 + humidityVariation(index),
      timestamp,
    });
  }

  return entries;
}
