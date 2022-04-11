import get from "lodash.get";
import { SecurityCheck } from "./_securityCheck";

class CheckConversationSecurity extends SecurityCheck {
  constructor({ conversation }, { accountId, userId }) {
    super({ accountId, userId });

    // specific here:
    this.conversation = conversation || {};
    this.status = get(conversation, ["status"]);

    // this.role = getRoleForShipm(shipment);
    // this.accountRoleInShipment = getRoleForShipment(shipment);
    // this.update = update || {};
  }

  can({ action }) {
    switch (action) {
      case "startConversation":
        this.allowed = [true].every(x => x);
        break;
      default:
        this.allowed = false;
    }
    return this;
  }
}

export { CheckConversationSecurity };
