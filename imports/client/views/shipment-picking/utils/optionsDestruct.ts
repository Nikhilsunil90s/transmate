/* eslint-disable no-unused-expressions */
import { packingUnitType } from "./interfaces";

export const existingOptionsDestruct = (data: packingUnitType[]) => {
  const options = [];

  Boolean(data.length) &&
    data.map(item =>
      options.push({
        text: item.description,
        value: item.id
      })
    );

  return options;
};

export const newOptionsDestruct = (data: packingUnitType[]) => {
  const options = [];

  Boolean(data.length) &&
    data.map(item =>
      options.push({
        text: item.description,
        value: item.code
      })
    );

  return options;
};
