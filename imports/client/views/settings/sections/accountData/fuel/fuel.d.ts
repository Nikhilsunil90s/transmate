export interface FuelPeriod {
  month: number;
  year: number;
  index: number;
  fuel: number;
}

export type FuelPeriodTopic = "index" | "fuel";

export interface FuelIndex {
  name: string;
  description?: string;
  periods: FuelPeriod[];
}
