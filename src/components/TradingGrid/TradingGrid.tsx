import type { ColDef } from "ag-grid-community";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { tickerData } from "../../../public/fakeData";
import type { PriceRow, PriceUpdate } from "../../common/types";
import { useLogging } from "../../contexts/LoggingContext";
import { usePriceFeed } from "../../contexts/PriceFeedContext";
import { useTheme } from "../../contexts/ThemeContext";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import styles from "./TradingGrid.module.css";

ModuleRegistry.registerModules([AllCommunityModule]);

interface TradingGridProps {
  debug?: boolean;
  fps: number;
  gridApiRef: React.RefObject<AgGridReact<PriceRow> | null>;
}

export const TradingGrid: React.FC<TradingGridProps> = ({
  debug = false,
  fps,
  gridApiRef,
}) => {
  const { pricingData } = usePriceFeed();
  const { addGridLog } = useLogging();
  const { isDarkMode } = useTheme();
  const [batchedPricingData, setBatchedPricingData] = useState<PriceUpdate[]>(
    [],
  );
  const addGridLogRef = useRef(addGridLog);
  const debugRef = useRef(debug);

  useEffect(() => {
    addGridLogRef.current = addGridLog;
    debugRef.current = debug;
  }, [addGridLog, debug]);

  // useRafUpdates logic moved inline
  useEffect(() => {
    let frameId: number;
    let lastTime = performance.now();
    const frameInterval = 1000 / fps;

    const loop = (time: number) => {
      frameId = requestAnimationFrame(loop);

      if (time - lastTime < frameInterval) return;
      lastTime = time;

      const current = pricingData.current;
      if (!current) return;

      const keys = Object.keys(current);
      if (keys.length) {
        const arr = keys.map((k) => current[k]);
        // if (debug)
        // addGridLogRef.current(`Sending batch update: ${arr.length} items`);
        pricingData.current = {};
        setBatchedPricingData(arr);
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [fps, pricingData]);

  /**
   * Optimizations using refs:
   *
   * Since this is a real-time updating grid, we use refs to bypass React's state update
   * cycle for certain values. This helps in achieving smoother updates in Ag-Grid.
   * This is done using Ag-Grid's Transaction Update mechanism to efficiently update only the rows
   * that have changed. The gridApiRef is defined in the parent component in order to share it
   * with the ControlBar.
   *
   * The previousValuesRef is used to store the last known values of each row to determine
   * whether a price has gone up or down, enabling the cell flashing effect. It too is a ref
   * to avoid unnecessary re-renders.
   *
   * isDarkModeRef is used within the update effect to ensure the correct theme is applied
   * during the flashing effect. It too is a ref to avoid causing re-renders when the theme changes.
   */
  const gridRef = gridApiRef;
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
    if (!batchedPricingData.length) return;

    const api = gridRef.current?.api;
    if (!api) return;

    batchedPricingData.forEach((update) => {
      const rowNode = api.getRowNode(update.id);
      if (rowNode?.data) {
        previousValuesRef.current[update.id] = { ...rowNode.data };
      }
    });

    const updateRows: PriceRow[] = batchedPricingData.map((u) => ({
      symbol: u.id,
      ...u,
    }));

    api.applyTransaction({ update: updateRows });

    batchedPricingData.forEach((update) => {
      const rowNode = api.getRowNode(update.id);
      if (!rowNode || !rowNode.data) return;

      const previousRow = previousValuesRef.current[update.id];
      if (!previousRow) return;

      // Implementation of cell flashing effect to indicate price changes.
      (["bid", "ask", "last"] as const).forEach((field) => {
        if (update[field] !== undefined && previousRow[field] !== undefined) {
          const newValue = update[field] as number;
          const oldValue = previousRow[field] as number;
          if (newValue === oldValue) return; // Skip if no change

          if (debugRef.current)
            addGridLogRef.current(
              `${update.id} ${field}: ${oldValue} -> ${newValue} ${newValue > oldValue ? "[↑ UP]" : "[↓ DOWN]"}`,
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

            /**
             * These setTimeouts are necessary for animation timing.
             * This was previoulsy done using CSS classes, but inline styles with !important
             * ensure the styles take precedence over Ag-Grid's own styles.
             */
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
  }, [batchedPricingData, gridRef]);

  const getRowId = useCallback(
    (params: { data: PriceRow }) => params.data.id,
    [],
  );

  return (
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
  );
};
export default TradingGrid;
