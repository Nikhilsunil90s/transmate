import { useQuery, gql } from "@apollo/client";
import React from "react";
import { Icon } from "semantic-ui-react";

const GET_COST_TYPE = gql`
  query getCost($costId: String!) {
    cost: getCost(costId: $costId) {
      id
      type
      group
      cost
      isDummy
    }
  }
`;

const CostTag = ({ costId, cost }) => {
  const { data = {} } = useQuery(GET_COST_TYPE, {
    variables: { costId },
    fetchPolicy: "cache-first"
  });

  const costData = cost || data.cost;

  return costData ? (
    <>
      {costData.group}
      <Icon name="chevron right" color="grey" />
      {costData.cost}
    </>
  ) : (
    " - "
  );
};

export default CostTag;
