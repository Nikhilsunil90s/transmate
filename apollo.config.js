/* eslint-disable */

module.exports = {
  client: {
    // service: "My-Graph-nxgr8c",
    service: {
      name: "my-graphql-app",
      // url: "http://localhost:3000/graphql"
      localSchemaFile: "./graphql.schema.json"
    },
    excludes: ["**/*.graphql", "./**/*.schema.*"],

    // localSchemaFile: "./graphql.schema.json",
    includes: [
      // "imports/api/shipments/apollo/typeDefs.gql",
      // "imports/startup/server/apollo/typeDefs.graphql",
      // "imports/api/**/fragments.js",
      // "imports/client/**/queries.js",
      // "imports/api/**/*.{gql}"
      "imports/**/*.{js,jsx,tsx}"
    ]
  }
};
