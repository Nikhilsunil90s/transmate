import { Roles } from "/imports/api/roles/Roles";
import { roleStructure } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_users";
import { User } from "/imports/api/users/User";

/**
 * User's Information
 */
export const users = {
  eve: {
    uid: null,
    email: "test+eve@transmate.eu",
    name: "eve",
    password: "password"
  },
  bob: {
    uid: null,
    email: "test+bob@transmate.eu",
    name: "eve",
    password: "password"
  },
  jos: {
    uid: null,
    email: "test+jos@transmate.eu",
    name: "jos",
    password: "password"
  }
};

/**
 * Creating bob and eve's user accounts and assigning their userId's to the 'users' object
 */
function createUsersAccounts() {
  const eveUserId = Accounts.createUser({
    email: users.eve.email,
    password: users.eve.password
  });
  const bobUserId = Accounts.createUser({
    email: users.bob.email,
    password: users.bob.password
  });
  const josUserId = Accounts.createUser({
    email: users.jos.email,
    password: users.jos.password
  });

  users.eve.uid = eveUserId;
  users.bob.uid = bobUserId;
  users.jos.uid = josUserId;
}

/**
 * Creating  role
 */
export function createRole(role) {
  const allRoles = Roles.getAllRoles().map(({ _id }) => _id);
  if (!allRoles.includes(role)) {
    // base role:
    Roles.createRole(role);

    // role structure:
    (roleStructure[role] || []).forEach(subRole => {
      Roles.createRole(subRole, { unlessExists: true });
      Roles.addRolesToParent(subRole, role);
    });
  }
}

/**
 * Creates two users accounts
 * 'eve' will have role access
 */
export function createMockUsers(role, accountId, partnerId) {
  let rolesNames = role;
  if (Meteor.isTest) {
    // Removing any previous users/roles
    Roles._collection.remove({});
    User._collection.remove({});

    if (!Array.isArray(rolesNames)) rolesNames = [rolesNames];

    rolesNames.forEach(curRole => createRole(curRole));

    createUsersAccounts();

    Roles.addUsersToRoles(users.eve.uid, rolesNames, `account-${accountId}`);
    if (partnerId) {
      Roles.addUsersToRoles(users.bob.uid, rolesNames, `account-${partnerId}`);
    }
  }
  return users;
}

/** updates test user roles
 * @param {Array} roles new roles
 * @param {String=} user test userName (eve, bob or jos)
 */
export function updateUserRole(roles, user = "eve") {
  if (Meteor.isTest) {
    roles.forEach(createRole);

    const userId = users[user].uid;
    const roleGroup = Roles.getScopesForUser(userId);
    Roles.setUserRoles(userId, roles, roleGroup[0]);
  }
}
