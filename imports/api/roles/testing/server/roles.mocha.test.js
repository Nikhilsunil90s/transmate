/* eslint-disable no-prototype-builtins */
/* eslint-disable prefer-template */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
/* eslint-disable func-names */
import { assert, expect } from "chai";

import { User } from "/imports/api/users/User";
import { RolesAssignment } from "../../RolesAssignment";
import { Roles } from "../../Roles";

// is a static module>> no need to run the complete test each time..
describe.skip("roles", async function() {
  let defaultMongo;
  let users = {};
  const roles = ["admin", "editor", "user"];

  async function countDocuments(collection, selector = {}, options = {}) {
    const find = collection.find(selector, options);
    if (typeof find.count === "function") {
      return find.count();
    }

    // std mongo, for await functions
    return find.then(cursor => cursor.countDocs());
  }

  async function addUser(name) {
    const user = await User._collection.insert({
      profile: { first: name },
      services: {},
      emails: [{}],
      createdAt: new Date()
    });
    if (typeof user === "string") return user;
    return user._id;
  }

  function createRoles(rolesToCreate) {
    return Promise.all(rolesToCreate.map(role => Roles.createRole(role)));
  }

  async function testError(fn, message) {
    let testErrorObj;
    try {
      await fn();
    } catch (e) {
      testErrorObj = e;
    }
    expect(testErrorObj).to.be.an("error");
    if (message) {
      expect(testErrorObj.message).to.match(message);
    }
  }

  async function testUser(username, expectedRoles, scope) {
    const userId = users[username];
    const userObj = await User.first({ _id: userId });

    // check using user ids (makes db calls)
    await _innerTest(userId, username, expectedRoles, scope);

    // check using passed-in user object
    await _innerTest(userObj, username, expectedRoles, scope);
  }

  function _innerTest(userParam, username, expectedRoles, scope) {
    // test that user has only the roles expected and no others
    return Promise.all(
      roles.map(async function(role) {
        const expected = expectedRoles.includes(role);
        const msg =
          username + " expected to have '" + role + "' role but does not";
        const nmsg =
          username +
          " had the following un-expected role: " +
          role +
          " in scope: " +
          scope;

        // user is either user document or the userId
        const test = await Roles.userIsInRole(userParam, [role], scope);
        if (expected) {
          expect(test).to.equal(true, msg);
        } else {
          assert.isFalse(test, nmsg);
        }
        return true;
      })
    );
  }

  before(async () => {
    if (process.env.DEFAULT_MONGO) {
      // eslint-disable-next-line global-require
      defaultMongo = require("../../../../../.testing/mocha/DefaultMongo.js");
      await defaultMongo.connect();
    }
  });
  beforeEach(async function() {
    await Promise.all([
      Roles._collection.remove({}),
      RolesAssignment.remove({}),
      User._collection.remove({})
    ]);

    const [eve, bob, joe] = await Promise.all([
      addUser("eve"),
      addUser("bob"),
      addUser("joe")
    ]);

    users = { eve, bob, joe };
    return true;
  });

  it("can create and delete roles", async function() {
    const role1Id = await Roles.createRole("test1");
    assert.equal((await Roles._collection.findOne())._id, "test1");
    assert.equal((await Roles._collection.findOne(role1Id))._id, "test1");

    const role2Id = await Roles.createRole("test2");
    assert.equal(
      (await Roles._collection.findOne({ _id: "test2" }))._id,
      "test2"
    );
    assert.equal((await Roles._collection.findOne(role2Id))._id, "test2");

    assert.equal(await countDocuments(Roles._collection), 2);

    await Roles.deleteRole("test1");
    const test = await Roles._collection.findOne({ _id: "test1" });
    assert.isFalse(!!test);

    await Roles.deleteRole("test2");
    const test2 = await Roles._collection.findOne({ _id: "test1" });
    assert.isFalse(!!test2);
  });

  it("can try to remove non-existing roles without crashing", async function() {
    await Roles.deleteRole("non-existing-role");
  });

  it("can't create duplicate roles", async function() {
    await Roles.createRole("test1");
    await testError(() => Roles.createRole("test1"));
    const res = await Roles.createRole("test1", { unlessExists: true });
    expect(res).to.equal(null);
  });

  it("can't create role with empty names", async function() {
    await testError(() => Roles.createRole(""), /Invalid role name/);
    await testError(() => Roles.createRole(null), /Invalid role name/);
    await testError(() => Roles.createRole(" "), /Invalid role name/);
    await testError(() => Roles.createRole(" foobar"), /Invalid role name/);
    await testError(() => Roles.createRole(" foobar "), /Invalid role name/);
  });

  it("can't use invalid scope names", async function() {
    await createRoles(["admin", "user", "editor"]);
    await Roles.addUsersToRoles(users.eve, ["admin", "user"], "scope1");
    await Roles.addUsersToRoles(users.eve, ["editor"], "scope2");

    await testError(
      () => Roles.addUsersToRoles(users.eve, ["admin", "user"], ""),
      /Invalid scope name/
    );
    await testError(
      () => Roles.addUsersToRoles(users.eve, ["admin", "user"], " "),
      /Invalid scope name/
    );
    await testError(
      () => Roles.addUsersToRoles(users.eve, ["admin", "user"], " foobar"),
      /Invalid scope name/
    );
    await testError(
      () => Roles.addUsersToRoles(users.eve, ["admin", "user"], " foobar "),
      /Invalid scope name/
    );
    await testError(
      () => Roles.addUsersToRoles(users.eve, ["admin", "user"], 42),
      /Invalid scope name/
    );
  });

  it("can check if user is in role", async function() {
    await createRoles(["admin", "user"]);
    await Roles.addUsersToRoles(users.eve, ["admin", "user"]);

    await testUser("eve", ["admin", "user"]);
  });

  it("can check if user is in role by scope", async function() {
    await createRoles(["admin", "user", "editor"]);
    await Roles.addUsersToRoles(users.eve, ["admin", "user"], "scope1");
    await Roles.addUsersToRoles(users.eve, ["editor"], "scope2");

    await testUser("eve", ["admin", "user"], "scope1");
    await testUser("eve", ["editor"], "scope2");

    assert.isFalse(
      await Roles.userIsInRole(users.eve, ["admin", "user"], "scope2")
    );
    assert.isFalse(await Roles.userIsInRole(users.eve, ["editor"], "scope1"));

    assert.isTrue(
      await Roles.userIsInRole(users.eve, ["admin", "user"], { anyScope: true })
    );
    assert.isTrue(
      await Roles.userIsInRole(users.eve, ["editor"], { anyScope: true })
    );
  });

  it("can check if user is in role by scope through options", async function() {
    await createRoles(["admin", "user", "editor"]);
    await Roles.addUsersToRoles(users.eve, ["admin", "user"], {
      scope: "scope1"
    });
    await Roles.addUsersToRoles(users.eve, ["editor"], { scope: "scope2" });

    await testUser("eve", ["admin", "user"], { scope: "scope1" });
    await testUser("eve", ["editor"], { scope: "scope2" });
  });

  it("can check if user is in role by scope with global role", async function() {
    await createRoles(["admin", "user", "editor"]);
    await Roles.addUsersToRoles(users.eve, ["admin", "user"], "scope1");
    await Roles.addUsersToRoles(users.eve, ["editor"], "scope2");
    await Roles.addUsersToRoles(users.eve, ["admin"]);

    assert.isTrue(await Roles.userIsInRole(users.eve, ["user"], "scope1"));
    assert.isTrue(await Roles.userIsInRole(users.eve, ["editor"], "scope2"));

    assert.isFalse(await Roles.userIsInRole(users.eve, ["user"]));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["editor"]));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["user"], null));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["editor"], null));

    assert.isFalse(await Roles.userIsInRole(users.eve, ["user"], "scope2"));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["editor"], "scope1"));

    assert.isTrue(await Roles.userIsInRole(users.eve, ["admin"], "scope2"));
    assert.isTrue(await Roles.userIsInRole(users.eve, ["admin"], "scope1"));
    assert.isTrue(await Roles.userIsInRole(users.eve, ["admin"]));
    assert.isTrue(await Roles.userIsInRole(users.eve, ["admin"], null));
  });

  it("renaming scopes", async function() {
    await createRoles(["admin", "user", "editor"]);
    await Roles.addUsersToRoles(users.eve, ["admin", "user"], "scope1");
    await Roles.addUsersToRoles(users.eve, ["editor"], "scope2");

    await testUser("eve", ["admin", "user"], "scope1");
    await testUser("eve", ["editor"], "scope2");

    await Roles.renameScope("scope1", "scope3");

    await testUser("eve", ["admin", "user"], "scope3");
    await testUser("eve", ["editor"], "scope2");

    assert.isFalse(
      await Roles.userIsInRole(users.eve, ["admin", "user"], "scope1")
    );
    assert.isFalse(
      await Roles.userIsInRole(users.eve, ["admin", "user"], "scope2")
    );

    await testError(() => Roles.renameScope("scope3"), /Invalid scope name/);

    await Roles.renameScope("scope3", null);

    await testUser("eve", ["admin", "user", "editor"], "scope2");

    assert.isFalse(await Roles.userIsInRole(users.eve, ["editor"]));
    assert.isTrue(await Roles.userIsInRole(users.eve, ["admin"]));
    assert.isTrue(await Roles.userIsInRole(users.eve, ["user"]));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["editor"], null));
    assert.isTrue(await Roles.userIsInRole(users.eve, ["admin"], null));
    assert.isTrue(await Roles.userIsInRole(users.eve, ["user"], null));

    await Roles.renameScope(null, "scope2");

    await testUser("eve", ["admin", "user", "editor"], "scope2");

    assert.isFalse(await Roles.userIsInRole(users.eve, ["editor"]));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["admin"]));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["user"]));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["editor"], null));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["admin"], null));
    assert.isFalse(await Roles.userIsInRole(users.eve, ["user"], null));
  });

  it("removing scopes", async function() {
    await createRoles(["admin", "user", "editor"]);
    await Roles.addUsersToRoles(users.eve, ["admin", "user"], "scope1");
    await Roles.addUsersToRoles(users.eve, ["editor"], "scope2");

    await testUser("eve", ["admin", "user"], "scope1");
    await testUser("eve", ["editor"], "scope2");

    await Roles.removeScope("scope1");

    await testUser("eve", ["editor"], "scope2");

    assert.isFalse(
      await Roles.userIsInRole(users.eve, ["admin", "user"], "scope1")
    );
    assert.isFalse(
      await Roles.userIsInRole(users.eve, ["admin", "user"], "scope2")
    );
  });

  it("can check if non-existant user is in role", async function() {
    assert.isFalse(await Roles.userIsInRole("1", "admin"));
  });

  it("can check if null user is in role", async function() {
    assert.isFalse(await Roles.userIsInRole(null, "admin"));
  });

  it("can check user against several roles at once", async function() {
    await createRoles(["admin", "user"]);

    await Roles.addUsersToRoles(users.eve, ["admin", "user"]);
    const user = await User._collection.findOne({ _id: users.eve });

    // we can check the non-existing role
    assert.isTrue(await Roles.userIsInRole(user, ["editor", "admin"]));
  });

  it("can't add non-existent user to role", async function() {
    await Roles.createRole("admin");

    await Roles.addUsersToRoles(["1"], ["admin"]);
    const user = await User._collection.findOne({ _id: "1" });
    assert.equal(user, undefined);
  });

  it("can't add user to non-existent role", async function() {
    await testError(
      () => Roles.addUsersToRoles(users.eve, ["admin"]),
      /Role 'admin' does not exist/
    );
    await Roles.addUsersToRoles(users.eve, ["admin"], { ifExists: true });
  });

  it("can't set non-existent user to role", async function() {
    await Roles.createRole("admin");

    await Roles.setUserRoles(["1"], ["admin"]);
    const user = await User._collection.findOne({ _id: "1" });
    assert.equal(user, undefined);
  });

  it("can't set user to non-existent role", async function() {
    await testError(
      () => Roles.setUserRoles(users.eve, ["admin"]),
      /Role 'admin' does not exist/
    );
    await Roles.setUserRoles(users.eve, ["admin"], { ifExists: true });
  });

  it("can add individual users to roles", async function() {
    await createRoles(["admin", "user", "editor"]);

    await Roles.addUsersToRoles(users.eve, ["admin", "user"]);

    await testUser("eve", ["admin", "user"]);
    await testUser("bob", []);
    await testUser("joe", []);

    await Roles.addUsersToRoles(users.joe, ["editor", "user"]);

    await testUser("eve", ["admin", "user"]);
    await testUser("bob", []);
    await testUser("joe", ["editor", "user"]);
  });

  it("can add individual users to roles by scope", async function() {
    await createRoles(["admin", "user", "editor"]);

    await Roles.addUsersToRoles(users.eve, ["admin", "user"], "scope1");

    await testUser("eve", ["admin", "user"], "scope1");
    await testUser("bob", [], "scope1");
    await testUser("joe", [], "scope1");

    await testUser("eve", [], "scope2");
    await testUser("bob", [], "scope2");
    await testUser("joe", [], "scope2");

    await Roles.addUsersToRoles(users.joe, ["editor", "user"], "scope1");
    await Roles.addUsersToRoles(users.bob, ["editor", "user"], "scope2");

    await testUser("eve", ["admin", "user"], "scope1");
    await testUser("bob", [], "scope1");
    await testUser("joe", ["editor", "user"], "scope1");

    await testUser("eve", [], "scope2");
    await testUser("bob", ["editor", "user"], "scope2");
    await testUser("joe", [], "scope2");
  });

  it("can add user to roles via user object", async function() {
    await createRoles(["admin", "user", "editor"]);

    const eve = await User._collection.findOne({ _id: users.eve });
    const bob = await User._collection.findOne({ _id: users.bob });

    await Roles.addUsersToRoles(eve, ["admin", "user"]);

    await testUser("eve", ["admin", "user"]);
    await testUser("bob", []);
    await testUser("joe", []);

    await Roles.addUsersToRoles(bob, ["editor"]);

    await testUser("eve", ["admin", "user"]);
    await testUser("bob", ["editor"]);
    await testUser("joe", []);
  });

  it("can add user to roles multiple times", async function() {
    await createRoles(["admin", "user", "editor"]);

    await Roles.addUsersToRoles(users.eve, ["admin", "user"]);
    await Roles.addUsersToRoles(users.eve, ["admin", "user"]);

    await testUser("eve", ["admin", "user"]);
    await testUser("bob", []);
    await testUser("joe", []);

    await Roles.addUsersToRoles(users.bob, ["admin"]);
    await Roles.addUsersToRoles(users.bob, ["editor"]);

    await testUser("eve", ["admin", "user"]);
    await testUser("bob", ["admin", "editor"]);
    await testUser("joe", []);
  });

  it("can add user to roles multiple times by scope", async function() {
    await createRoles(["admin", "user", "editor"]);

    await Roles.addUsersToRoles(users.eve, ["admin", "user"], "scope1");
    await Roles.addUsersToRoles(users.eve, ["admin", "user"], "scope1");

    await testUser("eve", ["admin", "user"], "scope1");
    await testUser("bob", [], "scope1");
    await testUser("joe", [], "scope1");

    await Roles.addUsersToRoles(users.bob, ["admin"], "scope1");
    await Roles.addUsersToRoles(users.bob, ["editor"], "scope1");

    await testUser("eve", ["admin", "user"], "scope1");
    await testUser("bob", ["admin", "editor"], "scope1");
    await testUser("joe", [], "scope1");
  });

  it("can add multiple users to roles", async function() {
    await createRoles(["admin", "user", "editor"]);

    await Roles.addUsersToRoles([users.eve, users.bob], ["admin", "user"]);

    await testUser("eve", ["admin", "user"]);
    await testUser("bob", ["admin", "user"]);
    await testUser("joe", []);

    await Roles.addUsersToRoles([users.bob, users.joe], ["editor", "user"]);

    await testUser("eve", ["admin", "user"]);
    await testUser("bob", ["admin", "editor", "user"]);
    await testUser("joe", ["editor", "user"]);
  });

  it("can add multiple users to roles by scope", async function() {
    await createRoles(["admin", "user", "editor"]);

    await Roles.addUsersToRoles(
      [users.eve, users.bob],
      ["admin", "user"],
      "scope1"
    );

    await testUser("eve", ["admin", "user"], "scope1");
    await testUser("bob", ["admin", "user"], "scope1");
    await testUser("joe", [], "scope1");

    await testUser("eve", [], "scope2");
    await testUser("bob", [], "scope2");
    await testUser("joe", [], "scope2");

    await Roles.addUsersToRoles(
      [users.bob, users.joe],
      ["editor", "user"],
      "scope1"
    );
    await Roles.addUsersToRoles(
      [users.bob, users.joe],
      ["editor", "user"],
      "scope2"
    );

    await testUser("eve", ["admin", "user"], "scope1");
    await testUser("bob", ["admin", "editor", "user"], "scope1");
    await testUser("joe", ["editor", "user"], "scope1");

    await testUser("eve", [], "scope2");
    await testUser("bob", ["editor", "user"], "scope2");
    await testUser("joe", ["editor", "user"], "scope2");
  });

  it("can remove individual users from roles", async function() {
    await createRoles(["user", "editor"]);

    // remove user role - one user
    await Roles.addUsersToRoles([users.eve, users.bob], ["editor", "user"]);
    await testUser("eve", ["editor", "user"]);
    await testUser("bob", ["editor", "user"]);
    await Roles.removeUsersFromRoles(users.eve, ["user"]);
    await testUser("eve", ["editor"]);
    await testUser("bob", ["editor", "user"]);
  });

  it("can remove user from roles multiple times", async function() {
    await Roles.createRole("user");
    await Roles.createRole("editor");

    // remove user role - one user
    await Roles.addUsersToRoles([users.eve, users.bob], ["editor", "user"]);
    await testUser("eve", ["editor", "user"]);
    await testUser("bob", ["editor", "user"]);
    await Roles.removeUsersFromRoles(users.eve, ["user"]);
    await testUser("eve", ["editor"]);
    await testUser("bob", ["editor", "user"]);

    // try remove again
    await Roles.removeUsersFromRoles(users.eve, ["user"]);
    await testUser("eve", ["editor"]);
  });

  it("can remove users from roles via user object", async function() {
    await Roles.createRole("user");
    await Roles.createRole("editor");

    const eve = await User._collection.findOne({ _id: users.eve });
    const bob = await User._collection.findOne({ _id: users.bob });

    // remove user role - one user
    await Roles.addUsersToRoles([eve, bob], ["editor", "user"]);
    await testUser("eve", ["editor", "user"]);
    await testUser("bob", ["editor", "user"]);
    await Roles.removeUsersFromRoles(eve, ["user"]);
    await testUser("eve", ["editor"]);
    await testUser("bob", ["editor", "user"]);
  });

  it("can remove individual users from roles by scope", async function() {
    await createRoles(["admin", "user", "editor"]);

    // remove user role - one user
    await Roles.addUsersToRoles(
      [users.eve, users.bob],
      ["editor", "user"],
      "scope1"
    );
    await Roles.addUsersToRoles([users.joe, users.bob], ["admin"], "scope2");
    await testUser("eve", ["editor", "user"], "scope1");
    await testUser("bob", ["editor", "user"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", ["admin"], "scope2");
    await testUser("joe", ["admin"], "scope2");

    await Roles.removeUsersFromRoles(users.eve, ["user"], "scope1");
    await testUser("eve", ["editor"], "scope1");
    await testUser("bob", ["editor", "user"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", ["admin"], "scope2");
    await testUser("joe", ["admin"], "scope2");
  });

  it("can remove individual users from roles by scope through options", async function() {
    await createRoles(["admin", "user", "editor"]);

    // remove user role - one user
    await Roles.addUsersToRoles([users.eve, users.bob], ["editor", "user"], {
      scope: "scope1"
    });
    await Roles.addUsersToRoles([users.joe, users.bob], ["admin"], {
      scope: "scope2"
    });
    await testUser("eve", ["editor", "user"], "scope1");
    await testUser("bob", ["editor", "user"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", ["admin"], "scope2");
    await testUser("joe", ["admin"], "scope2");

    await Roles.removeUsersFromRoles(users.eve, ["user"], { scope: "scope1" });
    await testUser("eve", ["editor"], "scope1");
    await testUser("bob", ["editor", "user"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", ["admin"], "scope2");
    await testUser("joe", ["admin"], "scope2");
  });

  it("can remove multiple users from roles", async function() {
    await createRoles(["admin", "user", "editor"]);

    // remove user role - two users
    await Roles.addUsersToRoles([users.eve, users.bob], ["editor", "user"]);
    await testUser("eve", ["editor", "user"]);
    await testUser("bob", ["editor", "user"]);

    assert.isFalse(await Roles.userIsInRole(users.joe, "admin"));
    await Roles.addUsersToRoles([users.bob, users.joe], ["admin", "user"]);
    await testUser("bob", ["admin", "user", "editor"]);
    await testUser("joe", ["admin", "user"]);
    await Roles.removeUsersFromRoles([users.bob, users.joe], ["admin"]);
    await testUser("bob", ["user", "editor"]);
    await testUser("joe", ["user"]);
  });

  it("can remove multiple users from roles by scope", async function() {
    await createRoles(["admin", "user", "editor"]);

    // remove user role - one user
    await Roles.addUsersToRoles(
      [users.eve, users.bob],
      ["editor", "user"],
      "scope1"
    );
    await Roles.addUsersToRoles([users.joe, users.bob], ["admin"], "scope2");
    await testUser("eve", ["editor", "user"], "scope1");
    await testUser("bob", ["editor", "user"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", ["admin"], "scope2");
    await testUser("joe", ["admin"], "scope2");

    await Roles.removeUsersFromRoles(
      [users.eve, users.bob],
      ["user"],
      "scope1"
    );
    await testUser("eve", ["editor"], "scope1");
    await testUser("bob", ["editor"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", ["admin"], "scope2");
    await testUser("joe", ["admin"], "scope2");

    await Roles.removeUsersFromRoles(
      [users.joe, users.bob],
      ["admin"],
      "scope2"
    );
    await testUser("eve", [], "scope2");
    await testUser("bob", [], "scope2");
    await testUser("joe", [], "scope2");
  });

  it("can remove multiple users from roles of any scope", async function() {
    await createRoles(["admin", "user", "editor"]);

    // remove user role - one user
    await Roles.addUsersToRoles(
      [users.eve, users.bob],
      ["editor", "user"],
      "scope1"
    );
    await Roles.addUsersToRoles([users.joe, users.bob], ["user"], "scope2");
    await testUser("eve", ["editor", "user"], "scope1");
    await testUser("bob", ["editor", "user"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", ["user"], "scope2");
    await testUser("joe", ["user"], "scope2");

    await Roles.removeUsersFromRoles([users.eve, users.bob], ["user"], {
      anyScope: true
    });
    await testUser("eve", ["editor"], "scope1");
    await testUser("bob", ["editor"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", [], "scope2");
    await testUser("joe", ["user"], "scope2");
  });

  it("can set user roles", async function() {
    await createRoles(["admin", "user", "editor"]);

    const eve = await User._collection.findOne({ _id: users.eve });
    const bob = await User._collection.findOne({ _id: users.bob });

    await Roles.setUserRoles([users.eve, bob], ["editor", "user"]);

    await testUser("eve", ["editor", "user"]);
    await testUser("bob", ["editor", "user"]);
    await testUser("joe", []);

    // use addUsersToRoles add some roles
    await Roles.addUsersToRoles([bob, users.joe], ["admin"]);
    await testUser("eve", ["editor", "user"]);
    await testUser("bob", ["admin", "editor", "user"]);
    await testUser("joe", ["admin"]);

    await Roles.setUserRoles([eve, bob], ["user"]);
    await testUser("eve", ["user"]);
    await testUser("bob", ["user"]);
    await testUser("joe", ["admin"]);

    await Roles.setUserRoles(bob, "editor");
    await testUser("eve", ["user"]);
    await testUser("bob", ["editor"]);
    await testUser("joe", ["admin"]);

    await Roles.setUserRoles([users.joe, users.bob], []);
    await testUser("eve", ["user"]);
    await testUser("bob", []);
    await testUser("joe", []);
  });

  it("can set user roles by scope", async function() {
    await createRoles(["admin", "user", "editor"]);

    const eve = await User._collection.findOne({ _id: users.eve });
    const bob = await User._collection.findOne({ _id: users.bob });
    const joe = await User._collection.findOne({ _id: users.joe });

    await Roles.setUserRoles(
      [users.eve, users.bob],
      ["editor", "user"],
      "scope1"
    );
    await Roles.setUserRoles([users.bob, users.joe], ["admin"], "scope2");
    await testUser("eve", ["editor", "user"], "scope1");
    await testUser("bob", ["editor", "user"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", ["admin"], "scope2");
    await testUser("joe", ["admin"], "scope2");

    // use addUsersToRoles add some roles
    await Roles.addUsersToRoles([users.eve, users.bob], ["admin"], "scope1");
    await Roles.addUsersToRoles([users.bob, users.joe], ["editor"], "scope2");
    await testUser("eve", ["admin", "editor", "user"], "scope1");
    await testUser("bob", ["admin", "editor", "user"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", [], "scope2");
    await testUser("bob", ["admin", "editor"], "scope2");
    await testUser("joe", ["admin", "editor"], "scope2");

    await Roles.setUserRoles([eve, bob], ["user"], "scope1");
    await Roles.setUserRoles([eve, joe], ["editor"], "scope2");
    await testUser("eve", ["user"], "scope1");
    await testUser("bob", ["user"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", ["editor"], "scope2");
    await testUser("bob", ["admin", "editor"], "scope2");
    await testUser("joe", ["editor"], "scope2");

    await Roles.setUserRoles(bob, "editor", "scope1");
    await testUser("eve", ["user"], "scope1");
    await testUser("bob", ["editor"], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", ["editor"], "scope2");
    await testUser("bob", ["admin", "editor"], "scope2");
    await testUser("joe", ["editor"], "scope2");

    assert.isTrue(
      (
        await Roles.getRolesForUser(users.bob, {
          anyScope: true,
          fullObjects: true
        })
      )
        .map(r => r.scope)
        .includes("scope1")
    );
    assert.isFalse(
      (
        await Roles.getRolesForUser(users.joe, {
          anyScope: true,
          fullObjects: true
        })
      )
        .map(r => r.scope)
        .includes("scope1")
    );

    await Roles.setUserRoles([bob, users.joe], [], "scope1");
    await testUser("eve", ["user"], "scope1");
    await testUser("bob", [], "scope1");
    await testUser("joe", [], "scope1");
    await testUser("eve", ["editor"], "scope2");
    await testUser("bob", ["admin", "editor"], "scope2");
    await testUser("joe", ["editor"], "scope2");

    // When roles in a given scope are removed, we do not want any dangling database content for that scope.
    assert.isFalse(
      (
        await Roles.getRolesForUser(users.bob, {
          anyScope: true,
          fullObjects: true
        })
      )
        .map(r => r.scope)
        .includes("scope1")
    );
    assert.isFalse(
      (
        await Roles.getRolesForUser(users.joe, {
          anyScope: true,
          fullObjects: true
        })
      )
        .map(r => r.scope)
        .includes("scope1")
    );
  });

  it("can set user roles by scope including GLOBAL_SCOPE", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("editor");

    const eve = await User._collection.findOne({ _id: users.eve });

    await Roles.addUsersToRoles(eve, "admin", Roles.GLOBAL_SCOPE);
    await testUser("eve", ["admin"], "scope1");
    await testUser("eve", ["admin"]);

    await Roles.setUserRoles(eve, "editor", Roles.GLOBAL_SCOPE);
    await testUser("eve", ["editor"], "scope2");
    await testUser("eve", ["editor"]);
  });

  it("can set user roles by scope and anyScope", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("editor");

    const eve = await User._collection.findOne({ _id: users.eve });

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      []
    );

    await Roles.addUsersToRoles(eve, "admin");

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );

    await Roles.setUserRoles(eve, "editor", {
      anyScope: true,
      scope: "scope2"
    });

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "editor" },
          scope: "scope2",
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "editor" }]
        }
      ]
    );
  });

  it("can get all roles", async function() {
    await createRoles(roles);

    // compare roles, sorted alphabetically
    const expected = roles;
    let actual = await Roles.getAllRoles();
    actual = await actual.fetch();

    actual = actual.map(r => r._id);

    assert.sameMembers(actual, expected);

    actual = await Roles.getAllRoles({ sort: { _id: -1 } });
    actual = await actual.fetch();
    assert.sameMembers(
      actual.map(r => r._id),
      expected.reverse()
    );
  });

  it("get an empty list of roles for an empty user", async function() {
    assert.sameMembers(await Roles.getRolesForUser(undefined), []);
    assert.sameMembers(await Roles.getRolesForUser(null), []);
    assert.sameMembers(await Roles.getRolesForUser({}), []);
  });

  it("get an empty list of roles for non-existant user", async function() {
    assert.sameMembers(await Roles.getRolesForUser("1"), []);
    assert.sameMembers(await Roles.getRolesForUser("1", "scope1"), []);
  });

  it("can get all roles for user", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");

    const userId = users.eve;
    let userObj;

    // by userId
    assert.sameMembers(await Roles.getRolesForUser(userId), []);

    // by user object
    userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getRolesForUser(userObj), []);

    await Roles.addUsersToRoles(userId, ["admin", "user"]);

    // by userId
    assert.sameMembers(await Roles.getRolesForUser(userId), ["admin", "user"]);

    // by user object
    userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getRolesForUser(userObj), ["admin", "user"]);

    assert.sameDeepMembers(
      (await Roles.getRolesForUser(userId, { fullObjects: true })).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: null,
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        },
        {
          role: { _id: "user" },
          scope: null,
          user: { _id: userId },
          inheritedRoles: [{ _id: "user" }]
        }
      ]
    );
  });

  it("can get all roles for user by scope", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");

    const userId = users.eve;
    let userObj;

    // by userId
    assert.sameMembers(await Roles.getRolesForUser(userId, "scope1"), []);

    // by user object
    userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getRolesForUser(userObj, "scope1"), []);

    // add roles
    await Roles.addUsersToRoles(userId, ["admin", "user"], "scope1");
    await Roles.addUsersToRoles(userId, ["admin"], "scope2");

    // by userId
    assert.sameMembers(await Roles.getRolesForUser(userId, "scope1"), [
      "admin",
      "user"
    ]);
    assert.sameMembers(await Roles.getRolesForUser(userId, "scope2"), [
      "admin"
    ]);
    assert.sameMembers(await Roles.getRolesForUser(userId), []);

    // by user object
    userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getRolesForUser(userObj, "scope1"), [
      "admin",
      "user"
    ]);
    assert.sameMembers(await Roles.getRolesForUser(userObj, "scope2"), [
      "admin"
    ]);
    assert.sameMembers(await Roles.getRolesForUser(userObj), []);

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          fullObjects: true,
          scope: "scope1"
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        },
        {
          role: { _id: "user" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "user" }]
        }
      ]
    );
    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          fullObjects: true,
          scope: "scope2"
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: "scope2",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          fullObjects: true,
          anyScope: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        },
        {
          role: { _id: "user" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "user" }]
        },
        {
          role: { _id: "admin" },
          scope: "scope2",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );

    await Roles.createRole("PERMISSION");
    await Roles.addRolesToParent("PERMISSION", "user");

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          fullObjects: true,
          scope: "scope1"
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        },
        {
          role: { _id: "user" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "user" }, { _id: "PERMISSION" }]
        }
      ]
    );
    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          fullObjects: true,
          scope: "scope2"
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: "scope2",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );
    assert.sameMembers(
      await Roles.getRolesForUser(userId, { scope: "scope1" }),
      ["admin", "user", "PERMISSION"]
    );
    assert.sameMembers(
      await Roles.getRolesForUser(userId, { scope: "scope2" }),
      ["admin"]
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          fullObjects: true,
          anyScope: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        },
        {
          role: { _id: "user" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "user" }, { _id: "PERMISSION" }]
        },
        {
          role: { _id: "admin" },
          scope: "scope2",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );
    assert.sameMembers(
      await Roles.getRolesForUser(userId, { anyScope: true }),
      ["admin", "user", "PERMISSION"]
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          fullObjects: true,
          scope: "scope1",
          onlyAssigned: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        },
        {
          role: { _id: "user" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "user" }, { _id: "PERMISSION" }]
        }
      ]
    );
    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          fullObjects: true,
          scope: "scope2",
          onlyAssigned: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: "scope2",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );
    assert.sameMembers(
      await Roles.getRolesForUser(userId, {
        scope: "scope1",
        onlyAssigned: true
      }),
      ["admin", "user"]
    );
    assert.sameMembers(
      await Roles.getRolesForUser(userId, {
        scope: "scope2",
        onlyAssigned: true
      }),
      ["admin"]
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          fullObjects: true,
          anyScope: true,
          onlyAssigned: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        },
        {
          role: { _id: "user" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "user" }, { _id: "PERMISSION" }]
        },
        {
          role: { _id: "admin" },
          scope: "scope2",
          user: { _id: userId },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );
    assert.sameMembers(
      await Roles.getRolesForUser(userId, {
        anyScope: true,
        onlyAssigned: true
      }),
      ["admin", "user"]
    );
  });

  it("can get only scoped roles for user", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");

    const userId = users.eve;

    // add roles
    await Roles.addUsersToRoles(userId, ["user"], "scope1");
    await Roles.addUsersToRoles(userId, ["admin"]);

    await Roles.createRole("PERMISSION");
    await Roles.addRolesToParent("PERMISSION", "user");

    assert.sameMembers(
      await Roles.getRolesForUser(userId, {
        onlyScoped: true,
        scope: "scope1"
      }),
      ["user", "PERMISSION"]
    );
    assert.sameMembers(
      await Roles.getRolesForUser(userId, {
        onlyScoped: true,
        onlyAssigned: true,
        scope: "scope1"
      }),
      ["user"]
    );
    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(userId, {
          onlyScoped: true,
          fullObjects: true,
          scope: "scope1"
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "user" },
          scope: "scope1",
          user: { _id: userId },
          inheritedRoles: [{ _id: "user" }, { _id: "PERMISSION" }]
        }
      ]
    );
  });

  it("can get all roles for user by scope with periods in name", async function() {
    await Roles.createRole("admin");

    await Roles.addUsersToRoles(users.joe, ["admin"], "example.k12.va.us");

    assert.sameMembers(
      await Roles.getRolesForUser(users.joe, "example.k12.va.us"),
      ["admin"]
    );
  });

  it("can get all roles for user by scope including Roles.GLOBAL_SCOPE", async function() {
    await createRoles(roles);

    const userId = users.eve;

    await Roles.addUsersToRoles([users.eve], ["editor"], Roles.GLOBAL_SCOPE);
    await Roles.addUsersToRoles([users.eve], ["admin", "user"], "scope1");

    // by userId
    assert.sameMembers(await Roles.getRolesForUser(userId, "scope1"), [
      "editor",
      "admin",
      "user"
    ]);
    assert.sameMembers(await Roles.getRolesForUser(userId), ["editor"]);

    // by user object
    const userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getRolesForUser(userObj, "scope1"), [
      "editor",
      "admin",
      "user"
    ]);
    assert.sameMembers(await Roles.getRolesForUser(userObj), ["editor"]);
  });

  it("getRolesForUser should not return null entries if user has no roles for scope", async function() {
    await Roles.createRole("editor");

    const userId = users.eve;
    let userObj;

    // by userId
    assert.sameMembers(await Roles.getRolesForUser(userId, "scope1"), []);
    assert.sameMembers(await Roles.getRolesForUser(userId), []);

    // by user object
    userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getRolesForUser(userObj, "scope1"), []);
    assert.sameMembers(await Roles.getRolesForUser(userObj), []);

    await Roles.addUsersToRoles([users.eve], ["editor"], Roles.GLOBAL_SCOPE);

    // by userId
    assert.sameMembers(await Roles.getRolesForUser(userId, "scope1"), [
      "editor"
    ]);
    assert.sameMembers(await Roles.getRolesForUser(userId), ["editor"]);

    // by user object
    userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getRolesForUser(userObj, "scope1"), [
      "editor"
    ]);
    assert.sameMembers(await Roles.getRolesForUser(userObj), ["editor"]);
  });

  it("getRolesForUser should not fail during a call of addUsersToRoles", async function() {
    await Roles.createRole("editor");

    const userId = users.eve;

    const promises = [];

    const interval = setInterval(() => {
      promises.push(() => Roles.getRolesForUser(userId));
    }, 0);

    await Roles.addUsersToRoles([users.eve], ["editor"], Roles.GLOBAL_SCOPE);
    clearInterval(interval);

    return Promise.all(promises);
  });

  it("returns an empty list of scopes for null as user-id", async function() {
    assert.sameMembers(await Roles.getScopesForUser(undefined), []);
    assert.sameMembers(await Roles.getScopesForUser(null), []);
    assert.sameMembers(await Roles.getScopesForUser("foo"), []);
    assert.sameMembers(await Roles.getScopesForUser({}), []);
    assert.sameMembers(await Roles.getScopesForUser({ _id: "foo" }), []);
  });

  it("can get all scopes for user", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");
    await Roles.createRole("editor");

    const userId = users.eve;

    await Roles.addUsersToRoles([users.eve], ["editor"], "scope1");
    await Roles.addUsersToRoles([users.eve], ["admin", "user"], "scope2");

    // by userId
    assert.sameMembers(await Roles.getScopesForUser(userId), [
      "scope1",
      "scope2"
    ]);

    // by user object
    const userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getScopesForUser(userObj), [
      "scope1",
      "scope2"
    ]);
  });

  it("can get all scopes for user by role", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");
    await Roles.createRole("editor");

    const userId = users.eve;

    await Roles.addUsersToRoles([users.eve], ["editor"], "scope1");
    await Roles.addUsersToRoles([users.eve], ["editor", "user"], "scope2");

    // by userId
    assert.sameMembers(await Roles.getScopesForUser(userId, "user"), [
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userId, "editor"), [
      "scope1",
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userId, "admin"), []);

    // by user object
    const userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getScopesForUser(userObj, "user"), [
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userObj, "editor"), [
      "scope1",
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userObj, "admin"), []);
  });

  it("getScopesForUser returns [] when not using scopes", async function() {
    await Roles.createRole("user");
    await Roles.createRole("editor");

    const userId = users.eve;

    await Roles.addUsersToRoles([users.eve], ["editor", "user"]);

    // by userId
    assert.sameMembers(await Roles.getScopesForUser(userId), []);
    assert.sameMembers(await Roles.getScopesForUser(userId, "editor"), []);
    assert.sameMembers(await Roles.getScopesForUser(userId, ["editor"]), []);
    assert.sameMembers(
      await Roles.getScopesForUser(userId, ["editor", "user"]),
      []
    );

    // by user object
    const userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getScopesForUser(userObj), []);
    assert.sameMembers(await Roles.getScopesForUser(userObj, "editor"), []);
    assert.sameMembers(await Roles.getScopesForUser(userObj, ["editor"]), []);
    assert.sameMembers(
      await Roles.getScopesForUser(userObj, ["editor", "user"]),
      []
    );
  });

  it("can get all groups for user by role array", async function() {
    const userId = users.eve;

    await Roles.createRole("user");
    await Roles.createRole("editor");
    await Roles.createRole("moderator");
    await Roles.createRole("admin");

    await Roles.addUsersToRoles([users.eve], ["editor"], "group1");
    await Roles.addUsersToRoles([users.eve], ["editor", "user"], "group2");
    await Roles.addUsersToRoles([users.eve], ["moderator"], "group3");

    // by userId, one role
    assert.sameMembers(await Roles.getScopesForUser(userId, ["user"]), [
      "group2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userId, ["editor"]), [
      "group1",
      "group2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userId, ["admin"]), []);

    // by userId, multiple roles
    assert.sameMembers(
      await Roles.getScopesForUser(userId, ["editor", "user"]),
      ["group1", "group2"]
    );
    assert.sameMembers(
      await Roles.getScopesForUser(userId, ["editor", "moderator"]),
      ["group1", "group2", "group3"]
    );
    assert.sameMembers(
      await Roles.getScopesForUser(userId, ["user", "moderator"]),
      ["group2", "group3"]
    );

    // by user object, one role
    const userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getScopesForUser(userObj, ["user"]), [
      "group2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userObj, ["editor"]), [
      "group1",
      "group2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userObj, ["admin"]), []);

    // by user object, multiple roles
    assert.sameMembers(
      await Roles.getScopesForUser(userObj, ["editor", "user"]),
      ["group1", "group2"]
    );
    assert.sameMembers(
      await Roles.getScopesForUser(userObj, ["editor", "moderator"]),
      ["group1", "group2", "group3"]
    );
    assert.sameMembers(
      await Roles.getScopesForUser(userObj, ["user", "moderator"]),
      ["group2", "group3"]
    );
  });

  it("getting all scopes for user does not include GLOBAL_SCOPE", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");
    await Roles.createRole("editor");

    const userId = users.eve;

    await Roles.addUsersToRoles([users.eve], ["editor"], "scope1");
    await Roles.addUsersToRoles([users.eve], ["editor", "user"], "scope2");
    await Roles.addUsersToRoles(
      [users.eve],
      ["editor", "user", "admin"],
      Roles.GLOBAL_SCOPE
    );

    // by userId
    assert.sameMembers(await Roles.getScopesForUser(userId, "user"), [
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userId, "editor"), [
      "scope1",
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userId, "admin"), []);
    assert.sameMembers(await Roles.getScopesForUser(userId, ["user"]), [
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userId, ["editor"]), [
      "scope1",
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userId, ["admin"]), []);
    assert.sameMembers(
      await Roles.getScopesForUser(userId, ["user", "editor", "admin"]),
      ["scope1", "scope2"]
    );

    // by user object
    const userObj = await User._collection.findOne({ _id: userId });
    assert.sameMembers(await Roles.getScopesForUser(userObj, "user"), [
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userObj, "editor"), [
      "scope1",
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userObj, "admin"), []);
    assert.sameMembers(await Roles.getScopesForUser(userObj, ["user"]), [
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userObj, ["editor"]), [
      "scope1",
      "scope2"
    ]);
    assert.sameMembers(await Roles.getScopesForUser(userObj, ["admin"]), []);
    assert.sameMembers(
      await Roles.getScopesForUser(userObj, ["user", "editor", "admin"]),
      ["scope1", "scope2"]
    );
  });

  it("can get all users in role", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");
    await Roles.createRole("editor");

    await Roles.addUsersToRoles([users.eve, users.joe], ["admin", "user"]);
    await Roles.addUsersToRoles([users.bob, users.joe], ["editor"]);

    const expected = [users.eve, users.joe];
    let actual = await Roles.getUsersInRole("admin");
    actual = await actual.fetch();
    actual = actual.map(r => r._id);

    assert.sameMembers(actual, expected);
  });

  it("can get all users in role by scope", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");

    await Roles.addUsersToRoles(
      [users.eve, users.joe],
      ["admin", "user"],
      "scope1"
    );
    await Roles.addUsersToRoles([users.bob, users.joe], ["admin"], "scope2");

    let expected = [users.eve, users.joe];
    let actual = await Roles.getUsersInRole("admin", "scope1");
    actual = await actual.fetch();
    actual = actual.map(r => r._id);

    assert.sameMembers(actual, expected);

    expected = [users.eve, users.joe];
    actual = await Roles.getUsersInRole("admin", { scope: "scope1" });
    actual = await actual.fetch();
    actual = actual.map(r => r._id);
    assert.sameMembers(actual, expected);

    expected = [users.eve, users.bob, users.joe];
    actual = await Roles.getUsersInRole("admin", { anyScope: true });
    actual = await actual.fetch();
    actual = actual.map(r => r._id);
    assert.sameMembers(actual, expected);

    actual = await Roles.getUsersInRole("admin");
    actual = await actual.fetch();
    actual = actual.map(r => r._id);
    assert.sameMembers(actual, []);
  });

  it("can get all users in role by scope including Roles.GLOBAL_SCOPE", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");

    await Roles.addUsersToRoles(
      [users.eve],
      ["admin", "user"],
      Roles.GLOBAL_SCOPE
    );
    await Roles.addUsersToRoles([users.bob, users.joe], ["admin"], "scope2");

    let expected = [users.eve];
    let actual = await Roles.getUsersInRole("admin", "scope1");
    actual = await actual.fetch();
    actual = actual.map(r => r._id);

    assert.sameMembers(actual, expected);

    expected = [users.eve, users.bob, users.joe];
    actual = await Roles.getUsersInRole("admin", "scope2");
    actual = await actual.fetch();
    actual = actual.map(r => r._id);

    assert.sameMembers(actual, expected);

    expected = [users.eve];
    actual = await Roles.getUsersInRole("admin");
    actual = await actual.fetch();
    actual = actual.map(r => r._id);

    assert.sameMembers(actual, expected);

    expected = [users.eve, users.bob, users.joe];
    actual = await Roles.getUsersInRole("admin", { anyScope: true });
    actual = await actual.fetch();
    actual = actual.map(r => r._id);

    assert.sameMembers(actual, expected);
  });

  it("can get all users in role by scope excluding Roles.GLOBAL_SCOPE", async function() {
    await Roles.createRole("admin");

    await Roles.addUsersToRoles([users.eve], ["admin"], Roles.GLOBAL_SCOPE);
    await Roles.addUsersToRoles([users.bob], ["admin"], "scope1");

    let expected = [users.eve];
    let actual = await Roles.getUsersInRole("admin");
    actual = await actual.fetch();
    actual = actual.map(r => r._id);
    assert.sameMembers(actual, expected);

    expected = [users.eve, users.bob];
    actual = await Roles.getUsersInRole("admin", { scope: "scope1" });
    actual = await actual.fetch();
    actual = actual.map(r => r._id);
    assert.sameMembers(actual, expected);

    expected = [users.bob];
    actual = await Roles.getUsersInRole("admin", {
      scope: "scope1",
      onlyScoped: true
    });
    actual = await actual.fetch();
    actual = actual.map(r => r._id);
    assert.sameMembers(actual, expected);
  });

  it("can get all users in role by scope and passes through mongo query arguments", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");

    await Roles.addUsersToRoles(
      [users.eve, users.joe],
      ["admin", "user"],
      "scope1"
    );
    await Roles.addUsersToRoles([users.bob, users.joe], ["admin"], "scope2");

    let results = await Roles.getUsersInRole("admin", "scope1", {
      fields: { username: 0 },
      limit: 1
    });
    results = await results.fetch();

    assert.equal(1, results.length);
    assert.isTrue(results[0].hasOwnProperty("_id"));
    assert.isFalse(results[0].hasOwnProperty("username"));
  });

  it("can use Roles.GLOBAL_SCOPE to assign blanket roles", async function() {
    await Roles.createRole("admin");

    await Roles.addUsersToRoles(
      [users.joe, users.bob],
      ["admin"],
      Roles.GLOBAL_SCOPE
    );

    await testUser("eve", [], "scope1");
    await testUser("joe", ["admin"], "scope2");
    await testUser("joe", ["admin"], "scope1");
    await testUser("bob", ["admin"], "scope2");
    await testUser("bob", ["admin"], "scope1");

    await Roles.removeUsersFromRoles(users.joe, ["admin"], Roles.GLOBAL_SCOPE);

    await testUser("eve", [], "scope1");
    await testUser("joe", [], "scope2");
    await testUser("joe", [], "scope1");
    await testUser("bob", ["admin"], "scope2");
    await testUser("bob", ["admin"], "scope1");
  });

  it("Roles.GLOBAL_SCOPE is independent of other scopes", async function() {
    await Roles.createRole("admin");

    await Roles.addUsersToRoles([users.joe, users.bob], ["admin"], "scope5");
    await Roles.addUsersToRoles(
      [users.joe, users.bob],
      ["admin"],
      Roles.GLOBAL_SCOPE
    );

    await testUser("eve", [], "scope1");
    await testUser("joe", ["admin"], "scope5");
    await testUser("joe", ["admin"], "scope2");
    await testUser("joe", ["admin"], "scope1");
    await testUser("bob", ["admin"], "scope5");
    await testUser("bob", ["admin"], "scope2");
    await testUser("bob", ["admin"], "scope1");

    await Roles.removeUsersFromRoles(users.joe, ["admin"], Roles.GLOBAL_SCOPE);

    await testUser("eve", [], "scope1");
    await testUser("joe", ["admin"], "scope5");
    await testUser("joe", [], "scope2");
    await testUser("joe", [], "scope1");
    await testUser("bob", ["admin"], "scope5");
    await testUser("bob", ["admin"], "scope2");
    await testUser("bob", ["admin"], "scope1");
  });

  it("Roles.GLOBAL_SCOPE also checked when scope not specified", async function() {
    await Roles.createRole("admin");

    await Roles.addUsersToRoles(users.joe, "admin", Roles.GLOBAL_SCOPE);

    await testUser("joe", ["admin"]);

    await Roles.removeUsersFromRoles(users.joe, "admin", Roles.GLOBAL_SCOPE);

    await testUser("joe", []);
  });

  it("can use '.' in scope name", async function() {
    await Roles.createRole("admin");

    await Roles.addUsersToRoles(users.joe, ["admin"], "example.com");
    await testUser("joe", ["admin"], "example.com");
  });

  it("can use multiple periods in scope name", async function() {
    await Roles.createRole("admin");

    await Roles.addUsersToRoles(users.joe, ["admin"], "example.k12.va.us");
    await testUser("joe", ["admin"], "example.k12.va.us");
  });

  it("renaming of roles", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");
    await Roles.createRole("editor");

    await Roles.setUserRoles(
      [users.eve, users.bob],
      ["editor", "user"],
      "scope1"
    );
    await Roles.setUserRoles(
      [users.bob, users.joe],
      ["user", "admin"],
      "scope2"
    );

    assert.isTrue(await Roles.userIsInRole(users.eve, "editor", "scope1"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "editor", "scope2"));

    assert.isFalse(await Roles.userIsInRole(users.joe, "admin", "scope1"));
    assert.isTrue(await Roles.userIsInRole(users.joe, "admin", "scope2"));

    assert.isTrue(await Roles.userIsInRole(users.eve, "user", "scope1"));
    assert.isTrue(await Roles.userIsInRole(users.bob, "user", "scope1"));
    assert.isFalse(await Roles.userIsInRole(users.joe, "user", "scope1"));

    assert.isFalse(await Roles.userIsInRole(users.eve, "user", "scope2"));
    assert.isTrue(await Roles.userIsInRole(users.bob, "user", "scope2"));
    assert.isTrue(await Roles.userIsInRole(users.joe, "user", "scope2"));

    assert.isFalse(await Roles.userIsInRole(users.eve, "user2", "scope1"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "user2", "scope2"));

    await Roles.renameRole("user", "user2");

    assert.isTrue(await Roles.userIsInRole(users.eve, "editor", "scope1"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "editor", "scope2"));

    assert.isFalse(await Roles.userIsInRole(users.joe, "admin", "scope1"));
    assert.isTrue(await Roles.userIsInRole(users.joe, "admin", "scope2"));

    assert.isTrue(await Roles.userIsInRole(users.eve, "user2", "scope1"));
    assert.isTrue(await Roles.userIsInRole(users.bob, "user2", "scope1"));
    assert.isFalse(await Roles.userIsInRole(users.joe, "user2", "scope1"));

    assert.isFalse(await Roles.userIsInRole(users.eve, "user2", "scope2"));
    assert.isTrue(await Roles.userIsInRole(users.bob, "user2", "scope2"));
    assert.isTrue(await Roles.userIsInRole(users.joe, "user2", "scope2"));

    assert.isFalse(await Roles.userIsInRole(users.eve, "user", "scope1"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "user", "scope2"));
  });

  it("_addUserToRole", async function() {
    await Roles.createRole("admin");

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      []
    );

    assert.include(
      Object.keys(
        await Roles._addUserToRole(users.eve, "admin", {
          scope: null,
          ifExists: false
        })
      ),
      "insertedId"
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );

    assert.equal(
      (
        await Roles._addUserToRole(users.eve, "admin", {
          scope: null,
          ifExists: false
        })
      ).insertedId,
      null
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );
  });

  it("_removeUserFromRole", async function() {
    await Roles.createRole("admin");

    await Roles.addUsersToRoles(users.eve, "admin");

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "admin" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "admin" }]
        }
      ]
    );

    await Roles._removeUserFromRole(users.eve, "admin", { scope: null });

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      []
    );
  });

  it("keep assigned roles", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");
    await Roles.createRole("ALL_PERMISSIONS");
    await Roles.createRole("VIEW_PERMISSION");
    await Roles.createRole("EDIT_PERMISSION");
    await Roles.createRole("DELETE_PERMISSION");
    await Roles.addRolesToParent("ALL_PERMISSIONS", "user");
    await Roles.addRolesToParent("EDIT_PERMISSION", "ALL_PERMISSIONS");
    await Roles.addRolesToParent("VIEW_PERMISSION", "ALL_PERMISSIONS");
    await Roles.addRolesToParent("DELETE_PERMISSION", "admin");

    await Roles.addUsersToRoles(users.eve, ["user"]);

    assert.isTrue(await Roles.userIsInRole(users.eve, "VIEW_PERMISSION"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "user" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "user" },
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" }
          ]
        }
      ]
    );

    await Roles.addUsersToRoles(users.eve, "VIEW_PERMISSION");

    assert.isTrue(await Roles.userIsInRole(users.eve, "VIEW_PERMISSION"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "user" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "user" },
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" }
          ]
        },
        {
          role: { _id: "VIEW_PERMISSION" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "VIEW_PERMISSION" }]
        }
      ]
    );

    await Roles.removeUsersFromRoles(users.eve, "user");

    assert.isTrue(await Roles.userIsInRole(users.eve, "VIEW_PERMISSION"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "VIEW_PERMISSION" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "VIEW_PERMISSION" }]
        }
      ]
    );

    await Roles.removeUsersFromRoles(users.eve, "VIEW_PERMISSION");

    assert.isFalse(await Roles.userIsInRole(users.eve, "VIEW_PERMISSION"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      []
    );
  });

  it("adds children of the added role to the assignments", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("ALBUM.ADMIN");
    await Roles.createRole("ALBUM.VIEW");
    await Roles.createRole("TRACK.ADMIN");
    await Roles.createRole("TRACK.VIEW");

    await Roles.addRolesToParent("ALBUM.VIEW", "ALBUM.ADMIN");
    await Roles.addRolesToParent("TRACK.VIEW", "TRACK.ADMIN");

    await Roles.addRolesToParent("ALBUM.ADMIN", "admin");

    await Roles.addUsersToRoles(users.eve, ["admin"]);

    assert.isFalse(await Roles.userIsInRole(users.eve, "TRACK.VIEW"));

    await Roles.addRolesToParent("TRACK.ADMIN", "admin");

    assert.isTrue(await Roles.userIsInRole(users.eve, "TRACK.VIEW"));
  });

  it("removes children of the removed role from the assignments", async function() {
    await createRoles([
      "admin",
      "ALBUM.ADMIN",
      "ALBUM.VIEW",
      "TRACK.ADMIN",
      "TRACK.VIEW"
    ]);

    await Roles.addRolesToParent("ALBUM.VIEW", "ALBUM.ADMIN");
    await Roles.addRolesToParent("TRACK.VIEW", "TRACK.ADMIN");

    await Roles.addRolesToParent("ALBUM.ADMIN", "admin");
    await Roles.addRolesToParent("TRACK.ADMIN", "admin");

    await Roles.addUsersToRoles(users.eve, ["admin"]);

    // track view is part of track.admin && track.admin is part of admin...
    assert.isTrue(await Roles.userIsInRole(users.eve, "TRACK.VIEW"));

    await Roles.removeRolesFromParent("TRACK.ADMIN", "admin");

    assert.isFalse(await Roles.userIsInRole(users.eve, "TRACK.VIEW"));
  });

  it("modify assigned hierarchical roles", async function() {
    await createRoles([
      "admin",
      "user",
      "ALL_PERMISSIONS",
      "VIEW_PERMISSION",
      "EDIT_PERMISSION",
      "DELETE_PERMISSION"
    ]);
    await Roles.addRolesToParent("ALL_PERMISSIONS", "user");
    await Roles.addRolesToParent("EDIT_PERMISSION", "ALL_PERMISSIONS");
    await Roles.addRolesToParent("VIEW_PERMISSION", "ALL_PERMISSIONS");
    await Roles.addRolesToParent("DELETE_PERMISSION", "admin");

    await Roles.addUsersToRoles(users.eve, ["user"]);
    await Roles.addUsersToRoles(users.eve, ["ALL_PERMISSIONS"], "scope");

    assert.isFalse(await Roles.userIsInRole(users.eve, "MODERATE_PERMISSION"));
    assert.isFalse(
      await Roles.userIsInRole(users.eve, "MODERATE_PERMISSION", "scope")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "user" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "user" },
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" }
          ]
        },
        {
          role: { _id: "ALL_PERMISSIONS" },
          scope: "scope",
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" }
          ]
        }
      ]
    );

    await Roles.createRole("MODERATE_PERMISSION");
    await Roles.addRolesToParent("MODERATE_PERMISSION", "ALL_PERMISSIONS");

    assert.isTrue(await Roles.userIsInRole(users.eve, "MODERATE_PERMISSION"));
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "MODERATE_PERMISSION", "scope")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "user" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "user" },
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" },
            { _id: "MODERATE_PERMISSION" }
          ]
        },
        {
          role: { _id: "ALL_PERMISSIONS" },
          scope: "scope",
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" },
            { _id: "MODERATE_PERMISSION" }
          ]
        }
      ]
    );

    await Roles.addUsersToRoles(users.eve, ["admin"]);

    assert.isTrue(await Roles.userIsInRole(users.eve, "DELETE_PERMISSION"));
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "DELETE_PERMISSION", "scope")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "user" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "user" },
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" },
            { _id: "MODERATE_PERMISSION" }
          ]
        },
        {
          role: { _id: "ALL_PERMISSIONS" },
          scope: "scope",
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" },
            { _id: "MODERATE_PERMISSION" }
          ]
        },
        {
          role: { _id: "admin" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "admin" }, { _id: "DELETE_PERMISSION" }]
        }
      ]
    );

    await Roles.addRolesToParent("DELETE_PERMISSION", "ALL_PERMISSIONS");

    assert.isTrue(await Roles.userIsInRole(users.eve, "DELETE_PERMISSION"));
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "DELETE_PERMISSION", "scope")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "user" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "user" },
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" },
            { _id: "MODERATE_PERMISSION" },
            { _id: "DELETE_PERMISSION" }
          ]
        },
        {
          role: { _id: "ALL_PERMISSIONS" },
          scope: "scope",
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" },
            { _id: "MODERATE_PERMISSION" },
            { _id: "DELETE_PERMISSION" }
          ]
        },
        {
          role: { _id: "admin" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "admin" }, { _id: "DELETE_PERMISSION" }]
        }
      ]
    );

    await Roles.removeUsersFromRoles(users.eve, ["admin"]);

    assert.isTrue(await Roles.userIsInRole(users.eve, "DELETE_PERMISSION"));
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "DELETE_PERMISSION", "scope")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "user" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "user" },
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" },
            { _id: "MODERATE_PERMISSION" },
            { _id: "DELETE_PERMISSION" }
          ]
        },
        {
          role: { _id: "ALL_PERMISSIONS" },
          scope: "scope",
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "ALL_PERMISSIONS" },
            { _id: "EDIT_PERMISSION" },
            { _id: "VIEW_PERMISSION" },
            { _id: "MODERATE_PERMISSION" },
            { _id: "DELETE_PERMISSION" }
          ]
        }
      ]
    );

    await Roles.deleteRole("ALL_PERMISSIONS");
    assert.isFalse(await Roles.userIsInRole(users.eve, "DELETE_PERMISSION"));
    assert.isFalse(
      await Roles.userIsInRole(users.eve, "DELETE_PERMISSION", "scope")
    );

    assert.isFalse(await Roles.userIsInRole(users.eve, "MODERATE_PERMISSION"));
    assert.isFalse(
      await Roles.userIsInRole(users.eve, "MODERATE_PERMISSION", "scope")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "user" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "user" }]
        }
      ]
    );
  });

  it("delete role with overlapping hierarchical roles", async function() {
    await Roles.createRole("role1");
    await Roles.createRole("role2");
    await Roles.createRole("COMMON_PERMISSION_1");
    await Roles.createRole("COMMON_PERMISSION_2");
    await Roles.createRole("COMMON_PERMISSION_3");
    await Roles.createRole("EXTRA_PERMISSION_ROLE_1");
    await Roles.createRole("EXTRA_PERMISSION_ROLE_2");

    await Roles.addRolesToParent("COMMON_PERMISSION_1", "role1");
    await Roles.addRolesToParent("COMMON_PERMISSION_2", "role1");
    await Roles.addRolesToParent("COMMON_PERMISSION_3", "role1");
    await Roles.addRolesToParent("EXTRA_PERMISSION_ROLE_1", "role1");

    await Roles.addRolesToParent("COMMON_PERMISSION_1", "role2");
    await Roles.addRolesToParent("COMMON_PERMISSION_2", "role2");
    await Roles.addRolesToParent("COMMON_PERMISSION_3", "role2");
    await Roles.addRolesToParent("EXTRA_PERMISSION_ROLE_2", "role2");

    await Roles.addUsersToRoles(users.eve, "role1");
    await Roles.addUsersToRoles(users.eve, "role2");

    assert.isTrue(await Roles.userIsInRole(users.eve, "COMMON_PERMISSION_1"));
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "EXTRA_PERMISSION_ROLE_1")
    );
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "EXTRA_PERMISSION_ROLE_2")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "role1" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "role1" },
            { _id: "COMMON_PERMISSION_1" },
            { _id: "COMMON_PERMISSION_2" },
            { _id: "COMMON_PERMISSION_3" },
            { _id: "EXTRA_PERMISSION_ROLE_1" }
          ]
        },
        {
          role: { _id: "role2" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "role2" },
            { _id: "COMMON_PERMISSION_1" },
            { _id: "COMMON_PERMISSION_2" },
            { _id: "COMMON_PERMISSION_3" },
            { _id: "EXTRA_PERMISSION_ROLE_2" }
          ]
        }
      ]
    );

    await Roles.removeUsersFromRoles(users.eve, "role2");

    assert.isTrue(await Roles.userIsInRole(users.eve, "COMMON_PERMISSION_1"));
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "EXTRA_PERMISSION_ROLE_1")
    );
    assert.isFalse(
      await Roles.userIsInRole(users.eve, "EXTRA_PERMISSION_ROLE_2")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "role1" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "role1" },
            { _id: "COMMON_PERMISSION_1" },
            { _id: "COMMON_PERMISSION_2" },
            { _id: "COMMON_PERMISSION_3" },
            { _id: "EXTRA_PERMISSION_ROLE_1" }
          ]
        }
      ]
    );

    await Roles.addUsersToRoles(users.eve, "role2");

    assert.isTrue(await Roles.userIsInRole(users.eve, "COMMON_PERMISSION_1"));
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "EXTRA_PERMISSION_ROLE_1")
    );
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "EXTRA_PERMISSION_ROLE_2")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "role1" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "role1" },
            { _id: "COMMON_PERMISSION_1" },
            { _id: "COMMON_PERMISSION_2" },
            { _id: "COMMON_PERMISSION_3" },
            { _id: "EXTRA_PERMISSION_ROLE_1" }
          ]
        },
        {
          role: { _id: "role2" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "role2" },
            { _id: "COMMON_PERMISSION_1" },
            { _id: "COMMON_PERMISSION_2" },
            { _id: "COMMON_PERMISSION_3" },
            { _id: "EXTRA_PERMISSION_ROLE_2" }
          ]
        }
      ]
    );

    await Roles.deleteRole("role2");

    assert.isTrue(await Roles.userIsInRole(users.eve, "COMMON_PERMISSION_1"));
    assert.isTrue(
      await Roles.userIsInRole(users.eve, "EXTRA_PERMISSION_ROLE_1")
    );
    assert.isFalse(
      await Roles.userIsInRole(users.eve, "EXTRA_PERMISSION_ROLE_2")
    );

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "role1" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [
            { _id: "role1" },
            { _id: "COMMON_PERMISSION_1" },
            { _id: "COMMON_PERMISSION_2" },
            { _id: "COMMON_PERMISSION_3" },
            { _id: "EXTRA_PERMISSION_ROLE_1" }
          ]
        }
      ]
    );
  });

  it("set parent on assigned role", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("EDIT_PERMISSION");

    await Roles.addUsersToRoles(users.eve, "EDIT_PERMISSION");

    assert.isTrue(await Roles.userIsInRole(users.eve, "EDIT_PERMISSION"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "admin"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "EDIT_PERMISSION" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "EDIT_PERMISSION" }]
        }
      ]
    );

    await Roles.addRolesToParent("EDIT_PERMISSION", "admin");

    assert.isTrue(await Roles.userIsInRole(users.eve, "EDIT_PERMISSION"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "admin"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "EDIT_PERMISSION" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "EDIT_PERMISSION" }]
        }
      ]
    );
  });

  it("remove parent on assigned role", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("EDIT_PERMISSION");

    await Roles.addRolesToParent("EDIT_PERMISSION", "admin");

    await Roles.addUsersToRoles(users.eve, "EDIT_PERMISSION");

    assert.isTrue(await Roles.userIsInRole(users.eve, "EDIT_PERMISSION"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "admin"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "EDIT_PERMISSION" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "EDIT_PERMISSION" }]
        }
      ]
    );

    await Roles.removeRolesFromParent("EDIT_PERMISSION", "admin");

    assert.isTrue(await Roles.userIsInRole(users.eve, "EDIT_PERMISSION"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "admin"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "EDIT_PERMISSION" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "EDIT_PERMISSION" }]
        }
      ]
    );
  });

  it("adding and removing extra role parents", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("user");
    await Roles.createRole("EDIT_PERMISSION");

    await Roles.addRolesToParent("EDIT_PERMISSION", "admin");

    await Roles.addUsersToRoles(users.eve, "EDIT_PERMISSION");

    assert.isTrue(await Roles.userIsInRole(users.eve, "EDIT_PERMISSION"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "admin"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "EDIT_PERMISSION" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "EDIT_PERMISSION" }]
        }
      ]
    );

    await Roles.addRolesToParent("EDIT_PERMISSION", "user");

    assert.isTrue(await Roles.userIsInRole(users.eve, "EDIT_PERMISSION"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "admin"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "EDIT_PERMISSION" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "EDIT_PERMISSION" }]
        }
      ]
    );

    await Roles.removeRolesFromParent("EDIT_PERMISSION", "user");

    assert.isTrue(await Roles.userIsInRole(users.eve, "EDIT_PERMISSION"));
    assert.isFalse(await Roles.userIsInRole(users.eve, "admin"));

    assert.sameDeepMembers(
      (
        await Roles.getRolesForUser(users.eve, {
          anyScope: true,
          fullObjects: true
        })
      ).map(obj => {
        delete obj._id;
        return obj;
      }),
      [
        {
          role: { _id: "EDIT_PERMISSION" },
          scope: null,
          user: { _id: users.eve },
          inheritedRoles: [{ _id: "EDIT_PERMISSION" }]
        }
      ]
    );
  });

  it("cyclic roles", async function() {
    await Roles.createRole("admin");
    await Roles.createRole("editor");
    await Roles.createRole("user");

    await Roles.addRolesToParent("editor", "admin");
    await Roles.addRolesToParent("user", "editor");

    testError(() => Roles.addRolesToParent("admin", "user"), /form a cycle/);
  });

  it("userIsInRole returns false for unknown roles", async function() {
    await createRoles(roles);
    await Roles.addUsersToRoles(users.eve, ["admin", "user"]);
    await Roles.addUsersToRoles(users.eve, ["editor"]);

    assert.isFalse(await Roles.userIsInRole(users.eve, "unknown"));
    assert.isFalse(await Roles.userIsInRole(users.eve, []));
    assert.isFalse(await Roles.userIsInRole(users.eve, null));
    assert.isFalse(await Roles.userIsInRole(users.eve, undefined));

    assert.isFalse(
      await Roles.userIsInRole(users.eve, "unknown", { anyScope: true })
    );
    assert.isFalse(await Roles.userIsInRole(users.eve, [], { anyScope: true }));
    assert.isFalse(
      await Roles.userIsInRole(users.eve, null, { anyScope: true })
    );
    assert.isFalse(
      await Roles.userIsInRole(users.eve, undefined, { anyScope: true })
    );

    assert.isFalse(
      await Roles.userIsInRole(
        users.eve,
        ["Role1", "Role2", undefined],
        "GroupName"
      )
    );
  });

  it("userIsInRole returns false if user is a function", async function() {
    await Roles.createRole("admin");
    await Roles.addUsersToRoles(users.eve, ["admin"]);

    assert.isFalse(await Roles.userIsInRole(() => {}, "admin"));
  });

  describe("isParentOf", async function() {
    it("returns false for unknown roles", async function() {
      await Roles.createRole("admin");

      assert.isFalse(await Roles.isParentOf("admin", "unknown"));
      assert.isFalse(await Roles.isParentOf("admin", null));
      assert.isFalse(await Roles.isParentOf("admin", undefined));

      assert.isFalse(await Roles.isParentOf("unknown", "admin"));
      assert.isFalse(await Roles.isParentOf(null, "admin"));
      assert.isFalse(await Roles.isParentOf(undefined, "admin"));
    });

    it("returns false if role is not parent of", async function() {
      await Roles.createRole("admin");
      await Roles.createRole("editor");
      await Roles.createRole("user");
      await Roles.addRolesToParent(["editor"], "admin");
      await Roles.addRolesToParent(["user"], "editor");

      assert.isFalse(await Roles.isParentOf("user", "admin"));
      assert.isFalse(await Roles.isParentOf("editor", "admin"));
    });

    it("returns true if role is parent of the demanded role", async function() {
      await Roles.createRole("admin");
      await Roles.createRole("editor");
      await Roles.createRole("user");
      await Roles.addRolesToParent(["editor"], "admin");
      await Roles.addRolesToParent(["user"], "editor");

      assert.isTrue(await Roles.isParentOf("admin", "user"));
      assert.isTrue(await Roles.isParentOf("editor", "user"));
      assert.isTrue(await Roles.isParentOf("admin", "editor"));

      assert.isTrue(await Roles.isParentOf("admin", "admin"));
      assert.isTrue(await Roles.isParentOf("editor", "editor"));
      assert.isTrue(await Roles.isParentOf("user", "user"));
    });
  });
});
