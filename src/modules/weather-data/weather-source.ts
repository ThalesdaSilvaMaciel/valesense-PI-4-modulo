import { env } from "../../config/env.js";
import { listWeatherData, type WeatherDataEntry } from "./weather-data.mock.js";

export type WeatherSourceName = "mock" | "thingspeak";

export type WeatherReadings = {
  data: WeatherDataEntry[];
  source: WeatherSourceName;
};

export async function getWeatherReadings(horas: number): Promise<WeatherReadings> {
  if (env.WEATHER_SOURCE === "thingspeak") {
    throw new Error("Integração com o ThingSpeak ainda não implementada.");
  }
  return { data: listWeatherData(horas), source: "mock" };
}
