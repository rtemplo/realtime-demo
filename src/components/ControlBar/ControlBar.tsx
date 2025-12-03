import type React from "react";
import styles from "./ControlBar.module.css";

interface ControlBarProps {
  isConnected: boolean;
  isDarkMode: boolean;
  debug: boolean;
  fps: number;
  onToggleConnection: () => void;
  onToggleDarkMode: () => void;
  onToggleDebug: () => void;
  onFpsChange: (fps: number) => void;
  onClearFilters: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isConnected,
  isDarkMode,
  debug,
  fps,
  onToggleConnection,
  onToggleDarkMode,
  onToggleDebug,
  onFpsChange,
  onClearFilters,
}) => {
  return (
    <div className={styles.buttonBar}>
      <button
        type="button"
        onClick={onToggleConnection}
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
