import React from "react";

const Verify = ({ email }) => (
  <div>
    <img className="ui medium image logo" src="/images/logo-transmate.svg" alt="logo" />
    <p data-test="verify">
      An email with verification link has been sent to {email}. Please click the link to finish the
      registration process.
    </p>
  </div>
);

export default Verify;
