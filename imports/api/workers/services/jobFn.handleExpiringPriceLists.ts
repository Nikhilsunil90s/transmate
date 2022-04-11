/* eslint-disable camelcase */
import { Meteor } from "meteor/meteor";
import { User } from "/imports/api/users/User";
import { PriceList } from "/imports/api/pricelists/PriceList";
import moment from "moment";
import { AllAccounts } from "../../allAccounts/AllAccounts";
import { EmailBuilder } from "../../email/server/send-email";
import { Notification } from "../../notifications/Notification";

const EXPIRE_TRESHOLD = 10; // days

const getId = ({ id }) => id;

export const handleExpiringPriceLists = async (cronLog = []) => {
  const validTresholdDate = moment()
    .endOf("day")
    .add(EXPIRE_TRESHOLD, "days")
    .toDate();

  const priceListsAboutToExpire = await PriceList.where(
    {
      validTo: { $lte: validTresholdDate },
      status: { $in: ["active", "for-approval"] },
      deleted: { $ne: true },
      type: "contract",
      "notifications.isExpiring": { $exists: false }
    },
    {
      fields: {
        validTo: 1,
        created: 1,
        creatorId: 1,
        sellerId: 1,
        customerId: 1,
        title: 1
      }
    }
  );

  // notify users
  cronLog.push(`price lists about to expire:${priceListsAboutToExpire.length}`);
  await Promise.all(
    priceListsAboutToExpire.map(async pl => {
      // created.by:
      const user = await User.profile(pl.created.by);
      const link = Meteor.absoluteUrl(`price-list/${pl.id}`);

      const partnerId =
        pl.creatorId !== pl.sellerId ? pl.sellerId : pl.customerId;
      const partnerName = (
        await AllAccounts.first(
          partnerId,
          AllAccounts.publishMyFields({ accountId: pl.creatorId })
        )
      )?.getName();

      new EmailBuilder({
        to: user.getEmail(),

        // from: sender.getEmail(),
        // replyTo: sender.getEmail(),
        subject: `PriceList ${pl.title} will expire`,
        templateName: "priceListExpiring",
        accountId: pl.creatorId,
        data: {
          to: {
            accountId: pl.creatorId,
            email: user.getEmail(),
            name: user.getName()
          },
          id: pl.id,
          title: pl.title,
          expiresIn: `${moment(pl.validTo).fromNow()}`,
          expiresOn: `${moment(pl.validTo).format("D MMMM HH")}`,
          createOn: `${moment(pl.created.at).format("")}`,
          link,
          partnerId,
          partnerName
        },
        meta: {
          userId: user._id,
          accountId: pl.creatorId,
          type: "priceList",
          id: pl.id
        }
      }).scheduleMail();

      return PriceList._collection.update(
        { _id: pl.id },
        { $set: { "notifications.isExpiring": new Date() } }
      );
    })
  );

  // priceLists that are expired && have a notifiction triggered
  const priceListsToArchive = await PriceList.where(
    {
      validTo: { $lte: new Date() },
      status: { $in: ["active", "for-approval"] },
      deleted: { $ne: true },
      type: "contract",
      "notifications.isExpiring": { $exists: true } // already notified
    },
    {
      fields: { created: 1, sellerId: 1, title: 1 }
    }
  );

  // add a simple notification that the PL has been archived:
  cronLog.push(`price lists that are expired:${priceListsToArchive.length}`);
  await Promise.all(
    priceListsToArchive.map(({ id, created, title }) =>
      Notification.create_async({
        userId: created.by,
        type: "price-list",
        event: "archived",
        data: {
          priceListId: id,
          title
        }
      })
    )
  );

  // archive the rates:
  await PriceList._collection.update(
    {
      _id: { $in: priceListsToArchive.map(getId) }
    },
    { $set: { status: "archived" } }
  );

  return {
    expiring: priceListsAboutToExpire.map(getId),
    archived: priceListsToArchive.map(getId)
  };
};
