import type { AgGridReact } from "ag-grid-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PriceRow } from "./common/types";
import ControlBar from "./components/ControlBar/ControlBar";
import LogPanel from "./components/LogPanel/LogPanel";
import TradingGrid from "./components/TradingGrid/TradingGrid";
import { LoggingProvider } from "./contexts/LoggingContext";
import { PriceFeedProvider } from "./contexts/PriceFeedContext";

import "./App.css";

export default function App() {
  const [debug, setDebug] = useState(false);

  return (
    <LoggingProvider maxEntries={75}>
      <PriceFeedProvider debug={debug}>
        <AppContent debug={debug} onDebugChange={setDebug} />
      </PriceFeedProvider>
    </LoggingProvider>
  );
}

function AppContent({
  debug,
  onDebugChange,
}: {
  debug: boolean;
  onDebugChange: (debug: boolean) => void;
}) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [fps, setFps] = useState(20);
  const gridApiRef = useRef<AgGridReact<PriceRow> | null>(null);

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

  console.log("App render");

  return (
    <div className="container" data-theme={isDarkMode ? "dark" : "light"}>
      <h2>Real Time AG Grid/RAF Demo</h2>
      <div style={{ display: "inline-block" }}>
        <ControlBar
          isDarkMode={isDarkMode}
          debug={debug}
          fps={fps}
          onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
          onToggleDebug={() => onDebugChange(!debug)}
          onFpsChange={setFps}
          onClearFilters={clearFilters}
        />
        <div style={{ display: "flex" }}>
          <TradingGrid
            isDarkMode={isDarkMode}
            debug={debug}
            fps={fps}
            gridApiRef={gridApiRef}
          />
          {debug && <LogPanel isDarkMode={isDarkMode} maxEntries={75} />}
        </div>
      </div>
    </div>
  );
}
