import gql from "graphql-tag";

export const fragments = {
  project: gql`
    fragment project on ShipmentProject {
      id
      type {
        code
        group
        name
        lastActiveYear
      }
      title
      year
      status
      eventDate
      accountId
      attendees
      budget {
        value
        unit
      }
    }
  `,
  projectStakeholders: gql`
    fragment projectStakeholders on ShipmentProject {
      partners {
        id
        name
      }
      planners {
        id
        name
      }
    }
  `,
  projectLocation: gql`
    fragment projectLocation on ShipmentProject {
      location {
        latLng {
          lat
          lng
        }
        countryCode
        isValidated
        zipCode
        addressId
        locode {
          id
          code
          name
          function
        }
        name
        address {
          street
          address1
          address2
          number
          city
          state
        }
      }
    }
  `,
  projectNotes: gql`
    fragment projectNotes on ShipmentProject {
      notes
      lessons
    }
  `
};
