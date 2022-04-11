import faker from "faker";

export const getInviteArguments = ({ type }) => ({
  company: faker.company.companyName(),
  type,
  sendInvite: false,
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName()
});

export const generateEntityItem = () => ({
  code: faker.random.alphaNumeric(),
  name: faker.lorem.word(),
  address: faker.address.streetAddress(),
  zipCode: faker.address.zipCode(),
  city: faker.address.city(),
  country: faker.address.country(),
  UID: faker.address.city(),
  registrationNumber: faker.random.uuid(),
  EORI: faker.finance.account(),
  VAT: faker.finance.account(),
  email: faker.internet.email(),
  exactDivision: faker.random.uuid()
});

export const generateNewUserInput = () => ({
  email: faker.internet.email(),
  first: faker.name.firstName(),
  last: faker.name.lastName()
});
