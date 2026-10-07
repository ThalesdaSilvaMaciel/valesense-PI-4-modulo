import { listMarketData, type MarketDataEntry } from "../market-data/market-data.mock.js";
import type { WeatherDataEntry } from "../weather-data/weather-data.mock.js";
import { getWeatherReadings, type WeatherSourceName } from "../weather-data/weather-source.js";

export type MarketProductSummary = {
  produto: string;
  precoAtual: number;
  precoMedio: number;
  demandaAtual: MarketDataEntry["demanda"];
};

export type DashboardResponse = {
  clima: {
    atual: WeatherDataEntry | null;
    mediaTemperatura: number;
    mediaUmidade: number;
    serie: WeatherDataEntry[];
  };
  mercado: {
    porProduto: MarketProductSummary[];
    serie: MarketDataEntry[];
  };
  source: "mock" | "mixed";
  fontes: {
    clima: WeatherSourceName;
    mercado: "mock";
  };
  geradoEm: string;
};

function average(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((total, value) => total + value, 0);
  return Number((sum / values.length).toFixed(2));
}

function summarizeMarketByProduct(entries: MarketDataEntry[]): MarketProductSummary[] {
  const produtos = [...new Set(entries.map((entry) => entry.produto))];

  return produtos.map((produto) => {
    const entriesDoProduto = entries.filter((entry) => entry.produto === produto);
    const maisRecente = entriesDoProduto[entriesDoProduto.length - 1];

    return {
      produto,
      precoAtual: maisRecente.preco,
      precoMedio: average(entriesDoProduto.map((entry) => entry.preco)),
      demandaAtual: maisRecente.demanda,
    };
  });
}

export async function buildDashboard(dias: number, horas: number): Promise<DashboardResponse> {
  const weatherReadings = await getWeatherReadings(horas);
  const weatherSeries = weatherReadings.data;
  const marketSeries = listMarketData(dias);

  return {
    clima: {
      atual: weatherSeries.at(-1) ?? null,
      mediaTemperatura: average(weatherSeries.map((entry) => entry.temperatura)),
      mediaUmidade: average(weatherSeries.map((entry) => entry.umidade)),
      serie: weatherSeries,
    },
    mercado: {
      porProduto: summarizeMarketByProduct(marketSeries),
      serie: marketSeries,
    },
    source: weatherReadings.source === "mock" ? "mock" : "mixed",
    fontes: {
      clima: weatherReadings.source,
      mercado: "mock",
    },
    geradoEm: new Date().toISOString(),
  };
}
