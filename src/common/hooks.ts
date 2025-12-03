import { useEffect, useState } from "react";
import type { PriceUpdate } from "./types";

/**
 * @deprecated This hook is no longer used. RAF updates are now handled internally in TradingGrid.
 * Kept for reference only.
 */
export function useRafUpdates(
  pricingData: React.RefObject<Record<string, PriceUpdate>>,
  fps: number = 60,
  debug = false,
  onLog?: (message: string) => void,
) {
  const [batch, setBatch] = useState<PriceUpdate[]>([]);

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
        pricingData.current = {};
        setBatch(arr);

        if (debug && onLog) onLog(`Sending batch update: ${arr.length} items`);
      }
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [fps, pricingData, onLog, debug]);

  return batch;
}
