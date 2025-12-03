import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

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
  maxEntries = 100,
}: LoggingProviderProps) {
  const [wsLogs, setWsLogs] = useState<string[]>([]);
  const [gridLogs, setGridLogs] = useState<string[]>([]);
  const cappedMaxEntries = Math.min(maxEntries, 250);
  const maxEntriesRef = useRef(cappedMaxEntries);

  maxEntriesRef.current = cappedMaxEntries;

  const addWsLog = useCallback((message: string) => {
    setWsLogs((prev) => {
      const maxLen = maxEntriesRef.current;
      if (prev.length < maxLen) {
        return [...prev, message];
      }
      return [...prev.slice(1), message];
    });
  }, []);

  const addGridLog = useCallback((message: string) => {
    setGridLogs((prev) => {
      const maxLen = maxEntriesRef.current;
      if (prev.length < maxLen) {
        return [...prev, message];
      }
      return [...prev.slice(1), message];
    });
  }, []);

  const value: LoggingContextValue = useMemo(
    () => ({
      wsLogs,
      gridLogs,
      addWsLog,
      addGridLog,
    }),
    [wsLogs, gridLogs, addWsLog, addGridLog],
  );

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
