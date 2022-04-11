import React from "react";
import { toast } from "react-toastify";
import pick from "lodash.pick";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { useApolloClient } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { Button, Form, Divider, Icon } from "semantic-ui-react";
import { AutoForm, AutoField } from "uniforms-semantic";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { SET_API_KEY_FOR_USER, UPDATE_USER_SELF } from "../../utils/queries";

const debug = require("debug")("settings:user");

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    first: String,
    last: String
  })
);
let formRef;

const UserForm = ({ ...props }) => {
  const { t } = useTranslation();
  const { user, onSave } = props;
  const model = pick(user?.profile, ["first", "last"]);

  return (
    <AutoForm
      schema={schema}
      model={model}
      ref={ref => {
        formRef = ref;
      }}
      onSubmit={({ first, last }) => onSave({ profile: { first, last } })}
    >
      <Form.Group>
        <AutoField name="first" label={t("settings.user.first")} />
        <AutoField name="last" label={t("settings.user.last")} />
      </Form.Group>
    </AutoForm>
  );
};

const SettingsUserProfile = ({ ...props }) => {
  const client = useApolloClient();

  const { title, icon, account, user } = props;

  function setApiKey() {
    client.mutate({
      mutation: SET_API_KEY_FOR_USER
    });
  }

  const onSaveUser = updates => {
    debug("updates self", updates);
    client
      .mutate({
        mutation: UPDATE_USER_SELF,
        variables: { updates }
      })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("Changes stored");
      })
      .catch(err => {
        console.error(err);
        toast.error("Could not save your changes");
      });
  };

  return (
    <IconSegment
      title={title}
      icon={icon}
      body={
        <>
          <UserForm {...props} onSave={onSaveUser} />
          <Form>
            <Form.Field>
              <label>
                <Trans i18nKey="settings.user.apiKey" />
              </label>
              {user?.profile?.apiKey}
              <Icon name="refresh" style={{ cursor: "pointer" }} onClick={() => setApiKey()} />
            </Form.Field>
          </Form>
          <Divider />
          <div className="section">
            <Form>
              <Form.Field>
                <label>
                  <Trans i18nKey="settings.user.organization" />
                </label>
                {account.name} - <span style={{ opacity: 0.4 }}>{account.id}</span>
              </Form.Field>
            </Form>
          </div>
        </>
      }
      footer={
        <>
          <div>
            <Button
              primary
              content={<Trans i18nKey="general.submit" />}
              onClick={() => formRef.submit()}
            />
          </div>
        </>
      }
    />
  );
};

export default SettingsUserProfile;
