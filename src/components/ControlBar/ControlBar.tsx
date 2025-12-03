import type React from "react";
import { usePriceFeed } from "../../contexts/PriceFeedContext";
import styles from "./ControlBar.module.css";

interface ControlBarProps {
  isDarkMode: boolean;
  debug: boolean;
  fps: number;
  onToggleDarkMode: () => void;
  onToggleDebug: () => void;
  onFpsChange: (fps: number) => void;
  onClearFilters: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isDarkMode,
  debug,
  fps,
  onToggleDarkMode,
  onToggleDebug,
  onFpsChange,
  onClearFilters,
}) => {
  const { isConnected, toggleConnection } = usePriceFeed();
  return (
    <div className={styles.buttonBar}>
      <button
        type="button"
        onClick={toggleConnection}
        className={styles.connectButton}
        style={{
          backgroundColor: isConnected ? "#ff4444" : "#44ff44",
        }}
      >
        {isConnected ? "⏸ Stop" : "▶ Play"}
      </button>
      <button
        type="button"
        onClick={onClearFilters}
        className={styles.clearButton}
      >
        Clear All Filters
      </button>
      <button
        type="button"
        onClick={onToggleDarkMode}
        className={styles.themeButton}
      >
        {isDarkMode ? "☀️ Light" : "🌙 Dark"}
      </button>
      <button
        type="button"
        onClick={onToggleDebug}
        className={styles.debugButton}
      >
        {debug ? "🐛 Debug Off" : "🐛 Debug On"}
      </button>
      <div className={styles.fpsControl}>
        <label htmlFor="fps-slider">FPS: {fps}</label>
        <input
          id="fps-slider"
          type="range"
          min="1"
          max="60"
          value={fps}
          onChange={(e) => onFpsChange(Number(e.target.value))}
          className={styles.fpsSlider}
        />
      </div>
    </div>
  );
};

export default ControlBar;
