import { RolesAssignment } from "/imports/api/roles/RolesAssignment";

const debug = require("debug")("roles:entities");

export const getEntitiesForUsers = async (userIds, accountId) => {
  const cursor = await RolesAssignment.find({
    "user._id": { $in: userIds },
    scope: new RegExp(`^entity-${accountId}`)
  });
  return cursor.fetch();
};

export const listEntities = (userId, accountId, roleDocs = []) => {
  const entities = new Set([null]);
  roleDocs
    .filter(({ user: { _id: id } }) => id === userId)
    .forEach(({ scope }) => {
      entities.add(scope.replace(`entity-${accountId}-`, ""));
    });
  return [...entities];
};

export const getUserEntities = async (userId, accountId, filteredEntities) => {
  const docs = await getEntitiesForUsers([userId], accountId);
  const viewableEntities = listEntities(userId, accountId, docs).filter(el =>
    filteredEntities ? filteredEntities.includes(el) : true
  );
  debug(
    "getUserEntities req %o, result %o",
    { userId, accountId, docs, filteredEntities },
    viewableEntities
  );
  return viewableEntities;
};

/** get all role documents for user given an accountId
 * @param {[String]} userIds
 * @param {String} accountId
 * @returns array of role documents
 */
export const getRolesForUsers = async (userIds = [], accountId) => {
  const cursor = await RolesAssignment.find({
    "user._id": { $in: userIds },
    $or: [{ scope: `account-${accountId}` }, { scope: "" }]
  });
  return cursor.fetch();
};

/** convert user docs to an array of roles names
 * @param {String} userId
 * @param {[String]} allRoles array of role documents
 * @param {Boolean} baseOnly if true, only top level role names will
 * be returned, otherwise the inherited names will be returned as well
 * @returns array of role role names
 */
export const listRoles = (userId, allRoles = [], baseOnly) => {
  const roles = new Set();
  allRoles
    .filter(
      ({ user, role }) =>
        typeof user === "object" &&
        user._id === userId &&
        typeof role === "object" &&
        role._id
    )
    .forEach(role => {
      roles.add(role.role._id);
      if (!baseOnly) {
        (role.inheritedRoles || []).forEach(({ _id: coreRole }) =>
          roles.add(coreRole)
        );
      }
    });
  return [...roles];
};

/** gets all roles for a single userId
 * @param {String} userId
 * @param {String} accountId array of role documents
 * @param {Boolean} baseOnly if true, only top level role names will
 * be returned, otherwise the inherited names will be returned as well
 * @returns array of role role names
 */
export const getRolesForUser = async (userId, accountId, baseOnly) => {
  const docs = await getRolesForUsers([userId], accountId);
  return listRoles(userId, docs, baseOnly);
};
