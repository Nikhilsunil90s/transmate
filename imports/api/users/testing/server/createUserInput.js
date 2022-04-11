import faker from "faker";

export const createUserInput = () => ({
  user: {
    email: faker.internet.email(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName()
  },
  account: {
    company: faker.company.companyName(),
    type: "shipper"
  },
  options: {
    sendMail: true
  }
});
