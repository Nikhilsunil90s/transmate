import { gql } from "@apollo/client";

export const GET_SHIPMENT_INSIGHTS = gql`
  query getShipmentInsights($shipmentId: String!) {
    insights: getShipmentInsights(shipmentId: $shipmentId) {
      air {
        kg
        steps {
          CO2
          cost
          days
          hours
          km
          mode
          type
          from {
            country
            zip
            locode
          }
          to {
            country
            zip
            locode
          }
        }
        totalCO2
        totalCost
        totalHours
        totalKm
        totalLeadtime
        warnings
      }
      road {
        kg
        steps {
          CO2
          cost
          days
          hours
          km
          mode
          type
          from {
            country
            zip
            locode
          }
          to {
            country
            zip
            locode
          }
        }
        totalCO2
        totalCost
        totalHours
        totalKm
        totalLeadtime
        warnings
      }
      ocean {
        kg
        steps {
          CO2
          cost
          days
          hours
          km
          mode
          type
          from {
            country
            zip
            locode
          }
          to {
            country
            zip
            locode
          }
        }
        totalCO2
        totalCost
        totalHours
        totalKm
        totalLeadtime
        warnings
      }
    }
  }
`;
