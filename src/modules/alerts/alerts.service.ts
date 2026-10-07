import type { WeatherDataEntry } from "../weather-data/weather-data.mock.js";
import { getWeatherReadings, type WeatherSourceName } from "../weather-data/weather-source.js";

const TEMPERATURA_MIN_IDEAL = 26;
const TEMPERATURA_MAX_IDEAL = 28;
const UMIDADE_MIN_IDEAL = 55;
const UMIDADE_MAX_IDEAL = 65;

export type AlertTipo =
  | "temperatura_alta"
  | "temperatura_baixa"
  | "umidade_alta"
  | "umidade_baixa"
  | "condicao_ideal";

export type AlertNivel = "informativo" | "atencao";

export type WeatherAlert = {
  id: string;
  tipo: AlertTipo;
  nivel: AlertNivel;
  mensagem: string;
  temperatura: number;
  umidade: number;
  timestamp: string;
};

function evaluateReading(entry: WeatherDataEntry): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const base = {
    temperatura: entry.temperatura,
    umidade: entry.umidade,
    timestamp: entry.timestamp,
  };

  if (entry.temperatura > TEMPERATURA_MAX_IDEAL) {
    alerts.push({
      id: `${entry.id}-temp-alta`,
      tipo: "temperatura_alta",
      nivel: "atencao",
      mensagem: `Temperatura de ${entry.temperatura}°C acima da faixa ideal (até ${TEMPERATURA_MAX_IDEAL}°C).`,
      ...base,
    });
  } else if (entry.temperatura < TEMPERATURA_MIN_IDEAL) {
    alerts.push({
      id: `${entry.id}-temp-baixa`,
      tipo: "temperatura_baixa",
      nivel: "atencao",
      mensagem: `Temperatura de ${entry.temperatura}°C abaixo da faixa ideal (a partir de ${TEMPERATURA_MIN_IDEAL}°C).`,
      ...base,
    });
  }

  if (entry.umidade > UMIDADE_MAX_IDEAL) {
    alerts.push({
      id: `${entry.id}-umid-alta`,
      tipo: "umidade_alta",
      nivel: "atencao",
      mensagem: `Umidade de ${entry.umidade}% acima do ideal (até ${UMIDADE_MAX_IDEAL}%) — risco de fungos/doenças.`,
      ...base,
    });
  } else if (entry.umidade < UMIDADE_MIN_IDEAL) {
    alerts.push({
      id: `${entry.id}-umid-baixa`,
      tipo: "umidade_baixa",
      nivel: "atencao",
      mensagem: `Umidade de ${entry.umidade}% abaixo do ideal (a partir de ${UMIDADE_MIN_IDEAL}%) — risco de estresse hídrico.`,
      ...base,
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: `${entry.id}-ideal`,
      tipo: "condicao_ideal",
      nivel: "informativo",
      mensagem: "Temperatura e umidade dentro da faixa ideal para colheita/exportação.",
      ...base,
    });
  }

  return alerts;
}

export type AlertsResponse = {
  atual: WeatherAlert[];
  historico: WeatherAlert[];
  source: WeatherSourceName;
};

export async function buildAlerts(horas: number): Promise<AlertsResponse> {
  const readings = await getWeatherReadings(horas);
  const series = readings.data;
  const historico = series.flatMap(evaluateReading);
  const ultimaLeitura = series.at(-1);
  const atual = ultimaLeitura ? evaluateReading(ultimaLeitura) : [];

  return { atual, historico, source: readings.source };
}
