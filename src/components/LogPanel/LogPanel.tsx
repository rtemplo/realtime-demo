import type React from "react";
import { useEffect, useRef } from "react";
import { useLogging } from "../../contexts/LoggingContext";
import { useTheme } from "../../contexts/ThemeContext";
import styles from "./LogPanel.module.css";

export const LogPanel: React.FC = () => {
  const { wsLogs, gridLogs } = useLogging();
  const { isDarkMode } = useTheme();
  const wsLogEndRef = useRef<HTMLDivElement>(null);
  const gridLogEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wsLogEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    gridLogEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className={styles.logPanel} data-theme={isDarkMode ? "dark" : "light"}>
      <div className={styles.logSection}>
        <h3 className={styles.logTitle}>
          Server Response Stream <i>[last {wsLogs.length}]</i>
        </h3>
        <div className={styles.logContent}>
          {wsLogs.map((log, index) => {
            return (
              <div
                key={`ws-${index}-${log.slice(0, 20)}`}
                className={styles.logEntry}
              >
                <span className={styles.logIndex}>[{index + 1}]</span> {log}
              </div>
            );
          })}
          <div ref={wsLogEndRef} />
        </div>
      </div>
      <div className={styles.logSection}>
        <h3 className={styles.logTitle}>
          Grid Cell Updates <i>[last {gridLogs.length}]</i>
        </h3>
        <div className={styles.logContent}>
          {gridLogs.map((log, index) => {
            const isUp = log.endsWith("[↑ UP]");
            const isDown = log.endsWith("[↓ DOWN]");
            const colorClass = isUp ? styles.green : isDown ? styles.red : "";
            return (
              <div
                key={`grid-${index}-${log.slice(0, 20)}`}
                className={`${styles.logEntry} ${colorClass}`}
              >
                <span className={styles.logIndex}>[{index + 1}]</span> {log}
              </div>
            );
          })}
          <div ref={gridLogEndRef} />
        </div>
      </div>
    </div>
  );
};

export default LogPanel;
