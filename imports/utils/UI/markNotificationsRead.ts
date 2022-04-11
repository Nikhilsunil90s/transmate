import gql from "graphql-tag";

const MARK_NOTIFICATION_READ = gql`
  mutation markNotificationsRead($input: MarkNotificationsReadInput!) {
    markNotificationsRead(input: $input)
  }
`;

const MARK_ALL_NOTIFICATIONS_AS_READ = gql `mutation markAllNotificationsAsRead($input: MarkAllNotificationsAsReadInput!) {
  markAllNotificationsAsRead(input: $input)
}`;


export const markNotificationsRead = (
  type: string,
  events: Array<String>,
  data: any,
  client: any
) => {
  if (!client) return;
  client.mutate({
    mutation: MARK_NOTIFICATION_READ,
    variables: {
      input: {
        type,
        events,
        data
      }
    }
  });
};

export const markAllNotificationsAsRead = async (notificationIds: [string], client) => {
  if(!client) return;
  const result = await client.mutate({
    mutation: MARK_ALL_NOTIFICATIONS_AS_READ,
    variables: {
      input: {
        notificationIds,
      }
    }
  });
  return result.data.markAllNotificationsAsRead;  
}