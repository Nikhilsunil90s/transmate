/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import { Mongo } from "meteor/mongo";

/* eslint-disable no-underscore-dangle */
import { User } from "../users/User";
import { RolesAssignment } from "./RolesAssignment";

// https://github.com/Meteor-Community-Packages/meteor-roles/blob/master/roles/roles_common.js
export const Roles = {
  _collection: new Mongo.Collection("roles"),

  /**
   * Check if user has specified roles.
   *
   * @example
   *     // global roles
   *     Roles.userIsInRole(user, 'admin')
   *     Roles.userIsInRole(user, ['admin','editor'])
   *     Roles.userIsInRole(userId, 'admin')
   *     Roles.userIsInRole(userId, ['admin','editor'])
   *
   *     // scope roles (global roles are still checked)
   *     Roles.userIsInRole(user, 'admin', 'group1')
   *     Roles.userIsInRole(userId, ['admin','editor'], 'group1')
   *     Roles.userIsInRole(userId, ['admin','editor'], {scope: 'group1'})
   *
   * @method userIsInRole
   * @param {String|Object} user User ID or an actual user object.
   * @param {Array|String} roles Name of role or an array of roles to check against. If array,
   *                             will return `true` if user is in _any_ role.
   *                             Roles do not have to exist.
   * @param {Object|String} [options] Options:
   *   - `scope`: name of the scope; if supplied, limits check to just that scope
   *     the user's global roles will always be checked whether scope is specified or not
   *   - `anyScope`: if set, role can be in any scope (`scope` option is ignored)
   *
   * Alternatively, it can be a scope name string.
   * @return {Boolean} `true` if user is in _any_ of the target roles
   * @static
   */
  async userIsInRole(user, roles, options) {
    let id;
    let rolesArray = roles;

    let normalizedOptions = Roles._normalizeOptions(options);

    // ensure array to simplify code
    if (!Array.isArray(roles)) rolesArray = [roles];

    rolesArray = rolesArray.filter(r => r != null);

    if (!rolesArray.length) return false;

    Roles._checkScopeName(normalizedOptions.scope);

    normalizedOptions = {
      anyScope: false,
      ...normalizedOptions
    };

    if (user && typeof user === "object") {
      id = user._id;
    } else {
      id = user;
    }

    if (!id) return false;
    if (typeof id !== "string") return false;

    const selector = {
      "user._id": id
    };

    if (!normalizedOptions.anyScope) {
      selector.scope = { $in: [normalizedOptions.scope, null] };
    }

    const cursor = await RolesAssignment.find({
      ...selector,
      "inheritedRoles._id": { $in: rolesArray }
    });
    const count = await cursor.count();

    return count > 0;

    // const testRoles = await Promise.all(
    //   rolesArray.map(async roleName => {
    //     const cursor = await RolesAssignment.find(
    //       { ...selector, "inheritedRoles._id": roleName },
    //       { limit: 1 }
    //     );
    //     const count = await cursor.count();
    //     console.log(selector);
    //     console.log(count);
    //     return count > 0;
    //   })
    // );
    // return testRoles.some(x => x);
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
    let usersArray = users;
    let rolesArray = roles;
    if (!users) throw new Error("Missing 'users' param.");
    if (!roles) throw new Error("Missing 'roles' param.");

    let normalizedOptions = Roles._normalizeOptions(options);

    // ensure arrays
    if (!Array.isArray(users)) {
      usersArray = [users];
    }
    if (!Array.isArray(roles)) {
      rolesArray = [roles];
    }

    Roles._checkScopeName(normalizedOptions.scope);

    normalizedOptions = { ifExists: false, ...normalizedOptions };

    await Promise.all(
      usersArray.map(async function userFn(user) {
        if (typeof user === "object") {
          id = user._id;
        } else {
          id = user;
        }

        await Promise.all(
          rolesArray.map(function roleFn(role) {
            return Roles._addUserToRole(id, role, normalizedOptions);
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

    const normalizedOptions = {
      unlessExists: false,
      ...options
    };

    const result = await this._collection.upsert(
      { _id: roleName },
      { $setOnInsert: { children: [] } }
    );

    // defaultMongo returns upsertedId, meteor mongo returns insertedId
    const id = result.upsertedId?._id || result.insertedId;
    if (!id) {
      if (normalizedOptions.unlessExists) return null;
      throw new Error(`Role '${roleName}' already exists.`);
    }

    return id;
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

    const normalizedOptions = Roles._normalizeOptions(options);
    let userArray = users;
    let rolesArray = roles;

    // ensure arrays
    if (!Array.isArray(users)) {
      userArray = [users];
    }
    if (!Array.isArray(roles)) {
      rolesArray = [roles];
    }

    Roles._checkScopeName(normalizedOptions.scope);

    const actions = [];
    userArray.forEach(function userFn(user) {
      if (!user) return;

      rolesArray.forEach(function rolesFn(role) {
        let id;
        if (typeof user === "object") {
          id = user._id;
        } else {
          id = user;
        }

        actions.push(Roles._removeUserFromRole(id, role, normalizedOptions));
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

    if (!userId) return null;

    const selector = {
      "user._id": userId,
      "role._id": roleName
    };

    if (!options.anyScope) {
      selector.scope = options.scope;
    }

    return RolesAssignment.remove(selector);
  },

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

    let normalizedOptions = Roles._normalizeOptions(options);

    Roles._checkScopeName(normalizedOptions.scope);

    normalizedOptions = {
      fullObjects: false,
      onlyAssigned: false,
      anyScope: false,
      onlyScoped: false,
      ...normalizedOptions
    };

    if (user && typeof user === "object") {
      id = user._id;
    } else {
      id = user;
    }

    if (!id) return [];

    const selector = { "user._id": id };

    const filter = { fields: { "inheritedRoles._id": 1 } };

    if (!normalizedOptions.anyScope) {
      selector.scope = { $in: [normalizedOptions.scope] };

      if (!normalizedOptions.onlyScoped) {
        selector.scope.$in.push(null);
      }
    }

    if (normalizedOptions.onlyAssigned) {
      delete filter.fields["inheritedRoles._id"];
      filter.fields["role._id"] = 1;
    }

    if (normalizedOptions.fullObjects) {
      delete filter.fields;
    }

    const cursor = await RolesAssignment.find(selector, filter);
    const roles = await cursor.fetch();

    if (normalizedOptions.fullObjects) {
      return roles;
    }

    return [
      ...new Set(
        roles.reduce((rev, current) => {
          if (current.inheritedRoles) {
            return rev.concat(current.inheritedRoles.map(r => r._id));
          }
          if (current.role) {
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
  _checkRoleName(roleName) {
    if (
      !roleName ||
      typeof roleName !== "string" ||
      roleName.trim() !== roleName
    ) {
      throw new Error(`Invalid role name '${roleName}'.`);
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
  _checkScopeName(scopeName) {
    if (scopeName === null) return;

    if (
      !scopeName ||
      typeof scopeName !== "string" ||
      scopeName.trim() !== scopeName
    ) {
      throw new Error(`Invalid scope name '${scopeName}'.`);
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
  _normalizeOptions(options = {}) {
    let normalizedOptions = options;
    if (
      options === null ||
      typeof options === "string" ||
      typeof options === "number"
    ) {
      normalizedOptions = { scope: options };
    }

    normalizedOptions.scope = Roles._normalizeScopeName(
      normalizedOptions.scope
    );

    return normalizedOptions;
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
    }
    return scopeName;
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
  async _getInheritedRoleNames(role) {
    const inheritedRoles = new Set();
    const nestedRoles = new Set([role]);

    // ! we need to iterate as we add subitems to it!!
    // eslint-disable-next-line no-restricted-syntax
    for (const r of nestedRoles) {
      if (r.children.length) {
        // eslint-disable-next-line no-await-in-loop
        let roles = await Roles._collection.find(
          { _id: { $in: r.children.map(r2 => r2._id) } },
          { fields: { children: 1 } }
        );
        // eslint-disable-next-line no-await-in-loop
        roles = await roles.fetch();

        roles.forEach(r2 => {
          inheritedRoles.add(r2._id);
          nestedRoles.add(r2);
        });
      }
    }

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
  async _addUserToRole(userId, roleName, options) {
    Roles._checkRoleName(roleName);
    Roles._checkScopeName(options.scope);

    if (!userId) {
      return null;
    }

    const role = await Roles._collection.findOne(
      { _id: roleName },
      { fields: { children: 1 } }
    );

    if (!role) {
      if (options.ifExists) {
        return [];
      }
      throw new Error(`Role '${roleName}' does not exist.`);
    }

    // This might create duplicates, because we don't have a unique index, but that's all right. In case there are two, withdrawing the role will effectively kill them both.
    const {
      insertedId,
      upsertedId: upsertedIdObj
    } = await RolesAssignment.upsert(
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

    const upsertedId = (upsertedIdObj || {})._id;
    const modId = insertedId || upsertedId;

    if (modId) {
      const inheritedRoleNames = await Roles._getInheritedRoleNames(role);
      await RolesAssignment.update(
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

    return { insertedId, upsertedId };
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
  async setUserRoles(users, roles, options) {
    let usersArray = users;
    let rolesArray = roles;

    if (!users) throw new Error("Missing 'users' param.");
    if (!roles) throw new Error("Missing 'roles' param.");

    let normalizedOptions = Roles._normalizeOptions(options);

    // ensure arrays
    if (!Array.isArray(users)) usersArray = [users];
    if (!Array.isArray(roles)) rolesArray = [roles];

    Roles._checkScopeName(normalizedOptions.scope);

    normalizedOptions = {
      ifExists: false,
      anyScope: false,
      ...normalizedOptions
    };

    return Promise.all(
      usersArray.map(async user => {
        let id;
        if (typeof user === "object") {
          id = user._id;
        } else {
          id = user;
        }

        // we first clear all roles for the user
        const selector = { "user._id": id };
        if (!normalizedOptions.anyScope) {
          selector.scope = normalizedOptions.scope;
        }

        await RolesAssignment.remove(selector);

        // and then add all
        await Promise.all(
          rolesArray.map(role =>
            Roles._addUserToRole(id, role, normalizedOptions)
          )
        );
        return true;
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
  async getScopesForUser(user, roles) {
    let scopes;
    let id;
    let rolesArray = roles;

    if (roles && !Array.isArray(roles)) rolesArray = [roles];

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

    if (rolesArray) {
      selector["inheritedRoles._id"] = { $in: rolesArray };
    }

    scopes = await RolesAssignment.find(selector, {
      fields: { scope: 1 }
    });
    scopes = await scopes.fetch();
    scopes = scopes.map(obi => obi.scope);

    return [...new Set(scopes)];
  },

  /**
   * Retrieve cursor of all existing roles.
   *
   * @method getAllRoles
   * @param {Object} [queryOptions] Options which are passed directly
   *                                through to `Roles.find(query, options)`.
   * @return {Cursor} Cursor of existing roles.
   * @static
   */
  getAllRoles(queryOptions) {
    const queryOpts = queryOptions || { sort: { _id: 1 } };

    return Roles._collection.find({}, queryOpts);
  },

  /**
   * Add role parent to roles.
   *
   * Previous parents are kept (role can have multiple parents). For users which have the
   * parent role set, new subroles are added automatically.
   *
   * @method addRolesToParent
   * @param {Array|String} rolesNames Name(s) of role(s).
   * @param {String} parentName Name of parent role.
   * @static
   */
  addRolesToParent(rolesNames, parentName) {
    let rolesNamesArray = rolesNames;
    if (!Array.isArray(rolesNames)) rolesNamesArray = [rolesNames];

    return Promise.all(
      rolesNamesArray.map(roleName =>
        Roles._addRoleToParent(roleName, parentName)
      )
    );
  },

  /**
   * Remove role parent from roles.
   *
   * Other parents are kept (role can have multiple parents). For users which have the
   * parent role set, removed subrole is removed automatically.
   *
   * @method removeRolesFromParent
   * @param {Array|String} rolesNames Name(s) of role(s).
   * @param {String} parentName Name of parent role.
   * @static
   */
  removeRolesFromParent(rolesNames, parentName) {
    let rolesNamesArray = rolesNames;
    if (!Array.isArray(rolesNames)) rolesNamesArray = [rolesNames];

    return Promise.all(
      rolesNamesArray.map(roleName =>
        Roles._removeRoleFromParent(roleName, parentName)
      )
    );
  },

  /**
   * @method _addRoleToParent
   * @param {String} roleName Name of role.
   * @param {String} parentName Name of parent role.
   * @private
   * @static
   */
  async _addRoleToParent(roleName, parentName) {
    Roles._checkRoleName(roleName);
    Roles._checkRoleName(parentName);

    // query to get role's children
    const role = await Roles._collection.findOne({ _id: roleName });

    if (!role) {
      throw new Error(`Role '${roleName}' does not exist.`);
    }

    // detect cycles
    if ((await Roles._getInheritedRoleNames(role)).includes(parentName)) {
      throw new Error(
        `Roles '${roleName}' and '${parentName}' would form a cycle.`
      );
    }

    const res = await Roles._collection.update(
      {
        _id: parentName,
        "children._id": {
          $ne: role._id
        }
      },
      {
        $push: {
          children: {
            _id: role._id
          }
        }
      }
    );

    // if there was no change, parent role might not exist, or role is
    // already a subrole; in any case we do not have anything more to do
    // default mongo >> modifiedcount | meteor >> a number
    if (res === 0 && !res.modifiedCount) return;

    const inheritedRoleNames = await Roles._getInheritedRoleNames(role);
    await RolesAssignment.update(
      { "inheritedRoles._id": parentName },
      {
        $push: {
          inheritedRoles: {
            $each: [role._id, ...inheritedRoleNames].map(r => ({
              _id: r
            }))
          }
        }
      },
      { multi: true }
    );
  },

  /**
   * @method _removeRoleFromParent
   * @param {String} roleName Name of role.
   * @param {String} parentName Name of parent role.
   * @private
   * @static
   */
  async _removeRoleFromParent(roleName, parentName) {
    Roles._checkRoleName(roleName);
    Roles._checkRoleName(parentName);

    // check for role existence
    // this would not really be needed, but we are trying to match addRolesToParent
    const role = await Roles._collection.findOne(
      { _id: roleName },
      { fields: { _id: 1 } }
    );

    if (!role) {
      throw new Error(`Role ${roleName} does not exist.`);
    }

    const count = await Roles._collection.update(
      {
        _id: parentName
      },
      {
        $pull: {
          children: {
            _id: role._id
          }
        }
      }
    );

    // if there was no change, parent role might not exist, or role was
    // already not a subrole; in any case we do not have anything more to do
    if (!count) return null;

    // For all roles who have had it as a dependency ...
    const roles = [...(await Roles._getParentRoleNames(role)), parentName];

    let roleDocs = await Roles._collection.find({ _id: { $in: roles } });
    roleDocs = await roleDocs.fetch();

    return Promise.all(
      roleDocs.map(async r => {
        const inheritedRoles = await Roles._getInheritedRoleNames(
          await Roles._collection.findOne({ _id: r._id })
        );
        return RolesAssignment.update(
          {
            "role._id": r._id,
            "inheritedRoles._id": role._id
          },
          {
            $set: {
              inheritedRoles: [r._id, ...inheritedRoles].map(r2 => ({
                _id: r2
              }))
            }
          },
          { multi: true }
        );
      })
    );
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
   * @return {Cursor} Cursor of users in roles.
   * @static
   */
  async getUsersInRole(roles, options, queryOptions) {
    let ids = await Roles.getUserAssignmentsForRole(roles, options);
    ids = (await ids.fetch()).map(a => a.user._id);
    return User._collection.find(
      { _id: { $in: ids } },
      (options && options.queryOptions) || queryOptions || {}
    );
  },

  /**
   * Retrieve all users who are in target role.
   *
   * Options:
   *
   * @method getUserIdsInRole
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
    let ids;

    ids = await Roles.getUserAssignmentsForRole(roles, options);
    ids = await ids.fetch();

    return [...new Set(ids.map(a => a.user._id))];
  },

  /**
   * Find out if a role is an ancestor of another role.
   *
   * WARNING: If you check this on the client, please make sure all roles are published.
   *
   * @method isParentOf
   * @param {String} parentRoleName The role you want to research.
   * @param {String} childRoleName The role you expect to be among the children of parentRoleName.
   * @static
   */
  async isParentOf(parentRoleName, childRoleName) {
    if (parentRoleName === childRoleName) {
      return true;
    }

    if (parentRoleName == null || childRoleName == null) {
      return false;
    }

    Roles._checkRoleName(parentRoleName);
    Roles._checkRoleName(childRoleName);

    let rolesToCheck = [parentRoleName];
    while (rolesToCheck.length !== 0) {
      const roleName = rolesToCheck.pop();

      if (roleName === childRoleName) {
        return true;
      }

      // eslint-disable-next-line no-await-in-loop
      const role = await Roles._collection.findOne({ _id: roleName });

      // This should not happen, but this is a problem to address at some other time.
      // eslint-disable-next-line no-continue
      if (!role) continue;

      rolesToCheck = rolesToCheck.concat(role.children.map(r => r._id));
    }

    return false;
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
   *     through to `RolesAssignment.find(query, options)`
   * Alternatively, it can be a scope name string.
   * @return {Cursor} Cursor of user assignments for roles.
   * @static
   */
  getUserAssignmentsForRole(roles, options) {
    let normalizedOptions = Roles._normalizeOptions(options);

    normalizedOptions = {
      anyScope: false,
      queryOptions: {},
      ...normalizedOptions
    };

    return Roles._getUsersInRoleCursor(
      roles,
      normalizedOptions,
      normalizedOptions.queryOptions
    );
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
   *                                through to `RolesAssignment.find(query, options)`
   * @return {Object} Cursor to the assignment documents
   * @private
   * @static
   */
  _getUsersInRoleCursor(roles, options, filter) {
    let rolesArray = roles;
    let normalizedOptions = Roles._normalizeOptions(options);

    normalizedOptions = {
      anyScope: false,
      onlyScoped: false,
      ...normalizedOptions
    };

    // ensure array to simplify code
    if (!Array.isArray(roles)) {
      rolesArray = [roles];
    }

    Roles._checkScopeName(normalizedOptions.scope);

    const filterN = {
      fields: { "user._id": 1 },
      ...filter
    };

    const selector = {
      $or: [
        { "inheritedRoles._id": { $in: rolesArray } },
        { "role._id": { $in: rolesArray } }
      ]
    };

    if (!normalizedOptions.anyScope) {
      selector.scope = { $in: [normalizedOptions.scope] };

      if (!normalizedOptions.onlyScoped) {
        selector.scope.$in.push(null);
      }
    }

    return RolesAssignment.find(selector, filterN);
  },

  /**
   * Rename a scope.
   *
   * Roles assigned with a given scope are changed to be under the new scope.
   *
   * @method renameScope
   * @param {String} oldName Old name of a scope.
   * @param {String} newName New name of a scope.
   * @static
   */
  async renameScope(oldName, newName) {
    Roles._checkScopeName(oldName);
    Roles._checkScopeName(newName);

    if (oldName === newName) return false;

    await RolesAssignment.update(
      { scope: oldName },
      { $set: { scope: newName } },
      { multi: true }
    );
    return true;
  },

  /**
   * Remove a scope.
   *
   * Roles assigned with a given scope are removed.
   *
   * @method removeScope
   * @param {String} name The name of a scope.
   * @static
   */
  removeScope(name) {
    Roles._checkScopeName(name);

    return RolesAssignment.remove({ scope: name });
  },

  /**
   * Delete an existing role.
   *
   * If the role is set for any user, it is automatically unset.
   *
   * @method deleteRole
   * @param {String} roleName Name of role.
   * @static
   */
  async deleteRole(roleName) {
    Roles._checkRoleName(roleName);

    // Remove all assignments
    await RolesAssignment.remove({
      "role._id": roleName
    });

    const role = await Roles._collection.findOne({ _id: roleName });
    const parentRoleNames = await Roles._getParentRoleNames(role);
    let parentRoles = await Roles._collection.find({
      _id: { $in: parentRoleNames }
    });
    parentRoles = await parentRoles.fetch();

    // in sequence, not in parallel:
    for (const parentRole of parentRoles) {
      await this._collection.update(
        { _id: parentRole._id },
        {
          $pull: {
            children: {
              _id: roleName
            }
          }
        }
      );

      const doc = await this._collection.findOne({ _id: parentRole._id });
      const inheritedRoles = await Roles._getInheritedRoleNames(doc);
      await RolesAssignment.update(
        { "role._id": parentRole._id },
        {
          $set: {
            inheritedRoles: [parentRole._id, ...inheritedRoles].map(r2 => ({
              _id: r2
            }))
          }
        },
        { multi: true }
      );
    }

    // await Promise.all(
    //   parentRoles.map(async parentRole => {
    //     await this._collection.update(
    //       { _id: parentRole._id },
    //       {
    //         $pull: {
    //           children: {
    //             _id: roleName
    //           }
    //         }
    //       }
    //     );

    //     const doc = await this._collection.findOne({ _id: parentRole._id });
    //     const inheritedRoles = await Roles._getInheritedRoleNames(doc);
    //     await RolesAssignment.update(
    //       {
    //         "role._id": parentRole._id
    //       },
    //       {
    //         $set: {
    //           inheritedRoles: [parentRole._id, ...inheritedRoles].map(r2 => ({
    //             _id: r2
    //           }))
    //         }
    //       },
    //       { multi: true }
    //     );
    //     return true;
    //   })
    // );

    // And finally remove the role itself
    await this._collection.remove({ _id: roleName });
    return roleName;
  },

  /**
   * Rename an existing role.
   *
   * @method renameRole
   * @param {String} oldName Old name of a role.
   * @param {String} newName New name of a role.
   * @static
   */
  async renameRole(oldName, newName) {
    Roles._checkRoleName(oldName);
    Roles._checkRoleName(newName);

    if (oldName === newName) return null;

    const role = await Roles._collection.findOne({ _id: oldName });

    if (!role) {
      throw new Error(`Role '${oldName}' does not exist.`);
    }

    role._id = newName;

    await Promise.all([
      Roles._collection.insert(role),
      RolesAssignment.update(
        { "role._id": oldName },
        { $set: { "role._id": newName } },
        { multi: true }
      ),

      RolesAssignment.update(
        { "inheritedRoles._id": oldName },
        { $set: { "inheritedRoles.$._id": newName } },
        { multi: true }
      ),

      Roles._collection.update(
        { "children._id": oldName },
        { $set: { "children.$._id": newName } },
        { multi: true }
      )
    ]);

    return Roles._collection.remove({ _id: oldName });
  },

  /**
   * Returns an array of role names the given role name is a child of.
   *
   * @example
   *     Roles._getParentRoleNames({ _id: 'admin', children; [] })
   *
   * @method _getParentRoleNames
   * @param {object} role The role object
   * @private
   * @static
   */
  async _getParentRoleNames(role) {
    if (!role) {
      return [];
    }

    const parentRoles = new Set([role._id]);

    // need to loop to go in subdocs
    for (const roleName of parentRoles) {
      let parents = await Roles._collection.find({
        "children._id": roleName
      });
      parents = await parents.fetch();
      parents.forEach(parentRole => {
        parentRoles.add(parentRole._id);
      });
    }

    parentRoles.delete(role._id);

    return [...parentRoles];
  }
};

export default Roles;
