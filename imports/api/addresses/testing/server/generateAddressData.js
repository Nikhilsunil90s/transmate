import faker from "faker";

class GenerateAddressData {
  static dbData(accountId) {
    return {
      accounts: [
        {
          id: accountId,
          name: faker.lorem.words()
        }
      ],
      aliases: [faker.lorem.words()],
      input: "this is a test generated address",
      street: faker.address.streetAddress(),
      number: `${faker.random.number(2)}`,
      zip: faker.address.zipCode(),
      city: faker.address.city(),
      state: faker.address.state(),
      country: faker.address.country(),
      countryCode: faker.address.countryCode(),
      location: {
        lat: Number(faker.address.latitude()),
        lng: Number(faker.address.longitude())
      }
    };
  }

  static methodData(accountId) {
    return {
      accountId,
      name: faker.lorem.words(),
      notes: faker.lorem.text(),
      input: "this is a test generated address",
      street: faker.address.streetAddress(),
      number: `${faker.random.number(2)}`,
      zip: faker.address.zipCode(),
      city: faker.address.city(),
      state: faker.address.state(),
      country: faker.address.country(),
      countryCode: faker.address.countryCode(),
      location: {
        lat: Number(faker.address.latitude()),
        lng: Number(faker.address.longitude())
      }
    };
  }
}

export { GenerateAddressData };
