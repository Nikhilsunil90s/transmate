import { portalService } from "../services/portalService";

const debug = require("debug")("portal:resolver");

export const resolvers = {
  PortalProfile: {
    contacts: parent =>
      (parent.contacts || []).filter(({ status }) => status !== "doNotContact")
  },
  Query: {
    async getPortalData(root, args) {
      const { id, userKey } = args.input;
      debug({ userKey });
      const srv = portalService({ id, userKey });
      await srv.getDoc();
      srv.flagUserKey();

      debug("index and user %o", {
        index: srv.contactIndex,
        activeUser: srv.activeUser
      });
      return {
        profile: srv.profile,
        canEdit: srv.contactIndex > -1,
        activeUser: srv.activeUser
      };
    }
  },
  Mutation: {
    async updatePortalData(root, args) {
      const { id, userKey, updates } = args.input;

      const srv = portalService({ id, userKey });
      await srv.getDoc(true);
      srv.validateUserKey();
      await srv.update({ updates });
      return srv.getUIResponse();
    },
    async unSubscribePortalContact(root, args) {
      const { id, userKey, email } = args.input;

      const srv = portalService({ id, userKey });
      await srv.getDoc(true);
      srv.validateUserKey();
      await srv.unsubscribe({ email });

      return true;
    }
  }
};
