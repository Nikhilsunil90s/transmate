import { User } from "/imports/api/users/User";
import notificationMap from "/imports/api/notifications/notifications.json";

export const getCategoryForNotification = key =>
  notificationMap.find(({ key: notificationKey }) => notificationKey === key) ||
  {};

/** checks user notification preference and returns true if notification needs to be created
 * notification preferences or ON by default so we check if it is explicitly false!
 * @param {String} key notification key from notifications.json
 * @param {String} type mail || app
 * @param {String} userId userId to check
 * @return {Boolean} returns true when they want a notification
 */
export const checkUserPreference = async (key, type, userId) => {
  // 1. info from JSON
  const { group, subGroup } = getCategoryForNotification(key);

  // 2. get userInfo
  const test = await User.first(
    {
      _id: userId,
      "preferences.notifications.group": group,
      "preferences.notifications.subGroup": subGroup,
      [`preferences.notifications.${type}`]: false
    },
    { fields: { _id: 1 } }
  );
  return !test;
};

/** checks notification preferences without DB call
 * notification preferences or ON by default so we check if it is explicitly false!
 * @param {string} key
 * @param {"app"|"mail"} type
 * @param {Object} user
 * @returns {boolean}
 */
export const checkUserPreferenceDirect = (key, type, user) => {
  // 1. info from JSON
  const { group, subGroup } = getCategoryForNotification(key);

  return !(user?.preferences?.notifications || []).some(
    ({ group: nGroup, subGroup: nSubGroup, [type]: nTypeCheck }) =>
      nGroup === group && nSubGroup === subGroup && nTypeCheck === false
  );
};
