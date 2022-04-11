import { ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { BatchHttpLink } from "@apollo/client/link/batch-http";

import { MeteorAccountsLink } from "meteor/apollo";

const clientOptions = {
  cache: new InMemoryCache({
    typePolicies: {
      AnalysisSimulation: {
        keyFields: ["analysisId"]
      },
      TenderBiddersType: {
        keyFields: ["accountId"]
      },
      TenderBidDataLine: {
        keyFields: ["lineId", "tenderBidId"]
      },
      User: {
        fields: {
          preferences: {
            merge: true
          }
        }
      }
    }
  }),
  name: "transmate-react-client",
  version: "1.1",
  defaultOptions: {
    query: {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all"
    },
    mutate: {
      errorPolicy: "all"
    }
  },
  connectToDevTools: true
};

const client = new ApolloClient({
  link: ApolloLink.from([
    new MeteorAccountsLink(),
    new BatchHttpLink({
      uri: "/graphql",
      batchMax: 5, // No more than 5 operations per batch
      batchInterval: 50 // Wait no more than 20ms after first batched operation
    })
  ]),
  ...clientOptions
});

export default client;
