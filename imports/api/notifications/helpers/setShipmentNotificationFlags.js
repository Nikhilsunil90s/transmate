import get from "lodash.get";
import moment from "moment";
import { Meteor } from "meteor/meteor";
import { Shipment } from "/imports/api/shipments/Shipment";
import { AllAccounts } from "/imports/api/allAccounts/AllAccounts";
import { User } from "/imports/api/users/User";
import { check } from "/imports/utils/check.js";

import notificationMap from "/imports/api/notifications/notifications.json";
import { shipmentAlertFillOut } from "/imports/api/notifications/server/hooks/shipment-alert-fill-out.js";
import { shipmentAlertWillLoad } from "/imports/api/notifications/server/hooks/shipment-alert-will-load.js";

const debug = require("debug")("shipment:set-notifications");

const cronNotifications = notificationMap.filter(({ type }) => type === "cron");

//#region helper functions
async function getUsers(userIds = []) {
  const users = await User.where(
    { _id: { $in: userIds } },
    { fields: { "preferences.notifications": 1 } }
  );
  return users.map(usr => ({
    userId: usr._id,
    userPreference: get(usr, "preferences.notifications", [])
  }));
}
async function getAccountUsers(accountId) {
  const account = await AllAccounts.first(
    { _id: accountId },
    { fields: { userIds: 1 } }
  );
  return getUsers(account?.userIds || []);
}
const calculateSendAt = ({ key, shipment, offSet }) => {
  const offSetMins = offSet || 720;
  switch (key) {
    case "shipment-alert-will-load":
      return moment(get(shipment, "pickup.datePlanned"))
        .subtract(offSetMins, "minutes")
        .toDate();

    case "shipment-alert-fillout":
      return moment(get(shipment, "pickup.datePlanned"))
        .add(offSetMins, "minutes")
        .toDate();
    default:
      return get(shipment, "pickup.datePlanned");
  }
};

//#endregion

/**
 * Set notifications array in shipment for (future) cron notifications
 * has entry points to set:
 * setAfterCreation(), setAfterCarrierAssignment(carrierId), setAfterPartnerUpdate(partnerId, role)
 * has entry point to modify / ofset:
 * updateAfterShipmentChange()
 *
 * when setting notification, keep offset in the object to easily offset after changes
 *
 * adds a role in the shipment
 * roles: ["owner", "carrier", "partner"]
 *
 * notifications object:
 * {key: "notification-key", accountId, userId, role, sendAt: <ts>, sent: <ts>, app, mail, offSet:<mins>}
 * @param {{shipmentId: String} } param0
 * @module setShipmentNotificationFlags
 */
