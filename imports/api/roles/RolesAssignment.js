import { Mongo } from "meteor/mongo";

const RolesAssignment = new Mongo.Collection("role-assignment");
export { RolesAssignment };
