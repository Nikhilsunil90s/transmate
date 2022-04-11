import React from "react";
import { Trans } from "react-i18next";
import { Button, Message } from "semantic-ui-react";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const DashboardProfile = () => {
  return (
    <div className="profileprogress">
      <Message
        className="profile"
        icon="user outline"
        content={
          <>
            <div className="header">
              <Trans i18nKey="dashboard.account.header" />
            </div>
            <p>
              <Trans i18nKey="dashboard.account.info" />
            </p>
            <Button
              as="a"
              primary
              href={generateRoutePath("settings", { section: "account-profile" })}
              icon="pencil"
              content={<Trans i18nKey="dashboard.account.edit" />}
            />
          </>
        }
      />
    </div>
  );
};

export default DashboardProfile;
