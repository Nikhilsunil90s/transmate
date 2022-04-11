import React from "react";
import moment from "moment";
import { Trans } from "react-i18next";
import { List, Icon, Segment } from "semantic-ui-react";
import { useQuery } from "@apollo/client";

import { GET_MY_TASKS } from "../utils/queries";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const debug = require("debug")("dashboard:tasks");

const PATHS = {
  priceRequest: "priceRequestEdit",
  tender: "tender"
};

const TasksSegment = ({ tasks = [], loading }) => {
  let body;
  if (tasks.length > 0) {
    body = <TaskList {...{ tasks }} />;
  } else {
    body = (
      <div className="meta">
        <Trans i18nKey="dashboard.tasks.empty" />{" "}
      </div>
    );
  }

  return (
    <Segment as="div" className="ui card" loading={loading}>
      <div className="content">
        <div className="right floated">
          <Icon name="tasks" />
        </div>
        <div className="header">
          <Trans i18nKey="dashboard.tasks.title" />
        </div>
        {body}
      </div>
    </Segment>
  );
};

const TaskList = ({ tasks = [] }) => {
  const shortList = tasks.slice(0, 5);
  debug("tasks for this user %o", { tasks });
  return (
    <List celled link size="small">
      {shortList.map(({ active, icon, link, dueDate, title }, i) => (
        <List.Item active={active} key={i}>
          <List.Icon name={icon || "hand paper outline"} verticalAlign="middle" />
          <List.Content>
            {active ? (
              <>
                <List.Header as="a" {...(link && { href: link })}>
                  {title}
                </List.Header>
                <List.Description>Due {moment(dueDate).fromNow()}</List.Description>
              </>
            ) : (
              <List.Header>
                {title} (<Trans i18nKey="dashboard.tasks.nonActive" />)
              </List.Header>
            )}
          </List.Content>
        </List.Item>
      ))}
    </List>
  );
};

const prepData = data =>
  data.map(({ references, ...item }) => ({
    ...item,
    ...(references && references.type
      ? {
          link: generateRoutePath(PATHS[references.type] || references.type, {
            _id: references.id
          })
        }
      : undefined)
  }));

const DashboardTasks = () => {
  const { data = {}, loading, error } = useQuery(GET_MY_TASKS);
  debug("task data %o", { data, loading, error });
  if (error) console.error({ error });

  const tasks = prepData(data.tasks || []);

  return <TasksSegment {...{ tasks, loading }} />;
};

export { TasksSegment };
export default DashboardTasks;
