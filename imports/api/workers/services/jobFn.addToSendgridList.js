/* eslint-disable camelcase */
import { User } from "/imports/api/users/User";
import moment from "moment";
import fetch from "@adobe/node-fetch-retry";

function toTitleCase(str) {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

const SENDGRID_URL = "https://sendgrid.com/v3";
const SENDGRID_LISTS = [
  "49555af9-6287-49f2-a4e6-3e5934ec39d9" // users
];

export const addToSendgridList = async (cronLog = []) => {
  if (!process.env.SENDGRID_MARKETING_KEY)
    throw new Error("No sendgrid token found!");
  const fromDate = moment()
    .startOf("day")
    .subtract(2, "weeks")
    .toDate();
  let usersToAdd = await User.where({
    createdAt: { $gte: fromDate },
    "emails.verified": true,
    addedToSendgridList: { $ne: true }
  });

  usersToAdd = usersToAdd.map(
    ({ _id: userId, profile, emails, createdAt }) => ({
      userId,
      createdAt,
      email: emails[0].address,
      first_name: toTitleCase(profile.first),
      last_name: toTitleCase(profile.last)
    })
  );

  if (usersToAdd.length) {
    cronLog.push(`users found: ${usersToAdd.length}`);

    const response = await fetch(`${SENDGRID_URL}/marketing/contacts`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env.SENDGRID_MARKETING_KEY}`
      },
      body: JSON.stringify({
        list_ids: SENDGRID_LISTS,
        contacts: usersToAdd.map(
          ({ email, createdAt, userId, first_name, last_name }) => ({
            email,
            first_name,
            last_name,
            custom_fields: {
              e1_T: userId, // name: 'TM_userId',
              e2_D: createdAt // memberSince
            }
          })
        )
      })
    });
    const responseJson = await response.json();
    if (responseJson.errors) throw responseJson.errors;

    await User._collection.update(
      { _id: { $in: usersToAdd.map(({ userId }) => userId) } },
      { $set: { addedToSendgridList: true } }
    );
    return { responseJson, usersToAdd };
  }
  return { res: "no users added" };
};
