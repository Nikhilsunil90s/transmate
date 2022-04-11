import React from "react";
import { useApolloClient } from "@apollo/client";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { Table, Checkbox } from "semantic-ui-react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";

import { UPDATE_USER_ENTITIES } from "./utils/queries";

const debug = require("debug")("settings:users");

// const optimisticResponse = (entities, entity, toRemove) => {
//   if (toRemove) return entities.filter(item => item !== entity);
//   return [...entities, entity];
// };

const UserRow = ({ user, canEdit, entities }) => {
  const client = useApolloClient();

  const userId = user.id; // user of row

  const toggleUserEntity = async ({ entity, remove }) => {
    if (!userId) return;
    debug("userRoles: %s %o", userId, { entity, remove });

    // const optimisticEntities = optimisticResponse(user.entities || [], entity, remove);

    try {
      const { errors, data } = await client.mutate({
        mutation: UPDATE_USER_ENTITIES,
        variables: { input: { userId, entity, remove } }

        // optimisticResponse: {
        //   __typename: "Mutation",
        //   updateUserEntities: {
        //     id: userId,
        //     entities: optimisticEntities,
        //     __typename: "User"
        //   }
        // }
      });
      debug("update entity res %o", { data, errors });
      if (errors) throw errors;

      toast.success("role updated");
    } catch (error) {
      console.error({ error });
      toast.error("Could not update role");
    }
  };

  return (
    <Table.Row>
      <Table.Cell>{user.name}</Table.Cell>
      {entities.map((entity, i) => {
        const userHasThisRole = (user.entities || []).includes(entity);

        const toggleCheckBox = (_, { checked }) => {
          if (!userId) return;
          toggleUserEntity({ userId, entity, remove: !checked });
        };

        return (
          <Table.Cell key={i} textAlign="center">
            <Checkbox
              fitted
              label=""
              disabled={!canEdit}
              onChange={toggleCheckBox}
              checked={userHasThisRole}
            />
          </Table.Cell>
        );
      })}
    </Table.Row>
  );
};

const UserGrid = ({ users, entities, canEdit }) => {
  return (
    <Table celled singleLine>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          {entities.map((content, i) => (
            <Table.HeaderCell key={i} {...{ content, textAlign: "center" }} />
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map(user => (
          <UserRow key={user.id} {...{ user, canEdit, entities }} />
        ))}
      </Table.Body>
    </Table>
  );
};

const EntityAssignment = ({ ...props }) => {
  const { users, account, security, isLoading } = props;
  const entities = (account?.entities || []).map(({ code }) => code);
  const canEdit = security.canEditUsers;
  return (
    <IconSegment
      icon="user plus"
      loading={isLoading}
      title={<Trans i18nKey="settings.users.entities" />}
      body={entities.length ? <UserGrid {...{ users, entities, canEdit }} /> : "Empty"}
    />
  );
};

export default EntityAssignment;
