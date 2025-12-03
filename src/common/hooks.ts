import { useCallback, useEffect, useRef, useState } from "react";
import type { PriceUpdate } from "./types";

export function usePriceFeed(debug = false, onLog?: (message: string) => void) {
  const pricingData = useRef<Record<string, PriceUpdate>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(true);
  const debugRef = useRef(debug);
  const onLogRef = useRef(onLog);

  useEffect(() => {
    debugRef.current = debug;
    onLogRef.current = onLog;
  }, [debug, onLog]);

  const connect = useCallback(() => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    const ws = new WebSocket("ws://localhost:8080/rtt");
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      if (debugRef.current && onLogRef.current)
        onLogRef.current("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const update: PriceUpdate = JSON.parse(event.data);
      // console.log(update);
      if (debugRef.current && onLogRef.current)
        onLogRef.current(`Received update: ${JSON.stringify(update)}`);

      pricingData.current[update.id] = {
        ...(pricingData.current[update.id] || {}),
        ...update,
      };
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      wsRef.current = null;
      setIsConnected(false);
      if (debugRef.current && onLogRef.current)
        onLogRef.current("WebSocket closed");
    };
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();

      if (debugRef.current && onLogRef.current)
        onLogRef.current("WebSocket disconnected");
    }
  }, []);

  useEffect(() => {
    if (shouldConnect) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [disconnect, connect, shouldConnect]);

  const toggleConnection = useCallback(() => {
    setShouldConnect((prev) => !prev);
  }, []);

  return { pricingData, isConnected, toggleConnection };
}

export function useRafUpdates(
  pricingData: React.RefObject<Record<string, PriceUpdate>>,
  fps: number = 60,
  debug = false,
  onLog?: (message: string) => void,
) {
  const [batch, setBatch] = useState<PriceUpdate[]>([]);

  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    const frameInterval = 1000 / fps;

    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop);

      if (time - lastTime < frameInterval) return;
      lastTime = time;

      const current = pricingData.current;
      if (!current) return;

      const keys = Object.keys(current);
      if (keys.length) {
        const arr = keys.map((k) => current[k]);
        pricingData.current = {};
        setBatch(arr);

        if (debug && onLog) onLog(`Sending batch update: ${arr.length} items`);
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [fps, pricingData, onLog, debug]);

  return batch;
}
