import faker from "faker";

export const generateAttachmentData = () => {
  return {
    store: {
      service: "s3",
      region: faker.lorem.word(),
      bucket: faker.lorem.word(),
      key: faker.lorem.word()
    },
    meta: {
      type: faker.lorem.word(),
      size: Math.round(faker.random.number()),
      name: faker.lorem.word(),
      lastModifiedDate: faker.date.recent()
    }
  };
};
