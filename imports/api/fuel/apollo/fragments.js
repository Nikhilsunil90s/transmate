import gql from "graphql-tag";

export const fragments = {
  fuelBase: gql`
    fragment fuelBase on Fuel {
      id
      name
      base {
        rate
        month
        year
      }
      fuel
      acceptance
      accountId
    }
  `,
  fuelDetail: gql`
    fragment fuelDetail on Fuel {
      description
      periods {
        month
        year
        index
        fuel
      }
    }
  `
};
