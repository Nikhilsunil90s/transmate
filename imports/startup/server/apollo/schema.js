import { GraphQLScalarType } from "graphql";
import { Kind } from "graphql/language";
// eslint-disable-next-line no-unused-vars
import { GraphQLJSONObject } from "graphql-type-json";

const debug = require("debug")("apollo:schema");

const GraphQLJSONObjectClone = { ...GraphQLJSONObject };
GraphQLJSONObjectClone.name = "JSONObjectCLone";

export const resolvers = {
  FromToType: {
    async annotation(parent, args, context) {
      const { loaders } = context;
      debug(
        "Address annotation %s , annotation exists? %o",
        parent.addressId,
        !!parent.annotation
      );
      if (!parent.addressId) return {};
      if (parent.annotation) return parent.annotation;
      const result = !loaders
        ? {}
        : (await loaders.addressAnnotationLoader.load(parent.addressId)) || {};

      // const result = Address.first({
      //   _id: parent.addressId,
      //   accounts: {
      //     $elemMatch: { id: accountId }
      //   }
      // });

      if (result && result.accounts) {
        return result.accounts[0];
      }

      return {};
    }
  },

  Date: new GraphQLScalarType({
    name: "Date",
    description: "Date custom scalar type",
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return new Date(value).getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    }
  }),

  // https://kamranicus.com/handling-multiple-scalar-types-in-graphql/
  Any: new GraphQLScalarType({
    name: "Any",
    description: "Literally anything",
    serialize(value) {
      return value;
    },
    parseValue(value) {
      return value;
    },
    parseLiteral(ast) {
      return ast.value;
    }
  }),
  StringOrInt: new GraphQLScalarType({
    name: "StringOrInt",
    description: "A String or an Int union type",
    serialize(value) {
      if (typeof value !== "string" && typeof value !== "number") {
        throw new Error("Value must be either a String or an Int");
      }

      if (typeof value === "number" && !Number.isInteger(value)) {
        throw new Error("Number value must be an Int");
      }

      return value;
    },
    parseValue(value) {
      if (typeof value !== "string" && typeof value !== "number") {
        throw new Error("Value must be either a String or an Int");
      }

      if (typeof value === "number" && !Number.isInteger(value)) {
        throw new Error("Number value must be an Int");
      }

      return value;
    },
    parseLiteral(ast) {
      // Kinds: http://facebook.github.io/graphql/June2018/#sec-Type-Kinds
      // ast.value is always a string
      switch (ast.kind) {
        case Kind.INT:
          return parseInt(ast.value, 10);
        case Kind.STRING:
          return ast.value;
        default:
          throw new Error("Value must be either a String or an Int");
      }
    }
  }),

  // JSON: GraphQLJSON,
  JSON: GraphQLJSONObjectClone,
  JSONObject: GraphQLJSONObject
};
