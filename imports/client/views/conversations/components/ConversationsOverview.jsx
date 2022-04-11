import moment from "moment";
import React from "react";
import { useQuery, gql } from "@apollo/client";

import { ReactTable } from "/imports/client/components/tables";
import { Icon } from "semantic-ui-react";

import ConversationsOverviewFooter from "./ConversationsOverviewFooter";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("conversations");

const GET_CONVERSATIONS = gql`
  query getConversations($filters: JSONObject!) {
    conversations: getConversations(filters: $filters) {
      subject
      participantCount
      created {
        at
      }
      status
      broadcast
    }
  }
`;

function prepareView(docs = []) {
  return docs.map(doc => ({
    ...doc,
    createdAt: doc.created && moment(doc.created.at).fromNow()
  }));
}

const ConversationsOverview = props => {
  const filters = props.selector;
  const { goRoute } = useRoute();
  const { data, loading, error } = useQuery(GET_CONVERSATIONS, { variables: { filters } });
  debug("conversations %o", { data, loading, error });
  const conversations = prepareView(data?.conversations);

  const columns = [
    {
      Header: "Subject",
      accessor: "subject"
    },
    {
      Header: "Participants",
      accessor: "participantCount"
    },
    {
      Header: "Created",
      accessor: "createdAt"
    },
    {
      Header: "Status",
      accessor: "status"
    },
    {
      Header: "",
      accessor: "broadcast",
      Cell: () => <Icon name="bullhorn" />
    }
  ];

  function handleClicked(selectedRow) {
    if (!selectedRow) return;
    goRoute("conversation", { _id: selectedRow.id || selectedRow._id });
  }

  return (
    <div>
      <ReactTable
        paginate
        shouldShowFooterPagination
        isLoading={loading}
        paginationContent={<ConversationsOverviewFooter />}
        columns={columns}
        data={conversations}
        onRowClicked={handleClicked}
      />
    </div>
  );
};

export default ConversationsOverview;
