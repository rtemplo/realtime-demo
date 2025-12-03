import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PriceUpdate } from "../common/types";
import { useLogging } from "./LoggingContext";

interface PriceFeedContextValue {
  pricingData: React.RefObject<Record<string, PriceUpdate>>;
  isConnected: boolean;
  toggleConnection: () => void;
}

const PriceFeedContext = createContext<PriceFeedContextValue | null>(null);

interface PriceFeedProviderProps {
  children: React.ReactNode;
  debug?: boolean;
}

export function PriceFeedProvider({
  children,
  debug = false,
}: PriceFeedProviderProps) {
  const { addWsLog } = useLogging();
  const pricingData = useRef<Record<string, PriceUpdate>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [shouldConnect, setShouldConnect] = useState(true);
  const debugRef = useRef(debug);
  const addWsLogRef = useRef(addWsLog);

  useEffect(() => {
    debugRef.current = debug;
    addWsLogRef.current = addWsLog;
  }, [debug, addWsLog]);

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
      if (debugRef.current) addWsLogRef.current("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const update: PriceUpdate = JSON.parse(event.data);
      if (debugRef.current)
        addWsLogRef.current(`Received update: ${JSON.stringify(update)}`);

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
      if (debugRef.current) addWsLogRef.current("WebSocket closed");
    };
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.close();

      if (debugRef.current) addWsLogRef.current("WebSocket disconnected");
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

  const value: PriceFeedContextValue = {
    pricingData,
    isConnected,
    toggleConnection,
  };

  return (
    <PriceFeedContext.Provider value={value}>
      {children}
    </PriceFeedContext.Provider>
  );
}

export function usePriceFeed() {
  const context = useContext(PriceFeedContext);
  if (!context) {
    throw new Error("usePriceFeed must be used within a PriceFeedProvider");
  }
  return context;
}
