import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
import get from "lodash.get";
import groupBy from "lodash.groupby";
import { Trans } from "react-i18next";
import { Button, Table, Icon, Checkbox, Message, Segment } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { settingsSectionProps } from "../../utils/propTypes";

import { UPDATE_USER_PREFERENCES } from "../../utils/queries";

import allNotifications from "/imports/api/notifications/notifications.json";

const organizeNotifications = () => {
  const list = allNotifications.filter(({ mail, notification }) => mail || notification);
  const lvl = groupBy(list, "group");
  Object.entries(lvl).forEach(([k, v]) => {
    lvl[k] = groupBy(v, "subGroup");
  });
  return lvl;
};

// all by default "on"
const NotificationsForm = ({ ...props }) => {
  const { notificationSetting, setSetting } = props;
  const notificationStructure = React.useMemo(organizeNotifications, []);

  const toggleSetting = (group, subGroup, topic, checked) => {
    const key = `${group}|${subGroup}`;
    setSetting({
      ...notificationSetting,
      [key]: {
        ...notificationSetting[key],
        [topic]: checked
      }
    });
  };

  const unsubscribeAll = () => {
    const unsubscribed = [];

    Object.entries(notificationStructure).forEach(([group, vGrp]) => {
      Object.entries(vGrp).forEach(([subGroup]) => {
        unsubscribed[`${group}|${subGroup}`] = { mail: false, app: false };
      });
    });
    setSetting(unsubscribed, true);
  };

  const getValue = (group, subGroup, topic) => {
    // true by default
    return get(notificationSetting, [`${group}|${subGroup}`, topic]) !== false;
  };
  return (
    <div>
      <Table attached="top">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell colSpan={2} />
            <Table.Cell
              textAlign="center"
              width={3}
              content={<Trans i18nKey="settings.user.preferences.notifications.app" />}
            />
            <Table.Cell
              textAlign="center"
              width={3}
              content={<Trans i18nKey="settings.user.preferences.notifications.mail" />}
            />
          </Table.Row>
        </Table.Header>
      </Table>
      {Object.entries(notificationStructure)
        .sort((a, b) => a[0] - b[0])
        .map(([group, vGrp], i) => (
          <Table key={i} attached>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell colSpan={4} content={<b>{group}</b>} />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {Object.entries(vGrp)
                .sort((a, b) => a[0] - b[0])
                .map(([subGroup, vSubGrp], j) => {
                  const type = get(vSubGrp, [0, "type"], "transactional");

                  return (
                    <Table.Row key={j}>
                      <Table.Cell
                        collapsing
                        content={
                          <Icon name={type === "transactional" ? "exchange" : "clock outline"} />
                        }
                      />
                      <Table.Cell content={subGroup} />
                      <Table.Cell
                        textAlign="center"
                        width={3}
                        content={
                          <Checkbox
                            toggle
                            label=""
                            checked={getValue(group, subGroup, "app")}
                            onChange={(_, { checked }) =>
                              toggleSetting(group, subGroup, "app", checked)
                            }
                          />
                        }
                      />
                      <Table.Cell
                        textAlign="center"
                        width={3}
                        content={
                          <Checkbox
                            toggle
                            label=""
                            checked={getValue(group, subGroup, "mail")}
                            onChange={(_, { checked }) =>
                              toggleSetting(group, subGroup, "mail", checked)
                            }
                          />
                        }
                      />
                    </Table.Row>
                  );
                })}
            </Table.Body>
          </Table>
        ))}
      <Segment clearing>
        <Button
          content={<Trans i18nKey="settings.user.preferences.notifications.unsubscribe" />}
          onClick={unsubscribeAll}
        />
      </Segment>
    </div>
  );
};

const SettingsUserNotifications = ({ ...props }) => {
  const client = useApolloClient();
  const { title, icon, user } = props;
  const updateNotifications = async notifications => {
    try {
      const { errors } = await client.mutate({
        mutation: UPDATE_USER_PREFERENCES,
        variables: { updates: { notifications } }
      });
      if (errors?.[0]) throw errors[0];
    } catch (err) {
      toast.error(err.message);
    }
  };

  // temporary store the settings in object:
  const notifObj = {};
  (user?.preferences?.notifications || []).forEach(({ group, subGroup, ...pref }) => {
    notifObj[`${group}|${subGroup}`] = pref;
  });
  const [notificationSetting, updateSetting] = useState(notifObj);
  const [hasUpdates, setHasUpdates] = useState(false);

  // on Save make an array again
  function saveNotifications(updates) {
    const notifications = Object.entries(updates || notificationSetting).map(([key, v]) => {
      const [group, subGroup] = key.split("|");
      const defaultConf = allNotifications.find(
        ({ group: iGroup, subGroup: iSubGroup }) => iGroup === group && iSubGroup === subGroup
      );

      const update = {
        ...(v.app != null && { app: v.app }),
        ...(v.mail != null && { mail: v.mail })
      };

      const conf = {
        group,
        subGroup,
        app: defaultConf?.notification,
        mail: defaultConf?.mail,
        ...update
      };

      return conf;
    });
    setHasUpdates(false);
    updateNotifications(notifications);
  }

  function setSetting(updates, direct) {
    updateSetting(updates);
    if (direct) {
      updateNotifications(updates);
      setHasUpdates(false);
    } else {
      setHasUpdates(true);
    }
  }

  return (
    <IconSegment
      title={title}
      icon={icon}
      body={
        <>
          <Message
            info
            content={<Trans i18nKey="settings.user.preferences.notifications.info" />}
          />

          <div style={{ visibility: hasUpdates ? "visible" : "hidden" }}>
            <Message
              warning
              content={<Trans i18nKey="settings.user.preferences.notifications.save" />}
            />
          </div>

          <NotificationsForm {...props} {...{ notificationSetting, setSetting }} />
        </>
      }
      footer={
        <>
          <div>
            <Button
              primary
              content={<Trans i18nKey="general.submit" />}
              onClick={() => {
                saveNotifications(notificationSetting);
              }}
            />
          </div>
        </>
      }
    />
  );
};

SettingsUserNotifications.propTypes = {
  ...settingsSectionProps
};

export default SettingsUserNotifications;
