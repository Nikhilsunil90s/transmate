/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
import { ApolloServer, ApolloError } from "apollo-server-express";
import {
  ApolloServerPluginUsageReporting,
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { getUser } from "meteor/apollo";
import { WebApp } from "meteor/webapp";
import { getLoaders } from "./loaders";
import resolvers from "./resolvers";

import { DDP } from "meteor/ddp-client";
import {
  withScope,
  Severity,
  captureException,
  init as sentryInit,
  setTag as sentrySetTag,
  addBreadcrumb
} from "@sentry/node";
import express from "express";

// resolvers:
import typeDefs from "./typeDefs";
import { User } from "/imports/api/users/User";
import { Roles } from "/imports/api/roles/Roles";

// info on dataloader + apollo
// https://www.robinwieruch.de/graphql-apollo-server-tutorial#batching-and-caching-in-graphql-with-data-loader

// not used ATM const debug = require("debug")("apollo:setup");

const expressapp = express();

// NOTE: upload should the first place
// expressapp.use(graphqlUploadExpress());
const nativeapp = WebApp.connectHandlers;
nativeapp.use("/graphql", expressapp);
export const app = nativeapp;
export const { httpServer } = WebApp;

const startApolloServer = async () => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,

    introspection: !process.env.NODE_ENV === "production"
  });

  const server = new ApolloServer({
    schema,
    formatError: err => {
      if (process.env.NODE_ENV !== "production") {
        console.error(err);
        console.error(err.extensions);
      }

      // Otherwise return the original error. The error can also
      // be manipulated in other ways, as long as it's returned.
      return err;
    },
    context: async ({ req }) => {
      const user = await getUser(req.headers.authorization);
      if (!user) {
        return {};
      }
      const userId = user._id;
      const accountId = await User.getAccountId(userId);
      const roles = await Roles.getRolesForUser(userId, `account-${accountId}`);
      const userName = `${user.profile?.first} ${user.profile?.last}`;
      addBreadcrumb({
        category: "auth",
        message: `Authenticated user ${userName} (${userId},${accountId})`,
        level: Severity.Info,
        data: { id: userId, accountId, username: userName }
      });

      addBreadcrumb({
        category: "referer",
        message: `arriving from page ${req.headers?.referer}`,
        level: Severity.Info,
        data: { url: req.headers?.referer }
      });
      return {
        user,
        roles,
        userId,
        accountId,
        loaders: getLoaders({ userId, accountId })
      };
    },
    plugins: [
      process.env.NODE_ENV === "production"
        ? // eslint-disable-next-line new-cap
          ApolloServerPluginLandingPageDisabled()
        : // eslint-disable-next-line new-cap
          ApolloServerPluginLandingPageGraphQLPlayground(),
      ...(process.env.APOLLO_KEY
        ? [
            // eslint-disable-next-line new-cap
            ApolloServerPluginUsageReporting({
              sendVariableValues: { all: true }
            })
          ]
        : []),
      {
        requestDidStart(_) {
          /* Within this returned object, define functions that respond
               to request-specific lifecycle events. */
          return {
            didEncounterErrors(ctx) {
              // If we couldn't parse the operation, don't
              // do anything here
              if (!ctx.operation) {
                return;
              }
              const { userId, accountId } = ctx.context || {};
              for (const err of ctx.errors) {
                // Only report internal server errors,
                // all errors extending ApolloError should be user-facing
                if (err instanceof ApolloError) {
                  // eslint-disable-next-line no-continue
                  continue;
                }

                // Add scoped report details and send to Sentry
                withScope(scope => {
                  // Annotate whether failing operation was query/mutation/subscription
                  scope.setUser({ id: userId, accountId });
                  scope.setTag("kind", ctx.operation.operation);
                  scope.setTag("operationName", ctx.request.operationName);

                  // Log query and variables as extras (make sure to strip out sensitive data!)
                  scope.setExtra("query", ctx.request.query);
                  scope.setExtra("variables", ctx.request.variables);
                  if (err.path) {
                    // We can also add the path as breadcrumb
                    scope.addBreadcrumb({
                      category: "query-path",
                      message: err.path.join(" > "),
                      level: Severity.Debug
                    });
                  }

                  const transactionId = ctx.request.http.headers.get(
                    "x-transaction-id"
                  );
                  if (transactionId) {
                    scope.setTransactionName(transactionId);
                  }

                  captureException(err);
                });
              }
            }
          };
        }
      }
    ]
  });

  await server.start();

  // FIX USERID
  if (!process.env.GENERATING_GQL_SCHEMA) {
    app.use(
      "/graphql",
      Meteor.bindEnvironment(async (req, res, next) => {
        if (req.method === "GET") return next();

        const user = await getUser(req.headers.authorization);
        if (!user) return next();
        const userId = user._id;

        // const accountId = User.init({ _id: userId }).accountId();
        return DDP._CurrentMethodInvocation.withValue(
          {
            userId
          },
          () => {
            next();
          }
        );
      })
    );
  }

  server.applyMiddleware({
    app
  });

  // Configure Sentry

  const vcapApplication =
    JSON.parse(process.env.VCAP_APPLICATION || "{}") || {};

  sentryInit({
    dsn: process.env.SENTRY,
    environment: process.env.SERVER_NAME || "localhost",
    release: process.env.RELEASE_NAME,
    tracesSampleRate: 1.0
  });

  sentrySetTag("server", process.env.ROOT_URL);
};

startApolloServer().catch(console.error);
