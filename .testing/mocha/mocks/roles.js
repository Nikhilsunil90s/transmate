const { Mongo } = require("../DefaultMongo");
import { check } from "/imports/utils/check.js";
const debug = require("debug")("account:roles");

// https://github.com/Meteor-Community-Packages/meteor-roles/blob/master/roles/roles_common.js
export const Roles = {
  async userIsInRole(userId, roles, scope) {
    check(roles, Array);
    check(userId, String);
    check(scope, String);
    const role = await new Mongo.Collection("role-assignment").findOne(
      {
        "user._id": userId,
        scope,
        "inheritedRoles._id": { $all: roles }
      },
      { projection: { _id: 1 } }
    );
    if (role) {
      return true;
    }
    return false;
  },

  /**
   * Add users to roles.
   *
   * Adds roles to existing roles for each user.
   *
   * @example
   *     Roles.addUsersToRoles(userId, 'admin')
   *     Roles.addUsersToRoles(userId, ['view-secrets'], 'example.com')
   *     Roles.addUsersToRoles([user1, user2], ['user','editor'])
   *     Roles.addUsersToRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')
   *
   * @method addUsersToRoles
   * @param {Array|String} users User ID(s) or object(s) with an `_id` field.
   * @param {Array|String} roles Name(s) of roles to add users to. Roles have to exist.
   * @param {Object|String} [options] Options:
   *   - `scope`: name of the scope, or `null` for the global role
   *   - `ifExists`: if `true`, do not throw an exception if the role does not exist
   *
   * Alternatively, it can be a scope name string.
   * @static
   */
  async addUsersToRoles(users, roles, options) {
    let id;
    if (!users) throw new Error("Missing 'users' param.");
    if (!roles) throw new Error("Missing 'roles' param.");

    options = Roles._normalizeOptions(options);

    // ensure arrays
    if (!Array.isArray(users)) users = [users];
    if (!Array.isArray(roles)) roles = [roles];

    Roles._checkScopeName(options.scope);

    options = Object.assign(
      {
        ifExists: false
      },
      options
    );

    await Promise.all(
      users.map(async function(user) {
        if (typeof user === "object") {
          id = user._id;
        } else {
          id = user;
        }

        await Promise.all(
          roles.map(function(role) {
            return Roles._addUserToRole(id, role, options);
          })
        );
      })
    );
  },

  /**
   * Create a new role.
   *
   * @method createRole
   * @param {String} roleName Name of role.
   * @param {Object} [options] Options:
   *   - `unlessExists`: if `true`, exception will not be thrown in the role already exists
   * @return {String} ID of the new role or null.
   * @static
   */
  async createRole(roleName, options) {
    Roles._checkRoleName(roleName);

    options = Object.assign(
      {
        unlessExists: false
      },
      options
    );

    var result = await new Mongo.Collection("role-assignment").upsert(
      { _id: roleName },
      { $setOnInsert: { children: [] } }
    );

    if (!result.insertedId) {
      if (options.unlessExists) return null;
      throw new Error("Role '" + roleName + "' already exists.");
    }

    return result.insertedId;
  },

  /**
   * Remove users from assigned roles.
   *
   * @example
   *     Roles.removeUsersFromRoles(userId, 'admin')
   *     Roles.removeUsersFromRoles([userId, user2], ['editor'])
   *     Roles.removeUsersFromRoles(userId, ['user'], 'group1')
   *
   * @method removeUsersFromRoles
   * @param {Array|String} users User ID(s) or object(s) with an `_id` field.
   * @param {Array|String} roles Name(s) of roles to remove users from. Roles have to exist.
   * @param {Object|String} [options] Options:
   *   - `scope`: name of the scope, or `null` for the global role
   *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
   *
   * Alternatively, it can be a scope name string.
   * @static
   */
  async removeUsersFromRoles(users, roles, options) {
    if (!users) throw new Error("Missing 'users' param.");
    if (!roles) throw new Error("Missing 'roles' param.");

    options = Roles._normalizeOptions(options);

    // ensure arrays
    if (!Array.isArray(users)) users = [users];
    if (!Array.isArray(roles)) roles = [roles];

    Roles._checkScopeName(options.scope);

    const actions = [];
    users.forEach(function(user) {
      if (!user) return;

      roles.forEach(function(role) {
        let id;
        if (typeof user === "object") {
          id = user._id;
        } else {
          id = user;
        }

        actions.push(Roles._removeUserFromRole(id, role, options));
      });
    });

    return Promise.all(actions);
  },

  /**
   * Remove one user from one role.
   *
   * @method _removeUserFromRole
   * @param {String} userId The user ID.
   * @param {String} roleName Name of the role to add the user to. The role have to exist.
   * @param {Object} options Options:
   *   - `scope`: name of the scope, or `null` for the global role
   *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
   * @private
   * @static
   */
  async _removeUserFromRole(userId, roleName, options) {
    Roles._checkRoleName(roleName);
    Roles._checkScopeName(options.scope);

    if (!userId) return;

    const selector = {
      "user._id": userId,
      "role._id": roleName
    };

    if (!options.anyScope) {
      selector.scope = options.scope;
    }

    return new Mongo.Collection("role-assignment").remove(selector);
  },

  // async getRolesForUser(userId, options = {}) {
  //   const cursor = await new Mongo.Collection("role-assignment").find({
  //     "user._id": userId
  //   });
  //   const roles = await cursor.toArray();
  //   debug("getRolesForUser done:", roles);
  //   if (options && options.fullObjects) {
  //     return roles;
  //   }
  //   // to do build array of roles only
  //   if (!roles) return [];

  //   return [
  //     ...new Set(
  //       (roles || [])
  //         .map(el => el.inheritedRoles)
  //         .flat()
  //         .map(el => el._id)
  //     )
  //   ];
  // },

  /**
   * Retrieve user's roles.
   *
   * @method getRolesForUser
   * @param {String|Object} user User ID or an actual user object.
   * @param {Object|String} [options] Options:
   *   - `scope`: name of scope to provide roles for; if not specified, global roles are returned
   *   - `anyScope`: if set, role can be in any scope (`scope` and `onlyAssigned` options are ignored)
   *   - `onlyScoped`: if set, only roles in the specified scope are returned
   *   - `onlyAssigned`: return only assigned roles and not automatically inferred (like subroles)
   *   - `fullObjects`: return full roles objects (`true`) or just names (`false`) (`onlyAssigned` option is ignored) (default `false`)
   *     If you have a use-case for this option, please file a feature-request. You shouldn't need to use it as it's
   *     result strongly dependant on the internal data structure of this plugin.
   *
   * Alternatively, it can be a scope name string.
   * @return {Array} Array of user's roles, unsorted.
   * @static
   */
  async getRolesForUser(user, options) {
    let id;
    let selector;
    let filter;
    let roles;

    options = Roles._normalizeOptions(options);

    Roles._checkScopeName(options.scope);

    options = Object.assign(
      {
        fullObjects: false,
        onlyAssigned: false,
        anyScope: false,
        onlyScoped: false
      },
      options
    );

    if (user && typeof user === "object") {
      id = user._id;
    } else {
      id = user;
    }

    if (!id) return [];

    selector = {
      "user._id": id
    };

    filter = {
      fields: { "inheritedRoles._id": 1 }
    };

    if (!options.anyScope) {
      selector.scope = { $in: [options.scope] };

      if (!options.onlyScoped) {
        selector.scope.$in.push(null);
      }
    }

    if (options.onlyAssigned) {
      delete filter.fields["inheritedRoles._id"];
      filter.fields["role._id"] = 1;
    }

    if (options.fullObjects) {
      delete filter.fields;
    }

    const cursor = await new Mongo.Collection("role-assignment").find(
      selector,
      filter
    );
    roles = await cursor.toArray();

    if (options.fullObjects) {
      return roles;
    }

    return [
      ...new Set(
        roles.reduce((rev, current) => {
          if (current.inheritedRoles) {
            return rev.concat(current.inheritedRoles.map(r => r._id));
          } else if (current.role) {
            rev.push(current.role._id);
          }
          return rev;
        }, [])
      )
    ];
  },

  /**
   * Throw an exception if `roleName` is an invalid role name.
   *
   * @method _checkRoleName
   * @param {String} roleName A role name to match against.
   * @private
   * @static
   */
  _checkRoleName: function(roleName) {
    if (
      !roleName ||
      typeof roleName !== "string" ||
      roleName.trim() !== roleName
    ) {
      throw new Error("Invalid role name '" + roleName + "'.");
    }
  },

  /**
   * Throw an exception if `scopeName` is an invalid scope name.
   *
   * @method _checkScopeName
   * @param {String} scopeName A scope name to match against.
   * @private
   * @static
   */
  _checkScopeName: function(scopeName) {
    if (scopeName === null) return;

    if (
      !scopeName ||
      typeof scopeName !== "string" ||
      scopeName.trim() !== scopeName
    ) {
      throw new Error("Invalid scope name '" + scopeName + "'.");
    }
  },
  /**
   * Normalize options.
   *
   * @method _normalizeOptions
   * @param {Object} options Options to normalize.
   * @return {Object} Normalized options.
   * @private
   * @static
   */
  _normalizeOptions: function(options) {
    options = options === undefined ? {} : options;

    if (options === null || typeof options === "string") {
      options = { scope: options };
    }

    options.scope = Roles._normalizeScopeName(options.scope);

    return options;
  },

  /**
   * Normalize scope name.
   *
   * @method _normalizeScopeName
   * @param {String} scopeName A scope name to normalize.
   * @return {String} Normalized scope name.
   * @private
   * @static
   */
  _normalizeScopeName(scopeName) {
    // map undefined and null to null
    if (scopeName == null) {
      return null;
    } else {
      return scopeName;
    }
  },

  /**
   * Returns an array of role names the given role name is a parent of.
   *
   * @example
   *     Roles._getInheritedRoleNames({ _id: 'admin', children; [] })
   *
   * @method _getInheritedRoleNames
   * @param {object} role The role object
   * @private
   * @static
   */
  _getInheritedRoleNames: async function(role) {
    const inheritedRoles = new Set();
    const nestedRoles = new Set([role]);

    await Promise.all(
      [...nestedRoles].map(async r => {
        let roles = await new Mongo.Collection("role-assignment").find(
          { _id: { $in: r.children.map(r => r._id) } },
          { fields: { children: 1 } }
        );
        roles = await roles.fetch();

        roles.forEach(r2 => {
          inheritedRoles.add(r2._id);
          nestedRoles.add(r2);
        });
      })
    );

    return [...inheritedRoles];
  },

  /**
   * Add one user to one role.
   *
   * @method _addUserToRole
   * @param {String} userId The user ID.
   * @param {String} roleName Name of the role to add the user to. The role have to exist.
   * @param {Object} options Options:
   *   - `scope`: name of the scope, or `null` for the global role
   *   - `ifExists`: if `true`, do not throw an exception if the role does not exist
   * @private
   * @static
   */
  _addUserToRole: async function(userId, roleName, options) {
    Roles._checkRoleName(roleName);
    Roles._checkScopeName(options.scope);

    if (!userId) {
      return;
    }

    const role = await new Mongo.Collection("roles").findOne(
      { _id: roleName },
      { fields: { children: 1 } }
    );

    if (!role) {
      if (options.ifExists) {
        return [];
      } else {
        throw new Error("Role '" + roleName + "' does not exist.");
      }
    }

    // This might create duplicates, because we don't have a unique index, but that's all right. In case there are two, withdrawing the role will effectively kill them both.
    const res = await new Mongo.Collection("role-assignment").upsert(
      {
        "user._id": userId,
        "role._id": roleName,
        scope: options.scope
      },
      {
        $setOnInsert: {
          user: { _id: userId },
          role: { _id: roleName },
          scope: options.scope
        }
      }
    );
    const modId = res.insertedId || (res.upsertedId || {})._id;

    if (modId) {
      const inheritedRoleNames = await Roles._getInheritedRoleNames(role);
      await new Mongo.Collection("role-assignment").update(
        { _id: modId },
        {
          $set: {
            inheritedRoles: [roleName, ...inheritedRoleNames].map(r => ({
              _id: r
            }))
          }
        }
      );
    }

    return res;
  },

  /**
   * Set users' roles.
   *
   * Replaces all existing roles with a new set of roles.
   *
   * @example
   *     Roles.setUserRoles(userId, 'admin')
   *     Roles.setUserRoles(userId, ['view-secrets'], 'example.com')
   *     Roles.setUserRoles([user1, user2], ['user','editor'])
   *     Roles.setUserRoles([user1, user2], ['glorious-admin', 'perform-action'], 'example.org')
   *
   * @method setUserRoles
   * @param {Array|String} users User ID(s) or object(s) with an `_id` field.
   * @param {Array|String} roles Name(s) of roles to add users to. Roles have to exist.
   * @param {Object|String} [options] Options:
   *   - `scope`: name of the scope, or `null` for the global role
   *   - `anyScope`: if `true`, remove all roles the user has, of any scope, if `false`, only the one in the same scope
   *   - `ifExists`: if `true`, do not throw an exception if the role does not exist
   *
   * Alternatively, it can be a scope name string.
   * @static
   */
  setUserRoles: async function(users, roles, options) {
    var id;

    if (!users) throw new Error("Missing 'users' param.");
    if (!roles) throw new Error("Missing 'roles' param.");

    options = Roles._normalizeOptions(options);

    // ensure arrays
    if (!Array.isArray(users)) users = [users];
    if (!Array.isArray(roles)) roles = [roles];

    Roles._checkScopeName(options.scope);

    options = Object.assign(
      {
        ifExists: false,
        anyScope: false
      },
      options
    );

    await Promise.all(
      users.map(async function(user) {
        if (typeof user === "object") {
          id = user._id;
        } else {
          id = user;
        }
        // we first clear all roles for the user
        const selector = { "user._id": id };
        if (!options.anyScope) {
          selector.scope = options.scope;
        }

        await new Mongo.Collection("role-assignment").remove(selector);

        // and then add all
        await Promise.all(
          roles.map(function(role) {
            return Roles._addUserToRole(id, role, options);
          })
        );
      })
    );
  },

  /**
   * Retrieve users scopes, if any.
   *
   * @method getScopesForUser
   * @param {String|Object} user User ID or an actual user object.
   * @param {Array|String} [roles] Name of roles to restrict scopes to.
   *
   * @return {Array} Array of user's scopes, unsorted.
   * @static
   * @async
   */
  getScopesForUser: async function(user, roles) {
    let scopes;
    var id;

    if (roles && !Array.isArray(roles)) roles = [roles];

    if (user && typeof user === "object") {
      id = user._id;
    } else {
      id = user;
    }

    if (!id) return [];

    const selector = {
      "user._id": id,
      scope: { $ne: null }
    };

    if (roles) {
      selector["inheritedRoles._id"] = { $in: roles };
    }

    scopes = await new Mongo.Collection("role-assignment").find(selector, {
      fields: { scope: 1 }
    });
    scopes = await scopes.fetch();
    scopes = scopes.map(obi => obi.scope);

    return [...new Set(scopes)];
  },

  /**
   * Retrieve all users who are in target role.
   *
   * Options:
   *
   * @method getUsersInRole
   * @param {Array|String} roles Name of role or an array of roles. If array, users
   *                             returned will have at least one of the roles
   *                             specified but need not have _all_ roles.
   *                             Roles do not have to exist.
   * @param {Object|String} [options] Options:
   *   - `scope`: name of the scope to restrict roles to; user's global
   *     roles will also be checked
   *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
   *   - `onlyScoped`: if set, only roles in the specified scope are returned
   *   - `queryOptions`: options which are passed directly
   *     through to `Meteor.users.find(query, options)`
   *
   * Alternatively, it can be a scope name string.
   * @param {Object} [queryOptions] Options which are passed directly
   *                                through to `Meteor.users.find(query, options)`
   * @return {Array<string>} array of userIds.
   * @static
   */
  async getUserIdsInRole(roles, options) {
    var ids;

    ids = await Roles.getUserAssignmentsForRole(roles, options);
    ids = await ids.fetch();

    return [...new Set(ids.map(a => a.user._id))];
  },

  /**
   * Retrieve all assignments of a user which are for the target role.
   *
   * Options:
   *
   * @method getUserAssignmentsForRole
   * @param {Array|String} roles Name of role or an array of roles. If array, users
   *                             returned will have at least one of the roles
   *                             specified but need not have _all_ roles.
   *                             Roles do not have to exist.
   * @param {Object|String} [options] Options:
   *   - `scope`: name of the scope to restrict roles to; user's global
   *     roles will also be checked
   *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
   *   - `queryOptions`: options which are passed directly
   *     through to `Meteor.roleAssignment.find(query, options)`
   * Alternatively, it can be a scope name string.
   * @return {Cursor} Cursor of user assignments for roles.
   * @static
   */
  getUserAssignmentsForRole: function(roles, options) {
    options = Roles._normalizeOptions(options);

    options = Object.assign(
      {
        anyScope: false,
        queryOptions: {}
      },
      options
    );

    return Roles._getUsersInRoleCursor(roles, options, options.queryOptions);
  },

  /**
   * @method _getUsersInRoleCursor
   * @param {Array|String} roles Name of role or an array of roles. If array, ids of users are
   *                             returned which have at least one of the roles
   *                             assigned but need not have _all_ roles.
   *                             Roles do not have to exist.
   * @param {Object|String} [options] Options:
   *   - `scope`: name of the scope to restrict roles to; user's global
   *     roles will also be checked
   *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
   *
   * Alternatively, it can be a scope name string.
   * @param {Object} [filter] Options which are passed directly
   *                                through to `Meteor.roleAssignment.find(query, options)`
   * @return {Object} Cursor to the assignment documents
   * @private
   * @static
   */
  _getUsersInRoleCursor: function(roles, options, filter) {
    var selector;

    options = Roles._normalizeOptions(options);

    options = Object.assign(
      {
        anyScope: false,
        onlyScoped: false
      },
      options
    );

    // ensure array to simplify code
    if (!Array.isArray(roles)) roles = [roles];

    Roles._checkScopeName(options.scope);

    filter = Object.assign(
      {
        fields: { "user._id": 1 }
      },
      filter
    );

    selector = {
      "inheritedRoles._id": { $in: roles }
    };

    if (!options.anyScope) {
      selector.scope = { $in: [options.scope] };

      if (!options.onlyScoped) {
        selector.scope.$in.push(null);
      }
    }

    return new Mongo.Collection("role-assignment").find(selector, filter);
  }
};

export default Roles;
