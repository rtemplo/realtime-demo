export type PriceRow = {
  id: string;
  symbol: string;
  bid?: number;
  ask?: number;
  last?: number;
};

export type PriceUpdate = Partial<PriceRow> & { id: string };
