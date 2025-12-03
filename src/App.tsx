import type { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePriceFeed, useRafUpdates } from "./common/hooks";
import type { PriceRow } from "./common/types";
import ControlBar from "./components/ControlBar/ControlBar";
import LogPanel from "./components/LogPanel/LogPanel";
import TradingGrid from "./components/TradingGrid/TradingGrid";

import "./App.css";

export default function App() {
  const LOG_MAX_ENTRIES = 75;
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [fps, setFps] = useState(20);
  const [debug, setDebug] = useState(false);
  const wsLogsRef = useRef<string[]>([]);
  const gridLogsRef = useRef<string[]>([]);
  const gridApiRef = useRef<AgGridReact<PriceRow> | null>(null);

  const addWsLog = useCallback((message: string) => {
    wsLogsRef.current = [...wsLogsRef.current, message].slice(-LOG_MAX_ENTRIES);
  }, []);

  const addGridLog = useCallback((message: string) => {
    gridLogsRef.current = [...gridLogsRef.current, message].slice(
      -LOG_MAX_ENTRIES,
    );
  }, []);

  const clearFilters = useCallback(() => {
    const api = gridApiRef.current?.api;
    if (api) {
      api.setFilterModel(null);
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const { pricingData, isConnected, toggleConnection } = usePriceFeed(
    debug,
    addWsLog,
  );

  const batchedPricingData = useRafUpdates(pricingData, fps, debug, addGridLog);

  console.log("App render");

  return (
    <div className="container" data-theme={isDarkMode ? "dark" : "light"}>
      <h2>Real Time AG Grid/RAF Demo</h2>
      <div style={{ display: "inline-block" }}>
        <ControlBar
          isConnected={isConnected}
          isDarkMode={isDarkMode}
          debug={debug}
          fps={fps}
          onToggleConnection={toggleConnection}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
          onToggleDebug={() => setDebug((prev) => !prev)}
          onFpsChange={setFps}
          onClearFilters={clearFilters}
        />
        <div style={{ display: "flex" }}>
          <TradingGrid
            batchedPricingData={batchedPricingData}
            isDarkMode={isDarkMode}
            debug={debug}
            gridApiRef={gridApiRef}
            onLog={addGridLog}
          />
          {debug && (
            <LogPanel
              wsLogsRef={wsLogsRef}
              gridLogsRef={gridLogsRef}
              isDarkMode={isDarkMode}
              maxEntries={LOG_MAX_ENTRIES}
            />
          )}
        </div>
      </div>
    </div>
  );
}
