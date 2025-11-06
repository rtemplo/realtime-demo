import { WebSocketServer } from "ws";
import { tickerData } from "../public/fakeData";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

console.log(`WebSocket server running on ws://localhost:${PORT}`);

// Mock symbols
const symbols = tickerData.map((t) => t.id);
const basePrices = tickerData.reduce<Record<string, number>>((acc, t) => {
  acc[t.id] = t.basePrice;
  return acc;
}, {});

function generatePriceUpdate(symbol: string) {
  const basePrice = basePrices[symbol] || 100;
  const variance = basePrice * 0.01; // 1% variance

  return {
    id: symbol,
    symbol: symbol,
    bid: +(basePrice - Math.random() * variance).toFixed(2),
    ask: +(basePrice + Math.random() * variance).toFixed(2),
    last: +(basePrice + (Math.random() - 0.5) * variance).toFixed(2),
  };
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  const interval = setInterval(() => {
    const numUpdates = Math.floor(Math.random() * 6) + 3;
    const symbolsToUpdate = symbols
      .sort(() => Math.random() - 0.5)
      .slice(0, numUpdates);

    symbolsToUpdate.forEach((symbol) => {
      const update = generatePriceUpdate(symbol);
      ws.send(JSON.stringify(update));
    });
  }, 100);

  ws.on("close", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    clearInterval(interval);
  });
});
