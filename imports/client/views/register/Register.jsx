import React from "react";
import Password from "./Password.jsx";
import SignUp from "./SignUp";

const Register = ({ ...props }) => {
  const { token } = props;

  return token ? <Password token={token} /> : <SignUp />;
};

export default Register;
