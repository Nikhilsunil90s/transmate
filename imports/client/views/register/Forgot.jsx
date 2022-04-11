import { toast } from "react-toastify";
import React, { useState } from "react";
import { Accounts } from "meteor/accounts-base";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { Grid, Message, Button } from "semantic-ui-react";
import { AutoForm, AutoField } from "uniforms-semantic";

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    email: String
  })
);
const Forgot = () => {
  const [disableForm, setDisabled] = useState(false);
  const [done, setDone] = useState();

  function onSubmitForm({ email }) {
    setDisabled(true);
    return Accounts.forgotPassword({ email }, e => {
      if (e) {
        setDisabled(false);
        console.error(e);
        return toast.error(`<b>Login error</b><br />${e.reason}`);
      }
      return setDone(true);
    });
  }
  return (
    <AutoForm className="ui inverted form forgot-password" schema={schema} onSubmit={onSubmitForm}>
      <img className="ui medium image logo" src="/images/logo-transmate.svg" alt="logo" />
      {done ? (
        <>
          <Message content="We've sent you an email with a link to reset your password." />
          <a href="/sign-in">Back to sign in page.</a>
        </>
      ) : (
        <>
          <AutoField
            type="email"
            name="email"
            autoComplete="username"
            label="Email"
            disabled={disableForm}
          />
          <Grid columns={2}>
            <Grid.Column>
              <Button type="submit" primary content="Reset password" disabled={disableForm} />
            </Grid.Column>
            <Grid.Column>
              <a href="/sign-in">Or sign in</a>
            </Grid.Column>
          </Grid>
        </>
      )}
    </AutoForm>
  );
};

export default Forgot;
