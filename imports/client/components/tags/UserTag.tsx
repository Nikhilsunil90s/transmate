import React, { useState } from "react";
import gql from "graphql-tag";
import { List, Image, Icon, Loader } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import { ConfirmComponent } from "/imports/client/components/modals";

export const GET_USER_INFO = gql`
  query getContactInfoForTag($userId: String!) {
    user: getContactInfo(userId: $userId) {
      id
      email
      name
      avatar
    }
  }
`;

const UserTag = ({ userId }) => {
  const { data = {}, error, loading } = useQuery(GET_USER_INFO, {
    variables: { userId },
    fetchPolicy: "cache-first",
    skip: !userId
  });
  if (error) {
    console.error(error);
  }

  const { user = {} } = data;

  return (
    <>
      <Loader active={loading} inline size="tiny" />
      {user.name || userId}
    </>
  );
};

interface UserListItemTagProps {
  userId: string;
  name: string;
  canRemove?: boolean;
  onRemoveAction?: ({ userId: string }, cb: Function) => void;
}

/** tag for a user that can be placed in a List */
export const UserListItemTag = ({
  userId,
  name,
  canRemove,
  onRemoveAction
}: UserListItemTagProps) => {
  const [show, showConfirm] = useState(false);
  const { data = {}, loading } = useQuery(GET_USER_INFO, {
    variables: { userId },
    fetchPolicy: "cache-first",
    skip: !userId
  });

  const { user = {} } = data;

  return (
    <List.Item key={`user-${userId}`}>
      {loading ? (
        <Loader active inline size="tiny" />
      ) : (
        <>
          {canRemove && (
            <List.Content floated="right">
              <span
                style={{ cursor: "pointer" }}
                onClick={() => showConfirm(true)}
              >
                <Icon name="trash alternate outline" />
              </span>
            </List.Content>
          )}
          <Image avatar src={user.avatar} />
          <List.Content>
            <List.Header>{user.name || name || userId}</List.Header>
            <List.Description>{user.email}</List.Description>
          </List.Content>
        </>
      )}
      <ConfirmComponent
        show={show}
        showConfirm={showConfirm}
        onConfirm={() =>
          canRemove && onRemoveAction({ userId }, () => showConfirm(false))
        }
      />
    </List.Item>
  );
};

export default UserTag;
