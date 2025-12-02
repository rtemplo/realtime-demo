import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { tickerData } from "../../../public/fakeData";
import type { PriceRow, PriceUpdate } from "../../common/types";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import styles from "./TradingGrid.module.css";

ModuleRegistry.registerModules([AllCommunityModule]);

interface TradingGridProps {
  fps: number;
  isConnected: boolean;
  isDarkMode: boolean;
  updates: PriceUpdate[];
  onFpsChange: (fps: number) => void;
  onToggleConnection: () => void;
  onToggleDarkMode: () => void;
}

export const TradingGrid: React.FC<TradingGridProps> = ({
  fps,
  isConnected,
  isDarkMode,
  updates,
  onFpsChange,
  onToggleConnection,
  onToggleDarkMode,
}) => {
  const gridRef = useRef<AgGridReact<PriceRow>>(null);
  const previousValuesRef = useRef<Record<string, PriceRow>>({});
  const isDarkModeRef = useRef(isDarkMode);

  React.useEffect(() => {
    isDarkModeRef.current = isDarkMode;
  }, [isDarkMode]);

  // Grid data is initialized without prices. Prices are updated via websocket updates.
  const [rowData] = useState<PriceRow[]>(() =>
    tickerData.map((ticker) => ({
      id: ticker.id,
      symbol: ticker.id,
    })),
  );

  const columnDefs = useMemo<ColDef<PriceRow>[]>(
    () => [
      {
        field: "symbol",
        flex: 1,
        filter: "agTextColumnFilter",
        floatingFilter: true,
        floatingFilterComponentParams: {
          suppressFilterButton: false,
        },
      },
      {
        field: "bid",
        flex: 1,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
        floatingFilterComponentParams: {
          suppressFilterButton: false,
        },
        cellStyle: { textAlign: "center" },
      },
      {
        field: "ask",
        flex: 1,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
        floatingFilterComponentParams: {
          suppressFilterButton: false,
        },
        cellStyle: { textAlign: "center" },
      },
      {
        field: "last",
        flex: 1,
        filter: "agNumberColumnFilter",
        floatingFilter: true,
        floatingFilterComponentParams: {
          suppressFilterButton: false,
        },
        cellStyle: { textAlign: "center" },
      },
    ],
    [],
  );

  React.useEffect(() => {
    console.log("TradingGrid received updates:", updates);
    if (!updates.length) return;

    const api = gridRef.current?.api;
    if (!api) return;

    updates.forEach((update) => {
      const rowNode = api.getRowNode(update.id);
      if (rowNode?.data) {
        previousValuesRef.current[update.id] = { ...rowNode.data };
      }
    });

    const updateRows: PriceRow[] = updates.map((u) => ({
      symbol: u.id,
      ...u,
    }));

    console.log("Applying transaction:", updateRows);
    const result = api.applyTransaction({ update: updateRows });
    console.log("Transaction result:", result);

    updates.forEach((update) => {
      const rowNode = api.getRowNode(update.id);
      if (!rowNode || !rowNode.data) return;

      const previousRow = previousValuesRef.current[update.id];
      if (!previousRow) return;

      (["bid", "ask", "last"] as const).forEach((field) => {
        if (update[field] !== undefined && previousRow[field] !== undefined) {
          const newValue = update[field] as number;
          const oldValue = previousRow[field] as number;
          if (newValue === oldValue) return; // Skip if no change

          const priceUp = newValue > oldValue;
          console.log(
            `%c${update.id} ${field}: ${oldValue} -> ${newValue} = ${priceUp ? "⬆️" : "⬇️"}`,
            `color: ${priceUp ? "green" : "red"}`,
          );

          const cellElement = document.querySelector(
            `[row-id="${update.id}"] [col-id="${field}"]`,
          ) as HTMLElement;

          if (cellElement) {
            const isUp = newValue > oldValue;
            const darkMode = isDarkModeRef.current;

            // Set initial flash color with inline style to override everything
            cellElement.style.setProperty(
              "background-color",
              darkMode
                ? isUp
                  ? "#4ade80"
                  : "#f87171"
                : isUp
                  ? "#90ee90"
                  : "#ffb6c1",
              "important",
            );

            setTimeout(() => {
              cellElement.style.setProperty(
                "transition",
                "background-color 500ms ease-out",
                "important",
              );
              cellElement.style.setProperty(
                "background-color",
                darkMode ? "#3a3a3a" : "transparent",
                "important",
              );

              setTimeout(() => {
                cellElement.style.removeProperty("background-color");
                cellElement.style.removeProperty("transition");
              }, 500);
            }, 50);
          }
        }
      });
    });
  }, [updates]);

  const getRowId = useCallback(
    (params: { data: PriceRow }) => params.data.id,
    [],
  );

  const clearFilters = () => {
    const api = gridRef.current?.api;
    if (api) {
      api.setFilterModel(null);
    }
  };

  return (
    <div>
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
          onClick={clearFilters}
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
      <div
        className={`ag-theme-alpine ${styles.gridContainer}`}
        style={isDarkMode ? { colorScheme: "dark" } : undefined}
        data-theme={isDarkMode ? "dark" : "light"}
      >
        <AgGridReact<PriceRow>
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          getRowId={getRowId}
          theme="legacy"
        />
      </div>
    </div>
  );
};
export default TradingGrid;
