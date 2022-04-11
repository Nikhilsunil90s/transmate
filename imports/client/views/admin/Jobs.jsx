/* global Job */
import React from "react";
import moment from "moment";
import {
  Container,
  Segment,
  Header,
  Label,
  Popup,
  Feed,
  Message,
  Progress
} from "semantic-ui-react";
import { ReactTable } from "/imports/client/components/tables";

const STATUS_COLORS = {
  waiting: "grey",
  ready: "blue",
  paused: "black",
  running: "default",
  cancelled: "yellow",
  failed: "red",
  completed: "green"
};

// If two values sum to forever, then ∞, else the first value
const isInfinity = (val1, val2) => {
  if (val1 + val2 === Job.forever) {
    return false;
  }
  return val1;
};

function truncateId(id) {
  if (id) {
    if (typeof id === "object") {
      // eslint-disable-next-line no-param-reassign
      id = `${id.valueOf()}`;
    }
    return `${id.substr(0, 3)}…`;
  }
  return "";
}

const JobsAdmin = () => {
  const jobs = [];
  const recentEvents = jobs
    .slice(0, 5)
    .map(doc => {
      let i;
      const ref = doc.log;
      const results = [];
      for (i = 0; i < ref.length; i += 1) {
        const event = ref[i];
        event.type = doc.type;
        event.jobId = doc._id;
        if (event.level === "danger") {
          event.level = "error";
        }
        results.push(event);
      }
      return results;
    })
    .sort((a, b) => b.time - a.time);

  return (
    <div>
      <Container fluid>
        <Segment padded>
          <Header as="h3" content="Active jobs" />
          <ReactTable
            data={jobs}
            columns={[
              { Header: "Type", accessor: "type" },
              { Header: "ID", accessor: "_id" },
              { Header: "Ready", accessor: "after", Cell: ({ value }) => moment(value).fromNow() },
              {
                Header: "Updated",
                accessor: "updated",
                Cell: ({ value }) => moment(value).fromNow()
              },
              {
                Header: "Run",
                id: "repeated",
                Cell: ({ value: repeated, row: { original } }) => {
                  const numRepeats = isInfinity(original.repeats, repeated);
                  return (
                    <>
                      {repeated}
                      {numRepeats && `/${numRepeats}`}
                    </>
                  );
                }
              },
              {
                Header: "Fails",
                accessor: "retried",
                Cell: ({ value: retried, row: { original } }) => {
                  const numretries = isInfinity(original.retries, retried);
                  return retried ? (
                    <>
                      {retried}
                      {numretries && `/${numretries}`}
                    </>
                  ) : (
                    " - "
                  );
                }
              },
              {
                Header: "Status",
                accessor: "status",
                Cell: ({ value: status, row: { original } }) => {
                  const isRunning = status === "running";
                  const isFailing = status === "waiting" && original.failures?.length > 0;
                  const failures = [...new Set(original.failures.map(f => f.value))].join(", ");
                  return (
                    <>
                      {isRunning && (
                        <Progress
                          size="tiny"
                          indicating
                          percent={original.progress?.percent || 0}
                          label={`Running ${original.progress?.percent || 0}%`}
                        />
                      )}
                      {isFailing && (
                        <Popup
                          content={failures}
                          trigger={<Label color="orange" size="small" content="retrying" />}
                        />
                      )}
                      {!isRunning && !isFailing && (
                        <Label
                          size="small"
                          color={STATUS_COLORS[status] || "red"}
                          content={status}
                        />
                      )}
                    </>
                  );
                }
              }
            ]}
          />
        </Segment>
        <Segment padded>
          <Header as="h3" content="Recent events" />
          <Feed>
            {recentEvents.map((event, i) => (
              <Feed.Event key={i}>
                <Feed.Content>
                  <Feed.Summary>
                    <Feed.User>
                      {event.type} {truncateId(event.jobId)}
                    </Feed.User>
                    {event.runId && <Feed.Meta>run: {truncateId(event.runId)}</Feed.Meta>}
                    <Feed.Date content={moment(event.time).fromNow()} />
                  </Feed.Summary>
                  <Feed.Extra>
                    <Message content={`${event.level} | ${event.message}`} />
                  </Feed.Extra>
                </Feed.Content>
              </Feed.Event>
            ))}
          </Feed>
        </Segment>
      </Container>
    </div>
  );
};

export default JobsAdmin;
