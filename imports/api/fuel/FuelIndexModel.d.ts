import { ByAtModel } from "/imports/api/_interfaces/model.d";

export interface FuelModel {
  id: string;
  accountId: string;
  created: ByAtModel;
  name: string;
  description: string;
  fuel: number;
  acceptance: number;
  costId: string;
  base: {
    rate: number;
    month: number;
    year: number;
  };
  periods: Array<{
    month: number;
    year: number;
    index: number;
    fuel: number;
  }>;
}
