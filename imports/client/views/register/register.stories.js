import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import PasswordForm from "./Password.jsx";
import Register from "./Register.jsx";
import Verify from "./Verify.jsx";

export default {
  title: "Components/Register"
};

export const register = () => {
  return (
    <PageHolder main="Register">
      <Register />
    </PageHolder>
  );
};
export const verify = () => {
  return (
    <PageHolder main="Register">
      <Verify />
    </PageHolder>
  );
};

export const passwordForm = () => {
  return (
    <PageHolder main="Settings">
      <PasswordForm />
    </PageHolder>
  );
};
