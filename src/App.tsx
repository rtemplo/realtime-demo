import { useEffect, useState } from "react";
import { usePriceFeed, useRafUpdates } from "./common/hooks";
import TradingGrid from "./components/TradingGrid/TradingGrid";

import "./App.css";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  const [fps, setFps] = useState(20);
  const debug = false;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const { latestRef, isConnected, toggleConnection } = usePriceFeed(debug);
  const updates = useRafUpdates(latestRef, fps, debug);

  return (
    <div className="container" data-theme={isDarkMode ? "dark" : "light"}>
      <h2>Real Time AG Grid/RAF Demo</h2>
      <TradingGrid
        updates={updates}
        isConnected={isConnected}
        onToggleConnection={toggleConnection}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
        fps={fps}
        onFpsChange={setFps}
        debug={debug}
      />
    </div>
  );
}
