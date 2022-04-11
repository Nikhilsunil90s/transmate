const SecurityChecks = class SecurityChecks {
  static checkLoggedIn(userId) {
    if (!userId) {
      throw new Error(
        "not-authorized: You must be logged in to perform this action"
      );
    }
  }

  static checkIfExists(doc) {
    if (!doc) {
      throw new Error("not-found: Document not found in the database");
    }
  }
};

export default SecurityChecks;
