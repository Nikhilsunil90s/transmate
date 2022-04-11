import { Random } from "/imports/utils/functions/random.js";

const generateByAt = by => {
  return {
    by: by || Random.id(),
    at: new Date()
  };
};

export { generateByAt };