export const setShipmentNotificationFlags = ({ shipmentId }) => ({
  shipmentId,
  shipment: {},
  notifications: [],
  async getShipmentInfo() {
    this.shipment =
      (await Shipment.first(this.shipmentId, {
        fields: {
          // default fields:
          notifications: 1, // existing notifications []
          pickup: 1,
          delivery: 1,

          // depending call?
          plannerIds: 1,
          created: 1,
          accountId: 1,
          shipperId: 1,
          consigneeId: 1
        }
      })) || {};

    this.notifications = this.shipment.notifications || [];
  },

  /**
   * @method sortOutNotifications
   * @param {String[]} users list of userIds
   * @param {String} accountId accountId
   * @param {String} role ["owner", "carrier", "partner"]
   * @for setShipmentNotificationFlags
   *
   */
  sortOutNotifications(users, accountId, role) {
    const updatedNotifications = this.notifications;

    cronNotifications
      .filter(n => !n.restrictToRoles || n.restrictToRoles.includes(role))
      .forEach(({ key, group, subGroup }) => {
        // users that want it does NOT have false in the prefs:
        users.forEach(({ userId, userPreference }) => {
          // 1. get preference:
          const { app = true, mail = true, offSet } =
            userPreference.find(
              pref => pref.group === group && pref.subGroup === subGroup
            ) || {};

          if (app || mail) {
            // 2. calculate stuff:
            const sendAt = calculateSendAt({
              key,
              shipment: this.shipment,
              offSet
            });

            // 3. modify or update notification
            const idx = updatedNotifications.findIndex(
              n => n.key === key && n.userId === userId && !n.sent
            );

            if (idx > -1) {
              updatedNotifications[idx] = {
                ...updatedNotifications[idx],
                sendAt,
                offSet,
                app,
                mail
              };
            } else {
              updatedNotifications.push({
                key,
                role,
                accountId,
                userId,
                sendAt,
                offSet,
                app,
                mail
              });
            }
          }
        });
      });

    this.notifications = updatedNotifications;
  },

  updateNotifications() {
    return Shipment._collection.update(
      { _id: this.shipmentId },
      { $set: { notifications: this.notifications } }
    );
  },

  /**
   * Will setup notifications for owners
   * @method setAfterCreation
   * @async
   */
  async setAfterCreation() {
    await this.getShipmentInfo();

    const {
      accountId,
      plannerIds = [],
      created: { by: creatorId }
    } = this.shipment;

    const ownerUsers = await getUsers([creatorId, ...plannerIds]);
    this.sortOutNotifications(ownerUsers, accountId, "owner");
    await this.updateNotifications();
  },

  /**
   * Will setup notifications for carriers
   * @method setAfterCarrierAssignment
   * @async
   */
  async setAfterCarrierAssignment(carrierId) {
    await this.getShipmentInfo();

    const carrierUsers = await getAccountUsers(carrierId);

    this.sortOutNotifications(carrierUsers, carrierId, "carrier");
    await this.updateNotifications();
  },

  /**
   * Will setup notifications for other partners
   * @method setAfterPartnerUpdate
   * @async
   */
  async setAfterPartnerUpdate(partnerId, role) {
    await this.getShipmentInfo();

    // if partnerId is root accountId -> skip
    if (this.shipment.accountId !== partnerId) {
      const carrierUsers = await getAccountUsers(partnerId);
      this.sortOutNotifications(carrierUsers, partnerId, role);
      await this.updateNotifications();
    }
  },

  /**
   * Will remove notifications for accounts
   * e.g. when a carrier has been removed or other partner has been changed
   * @method removeNotificationsForAccounts
   * @async
   */
  async removeNotificationsForAccounts(accountIds) {
    await this.getShipmentInfo();

    accountIds.forEach(accountId => {
      // if partnerId is root accountId -> skip
      if (this.shipment.accountId !== accountId) {
        this.notifications = this.notifications.filter(
          n => !(n.accountId === accountId && !n.sent)
        );
      }
    });

    await this.updateNotifications();
  },

  /**
   * Will update time stamps for open notifications
   * @example
   * // changes notification "will load"
   * // shipment pickup.location.plannedDate has changed from today to tomorrow
   * // the offset that was stored in the doc is kept...
   * @method updateAfterShipmentChange
   * @async
   */
  async updateAfterShipmentChange() {
    // check open crons, update date based on shipmentInfo
    await this.getShipmentInfo();

    this.notifications = this.notifications.map(n => {
      if (!n.sent) {
        return {
          ...n,
          sendAt: calculateSendAt({
            key: n.key,
            shipment: this.shipment,
            offSet: n.offSet
          })
        };
      }
      return n;
    });

    await this.updateNotifications();
  },

  /**
   * Will get all non-processed notifications
   * @method getAndFlag
   * @returns {Object[]} toNotify
   *
   * @private
   * @async
   */
  async getAndFlag() {
    check(this.shipmentId, String);

    // get not-processed notifications, return list of

    const now = new Date();
    debug("find notifications for ", this.shipmentId);

    // const obj = await Shipment.first(this.shipmentId);
    // debug("shipment ", this.shipmentId, obj);
    const update = await Shipment._collection.rawCollection().findOneAndUpdate(
      {
        _id: this.shipmentId,
        notifications: { $exists: true }
      },
      {
        $set: {
          "notifications.$[notification].sent": now
        }
      },
      {
        projection: { notifications: 1 },
        upsert: false,
        arrayFilters: [
          {
            "notification.sendAt": { $lte: now },
            "notification.sent": { $exists: false }
          }
        ]
      }
    );
    debug("update,%o", update);
    const notifications = get(update, "value.notifications", []);
    debug("shipment notifications found,%o", notifications);
    const toNotify = notifications.filter(
      el => el && el.sendAt < new Date() && !el.sent
    );

    // return only the ones that were not yet send in the past
    debug("return toNotify,%o", toNotify);
    return toNotify;
  },

  /**
   * Will execute each notification that needs to be sent
   * @method processNotifications
   * @returns {Object[]} toNotify
   *
   * @async
   */
  async processNotifications() {
    if (!Meteor.isServer) return null;
    const toNotify = await this.getAndFlag();
    debug("processNotifications , toNotify %o", toNotify);

    // loop over the list and notify the users by mail or by app
    if (!Array.isArray(toNotify))
      throw Error("no array notifications to process");

    // send back returns (will be promisses)
    return toNotify.map(notificationObj => {
      const notification = { ...notificationObj, shipmentId: this.shipmentId };
      switch (notification.key) {
        case "shipment-alert-will-load":
          return shipmentAlertWillLoad(notification);

        case "shipment-alert-fillout":
          return shipmentAlertFillOut(notification);

        default:
          debug(
            "notification %o, was not linked to a notification",
            notification
          );
          return null;
      }
    });
  }
});
