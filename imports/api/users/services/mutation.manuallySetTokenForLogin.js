import TokenGenerationService from "../../allAccounts/server/tokenGeneationSrv";

export const manuallySetTokenForLogin = ({ accountId, userId }) => ({
  accountId,
  userId,

  /**
   *
   * @param {{route: {page: String, _id: String, section: String}, userId: String}} param0
   */
  async setToken({ route, userId: tokenUserId }) {
    const tokenString = await TokenGenerationService.generateToken(
      route,
      tokenUserId,
      "login-redirect"
    );
    const tokenLink = Meteor.absoluteUrl(`login-token/${tokenString}`);

    // normal link
    const link = Meteor.absoluteUrl(
      `${route.page}/${route._id}/${route.section}`
    );

    return { link, tokenLink };
  }
});
