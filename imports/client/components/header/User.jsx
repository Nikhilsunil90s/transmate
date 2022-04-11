import React from "react";
import { useTranslation } from "react-i18next";
import { Menu, Divider, Image, Icon } from "semantic-ui-react";
import { generateRoutePath } from "../../router/routes-helpers";
import { PartnerTag } from "/imports/client/components/tags";

const UserMenu = ({ ...props }) => {
  const { t } = useTranslation();
  const { currentUser = {}, account = {} } = props;

  return (
    <div className="ui simple dropdown item" data-test="userMenu">
      <Image src={currentUser.avatar} avatar />
      {currentUser.name}
      <Icon name="dropdown" />
      <Menu>
        <Menu.Item
          as="a"
          href={generateRoutePath("settings", { section: "user-profile" })}
          content={t("settings.title")}
        />
        <Menu.Item
          as="a"
          href={generateRoutePath("settings", { section: "account-profile" })}
          content={
            <>
              {t("account.portal.title")} <span style={{ opacity: 0.4 }}>{account.name}</span>
            </>
          }
        />
        <Menu.Item
          as="a"
          className="logout"
          href="/logout"
          content={t("account.tabs.logout")}
          data-test="logout"
        />
        <div className="header">
          <Divider />
          {currentUser.name}
          <br />
          {account && <PartnerTag {...{ accountId: account.id, name: account.name }} />}
        </div>
      </Menu>
    </div>
  );
};

export default UserMenu;
