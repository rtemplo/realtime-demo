import type { AgGridReact } from "ag-grid-react";
import { useCallback, useRef, useState } from "react";
import type { PriceRow } from "./common/types";
import ControlBar from "./components/ControlBar/ControlBar";
import LogPanel from "./components/LogPanel/LogPanel";
import TradingGrid from "./components/TradingGrid/TradingGrid";
import { LoggingProvider } from "./contexts/LoggingContext";
import { PriceFeedProvider } from "./contexts/PriceFeedContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";

import "./App.css";

export default function App() {
  const [debug, setDebug] = useState(false);

  console.log("App render");

  return (
    <ThemeProvider>
      <LoggingProvider maxEntries={100}>
        <PriceFeedProvider debug={debug}>
          <AppContent debug={debug} onDebugChange={setDebug} />
        </PriceFeedProvider>
      </LoggingProvider>
    </ThemeProvider>
  );
}

function AppContent({
  debug,
  onDebugChange,
}: {
  debug: boolean;
  onDebugChange: (debug: boolean) => void;
}) {
  const { isDarkMode } = useTheme();
  const [fps, setFps] = useState(20);
  const gridApiRef = useRef<AgGridReact<PriceRow> | null>(null);

  const clearFilters = useCallback(() => {
    const api = gridApiRef.current?.api;
    if (api) {
      api.setFilterModel(null);
    }
  }, []);

  return (
    <div className="container" data-theme={isDarkMode ? "dark" : "light"}>
      <h2>Real Time AG Grid/RAF Demo</h2>
      <div style={{ display: "inline-block" }}>
        <ControlBar
          debug={debug}
          fps={fps}
          onToggleDebug={() => onDebugChange(!debug)}
          onFpsChange={setFps}
          onClearFilters={clearFilters}
        />
        <div style={{ display: "flex" }}>
          <TradingGrid debug={debug} fps={fps} gridApiRef={gridApiRef} />
          {debug && <LogPanel />}
        </div>
      </div>
    </div>
  );
}
