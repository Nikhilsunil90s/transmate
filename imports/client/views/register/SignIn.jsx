/* eslint-disable no-underscore-dangle */
/* eslint-disable meteor/no-session */
import React, { useState } from "react";
import { Session } from "meteor/session";
import { Meteor } from "meteor/meteor";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { Grid, Button } from "semantic-ui-react";
import { AutoForm, AutoField, ErrorsField } from "uniforms-semantic";
import PasswordForm from "/imports/client/views/register/Password.jsx";
import { Accounts } from "meteor/accounts-base";
import { useHistory } from "react-router-dom";

const debug = require("debug")("routes:signin");

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    email: String,
    password: String
  })
);

const SignIn = () => {
  debug("call sign in");
  const [loggingIn, setloggingIn] = useState(false);
  const [error, setError] = useState();
  const history = useHistory();

  function submitForm(data) {
    setloggingIn(true);
    const { email, password } = data;
    return Meteor.loginWithPassword(email, password, error => {
      setloggingIn(false);
      if (error) setError(new Error("Wrong login/password combination"));
      const loginRedirect = Session.get("loginRedirect");
      if (loginRedirect) {
        Session.set("loginRedirect", false);
        return history.push(loginRedirect);
      }

      return history.push("/");
    });
  }
  const token =
    Accounts._enrollAccountToken || Accounts._verifyEmailToken || Accounts._resetPasswordToken;
  debug("token %s", token);
  if (token) {
    debug("load password change container");
    return <PasswordForm token={token} />;
  }

  return (
    <AutoForm
      className="ui inverted form sign-in"
      schema={schema}
      onSubmit={submitForm}
      onChange={() => {
        // clear the error on change:
        setError();
      }}
      error={error}
    >
      <img className="ui medium image logo" src="/images/logo-transmate.svg" alt="logo" />
      <AutoField name="email" label="Email" type="email" autoComplete="username" />
      <AutoField name="password" label="Password" type="password" autoComplete="current-password" />
      <Grid columns={2}>
        <Grid.Column>
          {loggingIn ? (
            <Button primary disabled content="Signing in..." />
          ) : (
            <Button type="submit" primary content="Sign in" />
          )}
        </Grid.Column>
        <Grid.Column>
          <a href="/forgot-password">Forgot your password?</a>
        </Grid.Column>
      </Grid>
      <small>
        No account yet?
        <a href="/register" data-test="register">
          Create one for free.
        </a>
      </small>
      <ErrorsField />
    </AutoForm>
  );
};

export default SignIn;
