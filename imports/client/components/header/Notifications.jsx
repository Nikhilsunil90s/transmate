import React from "react";
import { useTranslation, Trans } from "react-i18next";
import { useQuery, useApolloClient } from "@apollo/client";
import gql from "graphql-tag";
import classNames from "classnames";
import moment from "moment";
import { Icon, Dropdown, Label } from "semantic-ui-react";
import useRoute from "../../router/useRoute";
import { markAllNotificationsAsRead } from "../../../utils/UI/markNotificationsRead";

const debug = require("debug")("header:notifications");

export const GET_MY_NOTIFICATIONS = gql`
  query getNotifications {
    notifications: getNotifications {
      id
      type
      event
      data
      created
      read
    }
  }
`;

const REMOVE_NOTIFICATIONS = gql`
  mutation removeNotifications($ids: [String]!) {
    removeNotifications(ids: $ids)
  }
`;

// uses formatting in translation -> must be <Trans />
const Tag = ({ notification, onClick }) => {
  const { t } = useTranslation();
  const translate = (data = {}) => {
    const nData = { ...data };

    if (data.note) {
      nData.note = t(`shipment.notes.${data.note}`);
    }
    if (data.reference) {
      nData.reference = t(`shipment.references.${data.reference}`);
    }
    if (data.document) {
      nData.document = t(`shipment.form.document.types.${data.document}`);
    }
    nData.ref = data.title || data.reference || data.priceRequestId || data.documentId; // use title if available, price request specific
    return nData;
  };

  // debug("render notification,%o", notification);
  // debug("values,%o", translate(notification.data));
  return (
    <Trans
      i18nKey={`notification.${notification.type}.${notification.event}`}
      values={translate(notification.data)}
    />
  );
};

const NotificationsHeader = () => {
  const client = useApolloClient();
  const { t } = useTranslation();
  const { data = {}, refetch } = useQuery(GET_MY_NOTIFICATIONS, { fetchPolicy: "no-cache" });
  const { goRoute } = useRoute();
  debug("NotificationsHeader data %o", data);
  function gotoNotification(notification) {
    remove(notification);
    switch (notification.type) {
      case "shipment":
      case "non-conformance":
      case "document":
      case "stage":
        return goRoute("shipment", { _id: notification.data.shipmentId });

      case "partnership":
        return goRoute("partner", { _id: notification.data.accountId });

      case "price-list":
        return goRoute("priceList", { _id: notification.data.priceListId });

      case "price-request":
        return goRoute("priceRequestEdit", {
          _id: notification.data.priceRequestId,
          section: notification.event === "bidReceived" ? "analytics" : "data"
        });

      case "tender":
        return goRoute("tender", { _id: notification.data.tenderId });

      case "import":
        return goRoute("import", { _id: notification.data.importId });

      default:
        return null;
    }
  }

  function remove(notification) {
    client
      .mutate({ mutation: REMOVE_NOTIFICATIONS, variables: { ids: [notification.id] } })
      .then(() => refetch())
      .catch(err => console.error(err));
  }


  

  let notifications = (data || {}).notifications || [];
  debug("notifications before sort %o", notifications);

  async function readAllNotifications() {
    const notificationIds = notifications.map(notification => (notification.id))    
    await markAllNotificationsAsRead(notificationIds, client);    
    refetch();
  }
  // copy array because it is "freezed" and can not be sorted.
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
  // we do sort at find query.
  notifications = [...notifications].sort((a, b) => b.created - a.created);

  const num = notifications.length;
  const numUnread = notifications.filter(({ read }) => !read).length;

  return (
    <Dropdown
      simple
      item
      compact
      pointing="top right"
      className={classNames("notifications", { unread: numUnread > 0 })}
      icon={null}
      trigger={
        <div className="item icon counter">
          <Icon className="outline" name="alarm" />
          <Label size="mini" circular floating color="teal" content={numUnread} />
        </div>
      }
    >
      <Dropdown.Menu>
        <Dropdown.Header>
          {num} {t("notifications.title")}, {numUnread} {t("notifications.unread")}, 
          {numUnread > 0 && <a onClick={readAllNotifications} href="#"> {t("notifications.markAsRead")}</a>}
           
        </Dropdown.Header>
        <div className="notifications">
          {notifications.map((notification, i) => {
            return (
              <Dropdown.Item
                key={i}
                className={classNames("item", { read: notification.read })}
                onClick={() => gotoNotification(notification)}
              >
                <div className="notification">
                  {/* {notification.read && (
                    <span className="remove" title={moment(notification.created).format("LLL")}>
                      <Icon
                        name="remove"
                        style={{ cursor: "pointer" }}
                        onClick={() => remove(notification)}
                        aria-hidden={false}
                        aria-label=""
                        color="red"
                      />
                    </span> 
                  )} */}
                  <span >
                  <Tag {...{ notification }}  />
                  </span>
                  <span className="date" title={moment(notification.created).format("LLL")}>
                    {moment(notification.created).fromNow()}
                  </span>
                </div>
              </Dropdown.Item>
            );
          })}
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationsHeader;
