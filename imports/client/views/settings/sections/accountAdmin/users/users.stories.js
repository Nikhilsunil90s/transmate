import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import { AccountUsers } from "./Users.jsx";

export default {
  title: "Settings/accountAdmin/users"
};

const dummyProps = {
  title: "Users",
  icon: "users",
  account: { userIds: [] },
  users: [{ id: "testId1", name: () => "test" }],
  accessControl: () => false
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="Settings">
      <AccountUsers {...props} />
    </PageHolder>
  );
};

export const canEdit = () => {
  const props = { ...dummyProps };
  props.accessControl = () => true;
  return (
    <PageHolder main="PriceRequest">
      <AccountUsers {...props} />
    </PageHolder>
  );
};

export const empty = () => {
  const props = { ...dummyProps, users: [] };
  return (
    <PageHolder main="PriceRequest">
      <AccountUsers {...props} />
    </PageHolder>
  );
};
