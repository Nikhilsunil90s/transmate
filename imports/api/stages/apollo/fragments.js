import gql from "graphql-tag";

export const fragments = {
  stageStop: gql`
    fragment stageStop on FromToType {
      latLng {
        lat
        lng
      }
      countryCode
      isValidated
      zipCode
      timeZone
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
      annotation
    }
  `,
  stageDates: gql`
    fragment stageDates on Stage {
      dates {
        pickup {
          arrival {
            planned
            scheduled
            actual
          }
          start {
            planned
            scheduled
            actual
          }
          end {
            planned
            scheduled
            actual
          }
          documents {
            planned
            scheduled
            actual
          }
          departure {
            planned
            scheduled
            actual
          }
        }
        delivery {
          arrival {
            planned
            scheduled
            actual
          }
          start {
            planned
            scheduled
            actual
          }
          end {
            planned
            scheduled
            actual
          }
          documents {
            planned
            scheduled
            actual
          }
          departure {
            planned
            scheduled
            actual
          }
        }
        eta
      }
    }
  `
};

fragments.stageComplete = gql`
  fragment stageComplete on Stage {
    id
    mode
    status
    shipmentId
    sequence
    carrierId
    from {
      ...stageStop
    }
    to {
      ...stageStop
    }

    drivingDistance
    drivingDuration
    sphericalDistance

    vehicleId
    trailerId
    plate
    driverId
    instructions
    created {
      by
      at
    }
    released {
      by
      at
    }
    ...stageDates
  }
  ${fragments.stageDates}
  ${fragments.stageStop}
`;
