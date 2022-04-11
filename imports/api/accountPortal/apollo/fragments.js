import gql from "graphql-tag";

export const fragments = {
  portalData: gql`
    fragment portalData on PortalProfile {
      id
      name
      description
      banner
      logo
      established
      website
      fleet {
        type
        count
      }
      turnover {
        value
        unit
      }
      notes
      service {
        FTL
        LTL
        express
        generalCargo
        FCL
        LCL
        packed
        air
      }
      services
      certificates
      industries
      contacts {
        type
        name
        phone
        mail
        status
      }
      locations {
        name
        street
        cc
        city
        zip
        locationType
      }
      destinations {
        cc
        pct
      }
    }
  `
};
