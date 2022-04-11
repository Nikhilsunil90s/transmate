import React, { useState, useEffect, Suspense } from "react";

import { ApolloProvider, useQuery } from "@apollo/client";
import client from "/imports/client/services/apollo/client"; // root -> required
import browserCheck from "ua-parser-js";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { Sidebar, Menu, Icon } from "semantic-ui-react";
import classNames from "classnames";
import { Emitter, Events } from "/imports/client/services/events";
import { SearchHeader, UserMenu, NotificationsHeader, QuickActions } from "../../components/header";
import NavBar from "../../components/layout/NavBar";
import { LoginProvider, providerContext } from "../../context/loginContext";

import { APP_ROOT_QUERY } from "./queries";
import ErrorBoundary from "/imports/client/components/utilities/ErrorBoundery";
import LoadingBlock from "/imports/client/components/utilities/LoadingPlaceholder.jsx";
import useRoute from "../../router/useRoute";
import LogoLoading from "../../components/utilities/LogoLoading";

const debug = require("debug")("UI:root");

const AppLayout = ({ ...props }) => {
  const {
    asideCollapsed,
    account,
    sidebar,
    noGeneralSearch,
    header,
    headerData,
    name,
    main,
    aside,
    currentUser
  } = props;

  // debug("main app ", props);
  const [asideExpanded, setAsideExpanded] = useState(!asideCollapsed);
  const [searching, setSearching] = useState(false);
  const [showSideBar, setShowSideBar] = useState(false);

  // eslint-disable-next-line new-cap
  const isIE = new browserCheck().getEngine().name === "Trident";

  const { name: activeRoute } = useRoute();
  const accountFeatures = account?.features || [];
  const userRoles = currentUser?.roles || [];

  function toggleAside() {
    setAsideExpanded(!asideExpanded);
  }

  // crisp:
  useEffect(() => {
    if (window.$crisp) {
      if (Meteor.isProduction) {
        window.$crisp.push(["safe", true]);
      }
      if (currentUser && account) {
        // debug("set crisp user details, user %o, account %o", currentUser, account);
        window.$crisp.push(["set", "user:email", [currentUser.email]]);
        window.$crisp.push(["set", "user:nickname", [`${currentUser.name} (${account.name})`]]);
        window.$crisp.push([
          "set",
          "user:company",
          [`${account._id}-${account.name} (${account.type})`]
        ]);
        window.$crisp.push([
          "set",
          "session:data",
          [
            [
              ["userId", currentUser._id],
              ["userName", currentUser.name],
              ["accountId", account._id],
              ["type", account.type],
              ["AccountName", account.name]
            ]
          ]
        ]);
      }
    }
  }, []);

  // toggle side panel
  useEffect(() => {
    Emitter.on(Events.TOGGLE_SIDE_PANEL, () => {
      debug("side panel toggled");
      setShowSideBar(!showSideBar);
    });
    return () => Emitter.off(Events.TOGGLE_SIDE_PANEL);
  });

  if (!activeRoute) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Sidebar
        width="very wide"
        direction="right"
        animation="overlay"
        visible={showSideBar}
        onHide={() => setShowSideBar(false)}
      >
        {sidebar ? <Suspense fallback={<LoadingBlock />}>{sidebar}</Suspense> : null}
      </Sidebar>
      <Sidebar.Pusher>
        <div className="app">
          {isIE && "get modern browser"}
          <header className={classNames({ searching })}>
            <a className="logo" href="/">
              <img src="/images/logo-transmate-t.svg" alt="logo" />
            </a>
            {!noGeneralSearch && <SearchHeader setSearching={setSearching} />}
            {header && React.cloneElement(header, { ...headerData })}
            <Menu className="user" compact>
              {/* {{> HeaderTasks}}
              {{> HeaderConversations}} */}

              <QuickActions />
              <NotificationsHeader />
              <UserMenu {...props} />
            </Menu>
          </header>
          <NavBar {...{ activeRoute, accountFeatures, userRoles }} />
          <div className="contentContainer">
            {/* scroll container */}
            <div>
              {/* flex container — for equal column height */}
              <ErrorBoundary>
                <Suspense fallback={<LoadingBlock />}>
                  <main className={name}>
                    {main && (
                      <div className={aside ? "mainSubWrapper" : null}>
                        {main}
                        {aside && (
                          <aside
                            className={classNames({
                              expanded: asideExpanded,
                              minimized: !asideExpanded
                            })}
                          >
                            {asideExpanded ? (
                              <a
                                className="ui left floated icon minimize"
                                onClick={toggleAside}
                                style={{ cursor: "pointer" }}
                              >
                                <Icon name="angle right" size="large" />
                              </a>
                            ) : (
                              <a
                                className="ui center floated icon minimize"
                                onClick={toggleAside}
                                style={{ cursor: "pointer" }}
                              >
                                <Icon name="angle left" size="large" />
                              </a>
                            )}
                            <div
                              style={asideExpanded ? {} : { display: "none" }}
                              className="content"
                            >
                              {aside}
                            </div>
                          </aside>
                        )}
                      </div>
                    )}
                  </main>
                </Suspense>
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </Sidebar.Pusher>
    </ErrorBoundary>
  );
};

const AppLayoutLoader = ({ ...props }) => {
  // get user info -> subscription + fetch
  // get account info -> subscription + fetch
  // get account settings
  const { data = {}, loading, error } = useQuery(APP_ROOT_QUERY);

  if (error) console.error(error);
  debug("data %o", data);

  return loading ? (
    <LogoLoading />
  ) : (
    <LoginProvider value={providerContext(data)}>
      <AppLayout {...props} {...data} />
    </LoginProvider>
  );
};

const AppWithProvider = ({ ...props }) => {
  return (
    <ApolloProvider client={client}>
      <AppLayoutLoader {...props} />
    </ApolloProvider>
  );
};

AppLayout.propTypes = {
  name: PropTypes.string,
  sidebar: PropTypes.element,
  header: PropTypes.element,
  main: PropTypes.element,
  aside: PropTypes.element,
  asideCollapsed: PropTypes.bool,
  headerData: PropTypes.shape({
    back: PropTypes.string,
    title: PropTypes.string
  }), // has to be filled in already

  noGeneralSearch: PropTypes.bool
};

export default AppWithProvider;
