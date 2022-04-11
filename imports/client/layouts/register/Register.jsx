/* eslint-disable no-underscore-dangle */
import React, { Suspense } from "react";
import { ApolloProvider } from "@apollo/client";
import { Accounts } from "meteor/accounts-base";
import client from "/imports/client/services/apollo/client"; // root -> required
import LogoLoading from "../../components/utilities/LogoLoading";

const debug = require("debug")("login");

const RegisterLayout = ({ ...props }) => {
  const token =
    Accounts._enrollAccountToken || Accounts._verifyEmailToken || Accounts._resetPasswordToken;

  debug("token %s %o", token, props);
  return (
    <div className="register container">
      <Suspense fallback={<LogoLoading />}>
        <main className={props.name}>{props.main}</main>
      </Suspense>
      <aside />
    </div>
  );
};

const RegisterLayoutWithProvider = ({ ...props }) => {
  return (
    <ApolloProvider client={client}>
      <RegisterLayout {...props} />
    </ApolloProvider>
  );
};

export default RegisterLayoutWithProvider;
