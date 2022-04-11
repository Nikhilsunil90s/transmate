import React, { useContext } from "react";
import { PropTypes } from "prop-types";
import { useQuery } from "@apollo/client";
import { settingsPageProps } from "../../../utils/propTypes";
import LoginContext from "/imports/client/context/loginContext";

import AccountUsersRoles from "./UsersRoles";
import EntityAssignment from "./EntityAssignment";
import { GET_ACCOUNT_ROLES, GET_ACCOUNT_USERS } from "../../../utils/queries";

const debug = require("debug")("settings:users");

export const AccountUsers = ({ ...props }) => {
  return (
    <>
      <AccountUsersRoles {...props} />
      <EntityAssignment {...props} />
    </>
  );
};

AccountUsers.propTypes = {
  ...settingsPageProps,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string,
      email: PropTypes.string,
      avatar: PropTypes.string,
      baseRoles: PropTypes.arrayOf(PropTypes.string),
      entities: PropTypes.arrayOf(PropTypes.string)
    })
  ),
  isLoading: PropTypes.bool
};

const AccountUsersLoader = ({ ...props }) => {
  const curLogin = useContext(LoginContext);
  const currentUserId = curLogin.userId;

  // custom roles:
  const { data: rolesData, loading: loadingRoles, error: errorRoles } = useQuery(GET_ACCOUNT_ROLES);
  const { data: userData, loading: loadingUsers, error: errorUsers } = useQuery(GET_ACCOUNT_USERS);
  debug("users data:%o", { data: userData, loading: loadingUsers, error: errorUsers });
  debug("roles data:%o", { data: rolesData, loading: loadingRoles, error: errorRoles });
  if (errorRoles) console.error(errorRoles);
  if (errorUsers) console.error(errorUsers);

  const isLoading = loadingRoles || loadingUsers;

  const customRoles = rolesData?.accountSettings?.roleNames || [];
  const users = userData?.account?.users || [];

  return <AccountUsers {...{ ...props, isLoading, users, customRoles, currentUserId }} />;
};

export default AccountUsersLoader;
