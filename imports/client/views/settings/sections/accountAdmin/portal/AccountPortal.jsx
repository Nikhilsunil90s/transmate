import React from "react";
import AccountProfile from "../../../../account/profile/ProfileLoader";

const AccountPortal = ({ ...props }) => {
  const { accountId } = props;
  return <AccountProfile accountId={accountId} />;
};

export default AccountPortal;
