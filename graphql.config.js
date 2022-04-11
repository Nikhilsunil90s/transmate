/* eslint-disable */
// graphql.config.js for VS code extension https://github.com/graphql/vscode-graphql
module.exports = {
  projects: {
    app: {
      schema: ["./graphql.schema.json"],
      documents: [
        // "imports/startup/server/apollo/typeDefs.graphql",
        // "imports/api/shipments/apollo/typeDefs.gql",
        // "./imports/api/**/fragments.js",
        // "./imports/client/**/queries.js",
        // "./imports/api/**/*.{gql}",
        // "./imports/**/*.{js,jsx,tsx}"
      ],
      extensions: {
        endpoints: {
          default: {
            url: "http://localhost:3000/graphql"

            // headers: { Authorization: `Bearer ${process.env.API_TOKEN}` }
          }
        }
      }
    }
  }
};
