/* eslint-disable no-underscore-dangle */
import jwt from "jsonwebtoken";

import { Accounts } from "meteor/accounts-base";
import { User } from "/imports/api/users/User";

export class TokenGenerationService {
  constructor({ jswt }) {
    this.jwt = jswt;
  }

  async generateToken(route, userId, reason, expiresIn = "7d") {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 10)
      throw Error("Missing secret! set a long jwt_key in environemnt!");
    const user = User.profile(userId);
    if (!user) throw Error("user unknown!");
    const meteorToken = Accounts._generateStampedLoginToken();
    await Accounts._insertLoginToken(userId, meteorToken);
    const token = this.jwt.sign(
      { route, userId, reason },
      process.env.JWT_SECRET,
      {
        expiresIn
      }
    );
    return token;
  }

  async decodeToken(token) {
    try {
      if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 10)
        throw Error("Missing secret! set a long jwt_key in metetor settings!");
      const tokenContent = this.jwt.verify(token, process.env.JWT_SECRET);
      const { route, userId, reason } = tokenContent;
      const user = await User.profile(userId);
      if (!user) throw Error("user unknown!");
      let meteorToken;

      // we have a login attempt via token, set the user email to verified
      user.update({ "emails.0.verified": true });
      if (reason === "login-redirect") {
        meteorToken = Accounts._generateStampedLoginToken();
        await Accounts._insertLoginToken(userId, meteorToken);
      }
      return { route, meteorToken, userId, reason };
    } catch (err) {
      return { err };
    }
  }
}

export default new TokenGenerationService({ jswt: jwt });
