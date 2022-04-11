import React from "react";
import { Trans, useTranslation } from "react-i18next";
import get from "lodash.get";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import { Button } from "semantic-ui-react";
import { Accounts } from "meteor/accounts-base";

import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import {
  PasswordSchema,
  OldPasswordSchema,
  PLACEHOLDER_TEXT
} from "/imports/client/views/register/password.schema";
import { sAlertCallback } from "/imports/utils/UI/sAlertCallback";

const debug = require("debug")("settings:password");

const NewPasswordSchema = new SimpleSchema({});
NewPasswordSchema.extend(PasswordSchema);
NewPasswordSchema.extend(OldPasswordSchema);

let formRef;
const PasswordResetForm = () => {
  const { t } = useTranslation();
  const setNewPwd = ({ oldPwd, password }) => {
    Accounts.changePassword(oldPwd, password, (err, res) => {
      debug("set new %o", { err, res });
      sAlertCallback(err, res, {
        onSuccessCb: () => formRef.reset(),
        onSuccessMsg: "Password has been changed"
      });
    });
  };

  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(NewPasswordSchema)}
      onSubmit={setNewPwd}
      ref={ref => {
        formRef = ref;
      }}
    >
      <AutoField
        name="oldPwd"
        label={t("settings.userSecurity.password.old")}
        placeholder={PLACEHOLDER_TEXT}
        autoComplete="current-password"
      />
      <AutoField
        name="password"
        label={t("settings.userSecurity.password.pwd")}
        placeholder={PLACEHOLDER_TEXT}
        autoComplete="new-password"
      />
      <AutoField
        name="p2"
        label={t("settings.userSecurity.password.repeat")}
        placeholder={PLACEHOLDER_TEXT}
        autoComplete="new-password"
      />
      <ErrorsField />
    </AutoForm>
  );
};

const SettingsUserSecurity = ({ title, icon }) => {
  const onForgotPwd = () => {
    const email = get(Meteor.user(), ["emails", 0, "address"]);
    if (!email) throw new Meteor.Error("Could not find your email");
    Accounts.forgotPassword({ email }, (err, res) =>
      sAlertCallback(err, res, {
        onSuccessMsg: `Password reset email has been sent to ${email}`
      })
    );
  };
  return (
    <IconSegment
      title={title}
      icon={icon}
      body={<PasswordResetForm />}
      footer={
        <>
          <div>
            <Button
              primary
              content={<Trans i18nKey="general.submit" />}
              onClick={() => formRef.submit()}
            />
          </div>
          <div>
            <a onClick={onForgotPwd}>
              <Trans i18nKey="settings.userSecurity.forgot-password" />
            </a>
          </div>
        </>
      }
    />
  );
};

export default SettingsUserSecurity;
