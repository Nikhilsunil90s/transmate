import faker from "faker";
import { Random } from "/imports/utils/functions/random.js";
import { _ } from "meteor/underscore";
import { generateByAt } from "/imports/utils/testing/dataGeneration/generateByAt";
import { generateFromTo } from "/imports/api/shipments/testing/data/shipmentTestData";

import {
  tptModes,
  stageStatus
} from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_stage";

const generatePlannedScheduledActualSchema = date => {
  return {
    planned: date,
    scheduled: date,
    actual: date
  };
};
const generateStopSchema = () => ({
  arrival: generatePlannedScheduledActualSchema(),
  start: generatePlannedScheduledActualSchema(),
  end: generatePlannedScheduledActualSchema(),
  documents: generatePlannedScheduledActualSchema(),
  departure: generatePlannedScheduledActualSchema()
});

const generateStageData = ({ carrierId }) => {
  return {
    mode: _.sample(tptModes),
    status: _.sample(stageStatus),
    shipmentId: Random.id(),
    sequence: 1,
    carrierId,
    from: generateFromTo(),
    to: generateFromTo(),
    drivingDistance: faker.random.number(),
    drivingDuration: faker.random.number(),
    sphericalDistance: faker.random.number(),
    vehicleId: faker.random.word(),
    trailerId: faker.random.word(),
    plate: faker.random.word(),
    driverId: Random.id(),
    instructions: faker.lorem.paragraphs(),
    created: generateByAt(),
    released: generateByAt(),
    dates: {
      pickup: generateStopSchema(faker.date.past()),
      delivery: generateStopSchema(faker.date.future()),
      eta: faker.date.future()
    }
  };
};

export { generateStageData };
