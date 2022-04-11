import { Random } from "/imports/utils/functions/random.js";

export const generateId = ({ name, id }) => {
  return id || `system-input-${name.replace(/\./g, "-")}-${Random.id(3)}`;
};
