import React from "react";
import classNames from "classnames";
import { useMutation, gql } from "@apollo/client";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import SimpleSchema from "simpl-schema";
import { Grid, Form } from "semantic-ui-react";
import { AutoForm, AutoField, ErrorsField, SubmitField, RadioField } from "uniforms-semantic";
import capitalize from "lodash.capitalize";

import Verify from "./Verify.jsx";
import useRoute from "../../router/useRoute.js";

const CREATE_USER = gql`
  mutation createUserInForm($input: createUserInput!) {
    userId: createUser(input: $input)
  }
`;

const debug = require("debug")("user:sign-up");

const schema = new SimpleSchema2Bridge(
  new SimpleSchema({
    company: String,
    type: { type: String, allowedValues: ["shipper", "carrier"] },
    first: String,
    last: String,
    email: String
  })
);

const Component = () => {
  const { queryParams } = useRoute();
  const [createUser, { data = {}, loading, error }] = useMutation(CREATE_USER);
  debug("mutation data", { data, loading, error });

  const verify = !!data.userId;
  function onSubmitForm(formData) {
    const { email, first, last, company, type } = formData;
    const input = {
      user: {
        email,
        firstName: first,
        lastName: last
      },
      account: { company, type },
      options: { sendMail: true }
    };
    debug("new user as %o", input);

    createUser({ variables: { input }, onError: console.log });
  }

  if (verify) return <Verify email={verify} />;

  const model = {
    company: queryParams.a,
    email: queryParams.e
  };

  return (
    <AutoForm
      className="ui inverted form sign-up"
      showInlineError
      model={model}
      error={error}
      schema={schema}
      onSubmit={onSubmitForm}
    >
      <AutoField name="company" label="Company" />

      <RadioField label="Type" name="type" transform={value => capitalize(value)} />
      <Form.Field>
        <label>Name</label>
        <Form.Group>
          <AutoField name="first" placeholder="First" />
          <AutoField name="last" placeholder="Surname" />
        </Form.Group>
        <AutoField name="email" placeholder="email" data-test="email" />
      </Form.Field>
      <ErrorsField />

      <Grid columns={2}>
        <Grid.Column>
          <SubmitField
            className={classNames("ui primary button", { loading })}
            data-test="submit"
            content={loading ? "Loading..." : "Register"}
          />
        </Grid.Column>
        <Grid.Column>
          <a href="/sign-in">Already have an account?</a>
        </Grid.Column>
      </Grid>
      <small>
        By signing up for an account you agree to the Transmate{" "}
        <a href="https://www.transmate.eu/legal/privacy" target="blank">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="https://www.transmate.eu/legal/terms-of-use" target="blank">
          Terms of Use
        </a>
        .
      </small>
    </AutoForm>
  );
};

export default Component;
