import React, { useContext } from "react";
import LoginContext from "/imports/client/context/loginContext";
import { useQuery } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { Container, Dropdown, Grid, Menu } from "semantic-ui-react";
import { useParams } from "react-router-dom";
import {
  SettingsUserProfile,
  SettingsUserNotifications,
  SettingsUserSecurity,
  SettingsUserPreferences
} from "./sections/user";

import {
  AccountPortal,
  AccountEntities,
  AccountUsers,
  AccountActivity,
  AccountBilling
} from "./sections/accountAdmin";

import { SettingsFuel, SettingsMasterData } from "./sections/accountData";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import { initializeSecurity } from "./utils/security";
import { GET_ACCOUNT_AND_USER_DATA } from "./utils/queries";
import { settingsPageProps } from "./utils/propTypes";
import { generateRoutePath } from "../../router/routes-helpers";

const debug = require("debug")("settings");

const SETTINGS = require("./allSettings.json");

const TEMPLATES = {
  SettingsUserProfile,
  SettingsUserNotifications,
  SettingsUserSecurity,
  SettingsUserPreferences,

  // account:
  AccountPortal,
  AccountEntities,
  AccountUsers,
  AccountActivity,
  AccountBilling,

  // data:
  SettingsFuel,
  SettingsMasterData
};

const Component = ({ template, ...props }) => {
  if (typeof TEMPLATES[template] !== "undefined") {
    return React.createElement(TEMPLATES[template], { ...props });
  }
  return React.createElement(() => <div>not found</div>);
};

export const SettingsPage = ({ ...props }) => {
  const { t } = useTranslation();
  const { section } = props;

  const setting = SETTINGS.menu.find(({ key }) => key === section) || {};

  return (
    <Container fluid>
      <Grid columns={2}>
        <Grid.Row columns="equal">
          <Grid.Column computer={4} largeScreen={3} widescreen={3} style={{ zIndex: 99 }}>
            <Menu vertical>
              {SETTINGS.menuGroups.map((group, i) => {
                const items = SETTINGS.menu.filter(({ parent }) => parent === group);
                return (
                  <Menu.Item key={`group-${i}`}>
                    <Menu.Header content={<Trans i18nKey={`settings.tabGroups.${group}`} />} />
                    <Menu.Menu>
                      {items.map(({ key, ...item }, j) => (
                        <React.Fragment key={`item-${j}`}>
                          {/* Sub item menu */}
                          {item.items?.length > 0 ? (
                            <Dropdown item text={t(`settings.tabs.${key}`)}>
                              <Dropdown.Menu>
                                {item.items.map((subItem, l) => (
                                  <Dropdown.Item
                                    as="a"
                                    key={`subItem-${l}`}
                                    content={subItem.key}
                                    href={generateRoutePath("settings", {
                                      section: key,
                                      subSection: subItem.key
                                    })}
                                  />
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                          ) : (
                            <Menu.Item
                              as="a"
                              href={generateRoutePath("settings", { section: key })}
                              active={key === section}
                            >
                              {/* Main item menu */}
                              {<Trans i18nKey={`settings.tabs.${key}`} />}
                            </Menu.Item>
                          )}
                        </React.Fragment>
                      ))}
                    </Menu.Menu>
                  </Menu.Item>
                );
              })}
            </Menu>
          </Grid.Column>
          <Grid.Column>
            <Component
              {...props}
              {...setting}
              title={<Trans i18nKey={`settings.tabs.${setting.key}`} />}
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Container>
  );
};

SettingsPage.propTypes = settingsPageProps;

const SettingsPageNav = ({ ...props }) => {
  const { section, subSection: topic } = useParams();

  // const section = FlowRouter.getParam("section");
  // const topic = FlowRouter.getParam("subSection"); // e.g. for data subpages

  return <SettingsPage {...props} {...{ section, topic }} />;
};

const SettingsPageLoader = () => {
  const context = useContext(LoginContext);
  const currentAccountId = context.accountId;
  const { data = {}, loading, error } = useQuery(GET_ACCOUNT_AND_USER_DATA);
  debug("settings data: %o", { data, loading, error });
  if (error) console.error(error);
  if (loading) return <Loader loading />;

  const account = data.account || {};
  const user = data.user || {};
  const security = initializeSecurity({ account, context });
  debug("security: %o", security);

  return <SettingsPageNav {...{ account, accountId: currentAccountId, user, security }} />;
};

export default SettingsPageLoader;
