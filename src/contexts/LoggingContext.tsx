import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

interface LoggingContextValue {
  wsLogs: string[];
  gridLogs: string[];
  addWsLog: (message: string) => void;
  addGridLog: (message: string) => void;
}

const LoggingContext = createContext<LoggingContextValue | null>(null);

interface LoggingProviderProps {
  children: React.ReactNode;
  maxEntries?: number;
}

export function LoggingProvider({
  children,
  maxEntries = 75,
}: LoggingProviderProps) {
  const [wsLogs, setWsLogs] = useState<string[]>([]);
  const [gridLogs, setGridLogs] = useState<string[]>([]);

  const addWsLog = useCallback(
    (message: string) => {
      setWsLogs((prev) => [...prev, message].slice(-maxEntries));
    },
    [maxEntries],
  );

  const addGridLog = useCallback(
    (message: string) => {
      setGridLogs((prev) => [...prev, message].slice(-maxEntries));
    },
    [maxEntries],
  );

  const value: LoggingContextValue = {
    wsLogs,
    gridLogs,
    addWsLog,
    addGridLog,
  };

  return (
    <LoggingContext.Provider value={value}>{children}</LoggingContext.Provider>
  );
}

export function useLogging() {
  const context = useContext(LoggingContext);
  if (!context) {
    throw new Error("useLogging must be used within a LoggingProvider");
  }
  return context;
}
