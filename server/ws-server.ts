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

// Function to generate random price updatesS
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

  // Randomly send 3 to 8 price updates every 100ms
  const interval = setInterval(() => {
    // Randomly select 3 to 8 symbols to update
    const numUpdates = Math.floor(Math.random() * 6) + 3;

    const symbolsToUpdate = symbols
      .sort(() => Math.random() - 0.5) // 50/50 negative vs positive chance to shuffle
      .slice(0, numUpdates); // Take first N symbols after shuffle

    // Get price updates for symbols and send to client
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
