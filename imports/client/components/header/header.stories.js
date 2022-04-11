/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from "react";
import classNames from "classnames";
import { Header, Menu } from "semantic-ui-react";
import { MockedProvider } from "@apollo/client/testing";
import { SearchHeader, UserMenu, NotificationsHeader, QuickActions } from ".";
import { GET_MY_NOTIFICATIONS } from "./Notifications.jsx";

export default {
  title: "Layout/header"
};

const mocks = [
  {
    request: {
      query: GET_MY_NOTIFICATIONS
    },
    result: {
      data: {
        notifications: [
          {
            id: "zwD3ELsCayhq4sEEt",
            type: "price-request",
            event: "requested",
            data: {
              priceRequestId: "Nu6dDb8snxc8wRBan",
              account: "Dummy shipper",
              title: "New priceRequest"
            },
            created: 1606475711543,
            read: false
          }
        ]
      }
    }
  }
];

export const header = () => {
  const [searching, setSearching] = useState(false);
  const props = {
    noGeneralSearch: false,
    header: null
  };

  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <div className="app">
        <Header as="header" className={classNames({ searching })}>
          <a className="logo" href="/">
            <img alt="logo" src="/images/logo-transmate-t.svg" />
          </a>
          {!props.noGeneralSearch && (
            <SearchHeader setSearching={setSearching} />
          )}
          {props.header}
          <Menu className="user" compact>
            <QuickActions />
            {/* {{> HeaderTasks}}
          {{> HeaderConversations}}*/}
            <NotificationsHeader />
            <UserMenu {...props} />
          </Menu>
        </Header>
      </div>
    </MockedProvider>
  );
};

export const notifications = () => {
  return (
    <MockedProvider mocks={mocks} addTypename={false}>
      <div className="app">
        <Header as="header">
          <a className="logo" href="/">
            <img alt="logo" src="/images/logo-transmate-t.svg" />
          </a>
          <SearchHeader setSearching={() => {}} />
          <Menu className="user" compact>
            {/* {{> HeaderTasks}}
          {{> HeaderConversations}}*/}

            <NotificationsHeader />

            <UserMenu />
          </Menu>
        </Header>
      </div>
    </MockedProvider>
  );
};
