import type React from "react";
import { usePriceFeed } from "../../contexts/PriceFeedContext";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./ControlBar.module.css";

interface ControlBarProps {
  debug: boolean;
  fps: number;
  onToggleDebug: () => void;
  onFpsChange: (fps: number) => void;
  onClearFilters: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  debug,
  fps,
  onToggleDebug,
  onFpsChange,
  onClearFilters,
}) => {
  const { isConnected, toggleConnection } = usePriceFeed();
  const { isDarkMode, toggleDarkMode } = useTheme();
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
        onClick={toggleDarkMode}
        className={styles.themeButton}
      >
        {isDarkMode ? "☀️ Light" : "🌙 Dark"}
      </button>
      <div className={styles.fpsControl}>
        <label htmlFor="debug-checkbox">
          <input
            id="debug-checkbox"
            type="checkbox"
            checked={debug}
            onChange={onToggleDebug}
          />
          🐛 Debug
        </label>
      </div>
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
