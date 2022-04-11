export type packingUnitType = {
  id: string;
  description: string;
  code: string;
};

export type PackingFormModel = {
  parentItem?: string;
  weight_unit: string;
  weight: number;
  dimensions?: {
    height: number;
    width: number;
    length: number;
    uom: string;
  };
  code?: string;
  description?: string;
};
