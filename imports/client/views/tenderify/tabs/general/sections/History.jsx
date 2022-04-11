import React from "react";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { Feed } from "semantic-ui-react";
import { MomentFromNowTag } from "/imports/client/components/tags";
import { GET_CONTACT_INFO } from "/imports/client/views/tenderify/utils/queries";

const FeedEvent = ({ event }) => {
  const { data = {}, error } = useQuery(GET_CONTACT_INFO, {
    variables: { userId: event.userId }
  });
  if (error) {
    console.error(`>>>>>>> error`, error);
  }
  const user = data.user || {};
  return (
    <Feed.Event>
      <Feed.Label>
        <img src={user.avatar} />
      </Feed.Label>
      <Feed.Content>
        <Feed.Date>
          <MomentFromNowTag date={event.ts} />
        </Feed.Date>
        <Feed.Summary>
          <Feed.User>{user.name}</Feed.User>
        </Feed.Summary>
        <Feed.Extra>
          <Trans i18nKey={`feed.actions.${event.action}`} />
        </Feed.Extra>
      </Feed.Content>
    </Feed.Event>
  );
};

const TenderifySectionHistory = ({ tenderBid }) => {
  return (
    <IconSegment
      name="history"
      icon="thumbtack"
      title="History"
      body={
        <Feed>
          {(tenderBid.updates || []).map((event, i) => (
            <FeedEvent event={event} key={`event=${i}`} />
          ))}
        </Feed>
      }
    />
  );
};

export default TenderifySectionHistory;
