import React, { useState } from "react";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
import { Trans, useTranslation } from "react-i18next";
import { Table, Icon, Button, Checkbox } from "semantic-ui-react";
import { ConfirmComponent } from "/imports/client/components/modals";

import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import UserModal from "./modals/User.jsx";

import { REMOVE_USER, ADD_USER, UPDATE_USER_ROLE } from "../../../utils/queries";

// default roles:
import { userRoles } from "/imports/api/_jsonSchemas/simple-schemas/_utilities/_users";

const debug = require("debug")("settings:users");

const ToggleBox = ({ userId, role, value, disabled }) => {
  const client = useApolloClient();
  const [isChecked, setChecked] = useState(value);

  const toggleCheckBox = async (_, { checked }) => {
    if (!userId) return;
    const previousValue = isChecked;
    const remove = !checked;

    debug("userRoles: %s %o", userId, { role, remove });
    try {
      setChecked(checked);
      const { errors } = await client.mutate({
        mutation: UPDATE_USER_ROLE,
        variables: { input: { userId, role, remove } }
      });

      if (errors) throw errors;
      toast.success("role updated");
    } catch (error) {
      setChecked(previousValue);
      console.error({ error });
      toast.error("Could not update role");
    }
  };

  return (
    <Checkbox fitted label="" disabled={disabled} onChange={toggleCheckBox} checked={isChecked} />
  );
};

const UserRow = ({ user, canEdit, allRoles, currentUserId }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [show, showConfirm] = useState(false);

  const userId = user.id; // user of row

  const onConfirmDeleteUser = async () => {
    try {
      const { errors } = client.mutate({
        mutation: REMOVE_USER,
        variables: { userId }
      });

      if (errors) throw errors;
      toast.success(t("settings.users.deleteUserSuccess"));
      showConfirm(false);
    } catch (error) {
      console.error(error);
      toast.error("Could not remove user");
    }
  };
  return (
    <Table.Row>
      <Table.Cell>{user.name}</Table.Cell>
      {allRoles.map((role, i) => {
        const userHasThisRole = (user.baseRoles || []).includes(role);

        // disable the checkbox if I am admin & own account
        const disableCheckBox =
          !canEdit ||
          (role === "admin" && userId === currentUserId && userHasThisRole) ||
          role === "user";

        return (
          <Table.Cell key={i} textAlign="center">
            <ToggleBox {...{ userId, role, value: userHasThisRole, disabled: disableCheckBox }} />
          </Table.Cell>
        );
      })}
      <Table.Cell>
        {canEdit && currentUserId !== user.id && (
          <Icon
            name="trash alternate"
            style={{ cursor: "pointer" }}
            onClick={() => showConfirm(true)}
          />
        )}
        <ConfirmComponent
          show={show}
          showConfirm={showConfirm}
          onConfirm={onConfirmDeleteUser}
          content={<Trans i18nKey="settings.users.deleteUserConfirm" />}
        />
      </Table.Cell>
    </Table.Row>
  );
};

const UserGrid = ({ customRoles = [], users, account, canEdit, currentUserId }) => {
  const allRoles = [...customRoles, ...userRoles];
  return (
    <Table celled singleLine>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          {customRoles.length > 0 && (
            <Table.HeaderCell colSpan={customRoles.length} content="Custom" textAlign="center" />
          )}
          <Table.HeaderCell colSpan={userRoles.length} content="Base" textAlign="center" />
          <Table.HeaderCell />
        </Table.Row>
        <Table.Row>
          <Table.HeaderCell />
          {allRoles.map((content, i) => (
            <Table.HeaderCell key={i} {...{ content, textAlign: "center" }} />
          ))}
          <Table.HeaderCell />
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map(user => (
          <UserRow key={user.id} {...{ user, canEdit, allRoles, account, currentUserId }} />
        ))}
      </Table.Body>
    </Table>
  );
};

const AccountUsersRoles = ({ ...props }) => {
  const client = useApolloClient();
  const { security, users = [], title, icon, isLoading } = props;

  const canEdit = security.canEditUsers;

  const onAddUser = ({ user, options }, callback) => {
    debug("adding user", { user, options });

    client
      .mutate({
        mutation: ADD_USER,
        variables: { input: { user, options } }
      })
      .then(({ data, errors }) => {
        debug("afterAdd", { data, errors });
        if (errors) throw errors;
        toast.success("User saved");
        if (typeof callback === "function") callback();
      })
      .catch(err => {
        console.error(err);
        toast.error("Could not add user");
      });
  };

  return (
    <IconSegment
      icon={icon}
      title={title}
      loading={isLoading}
      body={
        <>
          <Trans i18nKey="settings.users.totalCount" values={{ count: users.length }} />
          <UserGrid {...{ ...props, canEdit }} />
        </>
      }
      footer={
        canEdit && (
          <UserModal message={<Trans i18nKey="settings.user.modal.message" />} onSave={onAddUser}>
            <Button primary content={<Trans i18nKey="settings.users.add" />} />
          </UserModal>
        )
      }
    />
  );
};

export default AccountUsersRoles;
