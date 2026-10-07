export type MarketDataEntry = {
  id: string;
  produto: string;
  preco: number;
  moeda: "BRL";
  demanda: "baixa" | "media" | "alta";
  data: string;
};

const PRODUTOS = ["Uva"] as const;
const DEMANDAS: MarketDataEntry["demanda"][] = ["baixa", "media", "alta"];
const PRECO_BASE: Record<(typeof PRODUTOS)[number], number> = { Uva: 9.8 };

function dayVariation(productIndex: number, dayIndex: number) {
  return (((productIndex * 5 + dayIndex * 3) % 7) - 3) * 0.15;
}

export function listMarketData(days = 7): MarketDataEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const entries: MarketDataEntry[] = [];

  PRODUTOS.forEach((produto, productIndex) => {
    for (let dayIndex = days - 1; dayIndex >= 0; dayIndex--) {
      const date = new Date(today);
      date.setDate(today.getDate() - dayIndex);
      const dateString = date.toISOString().slice(0, 10);
      entries.push({
        id: `${produto.toLowerCase()}-${dateString}`,
        produto,
        preco: Number((PRECO_BASE[produto] + dayVariation(productIndex, dayIndex)).toFixed(2)),
        moeda: "BRL",
        demanda: DEMANDAS[(productIndex + dayIndex) % DEMANDAS.length],
        data: dateString,
      });
    }
  });
  return entries;
}
