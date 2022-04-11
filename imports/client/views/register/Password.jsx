/* eslint-disable no-underscore-dangle */
import { toast } from "react-toastify";
import React from "react";

import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import { Grid, Button } from "semantic-ui-react";

import { Accounts } from "meteor/accounts-base";

import { PasswordSchema, PLACEHOLDER_TEXT } from "./password.schema";

const debug = require("debug")("routes:password");

let formRef;

const PasswordForm = ({ token }) => {
  debug("PasswordForm called");

  function redirect(path = "/") {
    debug("redirect called, reset tokens.");
    Accounts._enrollAccountToken = null;
    Accounts._resetPasswordToken = null;
    Accounts._verifyEmailToken = null;
    window.location = path;
  }

  const handleFormSubmit = ({ password }) => {
    if (token) {
      Accounts.resetPassword(token.toString(), password, err => {
        debug("result pasword reset", err);
        if (err) {
          return toast.error(`<b>Unable to reset password!</b></br>${err.reason}`);
        }
        toast.info("Password changed, logging in...");
        return redirect("/");
      });
    }
  };

  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(PasswordSchema)}
      onSubmit={handleFormSubmit}
      ref={ref => {
        formRef = ref;
      }}
    >
      <img className="ui medium image logo" src="/images/logo-transmate.svg" alt="logo" />

      <AutoField
        name="password"
        label="Password"
        placeholder={PLACEHOLDER_TEXT}
        autoComplete="new-password"
      />
      <AutoField
        name="p2"
        label="Repeat password"
        placeholder={PLACEHOLDER_TEXT}
        autoComplete="new-password"
      />
      <Grid columns={2}>
        <Grid.Column>
          <Button primary content="Set password" onClick={() => formRef.submit()} />
        </Grid.Column>
        <Grid.Column>
          <a href="" onClick={() => redirect("/")}>
            Or sign in
          </a>
        </Grid.Column>
      </Grid>
      <ErrorsField />
    </AutoForm>
  );
};

export default PasswordForm;
