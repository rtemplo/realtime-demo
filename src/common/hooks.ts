import { useCallback, useEffect, useRef, useState } from "react";
import type { PriceUpdate } from "./types";

export function usePriceFeed() {
  const latestRef = useRef<Record<string, PriceUpdate>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(true);

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
      console.log("WebSocket connected");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const update: PriceUpdate = JSON.parse(event.data);
      console.log("Received update:", update);

      latestRef.current[update.id] = {
        ...(latestRef.current[update.id] || {}),
        ...update,
      };
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
      wsRef.current = null;
      setIsConnected(false);
    };
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();
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
  }, [shouldConnect, connect, disconnect]);

  const toggleConnection = useCallback(() => {
    setShouldConnect((prev) => !prev);
  }, []);

  return { latestRef, isConnected, toggleConnection };
}

export function useRafUpdates(
  latestRef: React.RefObject<Record<string, PriceUpdate>>,
  fps: number = 60,
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

      const current = latestRef.current;
      if (!current) return;

      const keys = Object.keys(current);
      if (keys.length) {
        const arr = keys.map((k) => current[k]);
        console.log("Sending batch update:", arr);
        latestRef.current = {};
        setBatch(arr);
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [fps, latestRef]);

  return batch;
}
